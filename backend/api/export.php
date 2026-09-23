<?php
// =============================================================================
// RadballHub - Admin Backup & Katalog-Export Controller
// =============================================================================

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/exercises.php';

function handleExportZip(): void {
    $currentUser = getAuthenticatedUser();
    if (!$currentUser || $currentUser['role'] !== 'admin') {
        jsonError('Zugriff verweigert: Nur Administratoren dürfen Datensicherungen exportieren.', 403);
    }

    $db = getDbConnection();

    // Time-Limit defensiv anpassen für Shared Hosting
    @set_time_limit(300);

    // Output-Buffer leeren
    while (ob_get_level() > 0) {
        ob_end_clean();
    }

    $timestamp = date('Y-m-d_His');
    $zipFilename = "radballhub_katalog_backup_{$timestamp}.zip";

    // 1. Alle freigegebenen Übungen laden
    $stmt = $db->query("
        SELECT id, title, slug, author_name, category, duration_minutes, material, description, image_path, video_url, status, created_at
        FROM exercises
        ORDER BY id ASC
    ");
    $exercisesRaw = $stmt->fetchAll();

    $exportList = [];
    $mediaFilesToInclude = [];

    foreach ($exercisesRaw as $row) {
        $detail = formatExerciseRow($db, $row);
        $exportList[] = [
            'id'               => $detail['id'],
            'title'            => $detail['title'],
            'slug'             => $detail['slug'],
            'author'           => $detail['author_name'] ?: 'k. A.',
            'category'         => $detail['category'],
            'duration_minutes' => $detail['duration_minutes'],
            'material'         => $detail['material'],
            'description'      => $detail['description'],
            'video_url'        => $detail['video_url'],
            'status'           => $detail['status'],
            'age_groups'       => array_column($detail['age_groups'], 'label'),
            'muscle_groups'    => array_map(fn($m) => ['name' => $m['name'], 'intensity' => $m['intensity']], $detail['muscle_groups']),
            'circuit'          => $detail['circuit'],
            'image_filename'   => $detail['image_path'] ? basename($detail['image_path']) : null,
        ];

        if ($detail['image_path']) {
            $realImagePath = UPLOAD_DIR . basename($detail['image_path']);
            if (file_exists($realImagePath) && is_readable($realImagePath)) {
                $mediaFilesToInclude[basename($detail['image_path'])] = $realImagePath;
            }
        }
    }

    // 2. Temporäre ZIP-Datei anlegen
    $tempZipPath = tempnam(sys_get_temp_dir(), 'radball_backup_');
    $zip = new ZipArchive();

    if ($zip->open($tempZipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
        jsonError('Konnte temporäres ZIP-Archiv nicht erstellen', 500);
    }

    // JSON-Export hinzufügen
    $jsonContent = json_encode([
        'export_info' => [
            'platform'       => 'RadballHub Trainingsplattform',
            'version'        => '1.0',
            'exported_at'    => date('c'),
            'total_exercises'=> count($exportList),
        ],
        'exercises'   => $exportList,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $zip->addFromString('exercises.json', $jsonContent);

    // CSV-Export hinzufügen
    $csvBuffer = fopen('php://temp', 'r+');
    fputcsv($csvBuffer, ['ID', 'Titel', 'Autor', 'Kategorie', 'Dauer (Min)', 'Altersklassen', 'Muskelgruppen', 'Bilddatei']);
    foreach ($exportList as $item) {
        fputcsv($csvBuffer, [
            $item['id'],
            $item['title'],
            $item['author'],
            $item['category'],
            $item['duration_minutes'],
            implode(', ', $item['age_groups']),
            implode(', ', array_column($item['muscle_groups'], 'name')),
            $item['image_filename'] ?? 'keins',
        ]);
    }
    rewind($csvBuffer);
    $csvContent = stream_get_contents($csvBuffer);
    fclose($csvBuffer);
    $zip->addFromString('exercises.csv', $csvContent);

    // Bilddateien hinzufügen
    foreach ($mediaFilesToInclude as $localName => $filePath) {
        $zip->addFile($filePath, 'media/' . $localName);
    }

    $zip->close();

    // 3. Archiv an den Browser streamen
    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="' . $zipFilename . '"');
    header('Content-Length: ' . filesize($tempZipPath));
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');

    $fp = fopen($tempZipPath, 'rb');
    if ($fp) {
        while (!feof($fp)) {
            echo fread($fp, 65536); // In 64KB Chunks streamen
            flush();
        }
        fclose($fp);
    }

    @unlink($tempZipPath);
    exit;
}

/**
 * Übungskatalog aus Sicherung importieren (Nur Admin)
 */
function handleImportBackup(array $requestData): void {
    $currentUser = getAuthenticatedUser();
    if (!$currentUser || $currentUser['role'] !== 'admin') {
        jsonError('Zugriff verweigert: Nur Administratoren dürfen Datensicherungen importieren.', 403);
    }

    $db = getDbConnection();

    $exercises = [];
    if (!empty($_FILES['backup_file']['tmp_name'])) {
        $fileContent = file_get_contents($_FILES['backup_file']['tmp_name']);
        $parsed = json_decode($fileContent, true);
        $exercises = $parsed['exercises'] ?? [];
    } elseif (!empty($requestData['exercises']) && is_array($requestData['exercises'])) {
        $exercises = $requestData['exercises'];
    }

    if (empty($exercises)) {
        jsonError('Keine gültigen Übungsdaten in der Sicherungsdatei gefunden.', 422);
    }

    $importedCount = 0;
    $db->beginTransaction();
    try {
        foreach ($exercises as $ex) {
            $title = trim($ex['title'] ?? '');
            if (empty($title)) continue;

            $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title))) . '-' . substr(uniqid(), -4);
            $author = !empty($ex['author']) && $ex['author'] !== 'k. A.' ? trim($ex['author']) : (!empty($ex['author_name']) ? trim($ex['author_name']) : null);
            $cat = in_array($ex['category'] ?? '', ['technik', 'taktik', 'kondition', 'ausdauer', 'home_workout', 'zirkel'], true) ? $ex['category'] : 'technik';
            $duration = (int)($ex['duration_minutes'] ?? 5);
            $material = trim($ex['material'] ?? '');
            $desc = trim($ex['description'] ?? '');
            $imagePath = $ex['image_path'] ?? null;
            $videoUrl = $ex['video_url'] ?? null;

            $stmt = $db->prepare("
                INSERT INTO exercises (
                    title, slug, author_name, category, duration_minutes,
                    material, description, image_path, video_url, status, created_by_user_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)
            ");
            $stmt->execute([
                $title, $slug, $author, $cat, $duration,
                $material, $desc, $imagePath, $videoUrl, $currentUser['id']
            ]);
            $newExerciseId = (int)$db->lastInsertId();

            // Altersklassen zuordnen
            if (!empty($ex['age_groups']) && is_array($ex['age_groups'])) {
                foreach ($ex['age_groups'] as $ag) {
                    $agLabel = is_array($ag) ? ($ag['label'] ?? '') : $ag;
                    $findAg = $db->prepare("SELECT id FROM age_groups WHERE label = ? OR code = ? LIMIT 1");
                    $findAg->execute([$agLabel, $agLabel]);
                    $agId = $findAg->fetchColumn();
                    if ($agId) {
                        $db->prepare("INSERT IGNORE INTO exercise_age_group_assignments (exercise_id, age_group_id) VALUES (?, ?)")
                           ->execute([$newExerciseId, $agId]);
                    }
                }
            }

            // Muskelgruppen zuordnen
            if (!empty($ex['muscle_groups']) && is_array($ex['muscle_groups'])) {
                foreach ($ex['muscle_groups'] as $mg) {
                    $mgName = is_array($mg) ? ($mg['name'] ?? '') : $mg;
                    $intensity = is_array($mg) ? ($mg['intensity'] ?? 'primary') : 'primary';
                    $findMg = $db->prepare("SELECT id FROM muscle_groups WHERE name LIKE ? OR code = ? LIMIT 1");
                    $findMg->execute(['%' . $mgName . '%', $mgName]);
                    $mgId = $findMg->fetchColumn();
                    if ($mgId) {
                        $db->prepare("INSERT IGNORE INTO exercise_muscle_group (exercise_id, muscle_group_id, intensity) VALUES (?, ?, ?)")
                           ->execute([$newExerciseId, $mgId, $intensity]);
                    }
                }
            }

            // Zirkel
            if (!empty($ex['circuit']) && is_array($ex['circuit'])) {
                $c = $ex['circuit'];
                $db->prepare("
                    INSERT INTO exercise_circuits (exercise_id, work_duration_seconds, pause_duration_seconds, rounds, station_number, setup_notes)
                    VALUES (?, ?, ?, ?, ?, ?)
                ")->execute([
                    $newExerciseId,
                    (int)($c['work_duration_seconds'] ?? 45),
                    (int)($c['pause_duration_seconds'] ?? 15),
                    (int)($c['rounds'] ?? 3),
                    $c['station_number'] ?? null,
                    $c['setup_notes'] ?? null,
                ]);
            }

            $importedCount++;
        }
        $db->commit();

        jsonResponse([
            'success'  => true,
            'message'  => "Erfolgreich {$importedCount} Übungen importiert.",
            'imported' => $importedCount,
        ]);
    } catch (\Throwable $e) {
        $db->rollBack();
        jsonError('Fehler beim Importieren: ' . $e->getMessage(), 500);
    }
}
