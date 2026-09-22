<?php
// =============================================================================
// RadballHub - Admin Backup & Katalog-Export Controller
// =============================================================================

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/exercises.php';

function handleExportZip(): void {
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
