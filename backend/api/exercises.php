<?php
// =============================================================================
// RadballHub - Übungen Controller
// =============================================================================

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/mailer.php';

function handleExercisesRoute(string $method, ?string $idOrAction, ?string $subAction, array $data): void {
    $db = getDbConnection();

    // 1. Spezifische Übungsaktionen (z. B. /api/exercises/{id}/status)
    if ($idOrAction && is_numeric($idOrAction)) {
        $exerciseId = (int)$idOrAction;

        if ($subAction === 'status' && $method === 'PUT') {
            // Moderation: Status ändern (approved / rejected)
            $newStatus = $data['status'] ?? '';
            $reason = $data['rejection_reason'] ?? null;
            if (!in_array($newStatus, ['approved', 'rejected', 'pending_review', 'draft'])) {
                jsonError('Ungültiger Status', 422);
            }

            $stmt = $db->prepare("UPDATE exercises SET status = ?, rejection_reason = ?, reviewed_at = NOW() WHERE id = ?");
            $stmt->execute([$newStatus, $reason, $exerciseId]);

            // Benachrichtigung an Ersteller senden
            $stmtEx = $db->prepare("SELECT e.title, u.email, u.name FROM exercises e JOIN users u ON e.created_by_user_id = u.id WHERE e.id = ?");
            $stmtEx->execute([$exerciseId]);
            $author = $stmtEx->fetch();
            if ($author) {
                sendStatusNotificationEmail($author['email'], $author['name'], $author['title'], $newStatus, $reason);
            }

            jsonResponse(['success' => true, 'message' => "Status erfolgreich auf '$newStatus' aktualisiert."]);
        }

        if ($method === 'GET') {
            // Einzelne Übung abrufen (inklusive Relationen)
            $exercise = fetchExerciseDetail($db, $exerciseId);
            if (!$exercise) {
                jsonError('Übung nicht gefunden', 404);
            }
            jsonResponse(['success' => true, 'exercise' => $exercise]);
        }
    }

    // 2. Liste aller Übungen (GET /api/exercises)
    if ($method === 'GET' && !$idOrAction) {
        $category = $_GET['category'] ?? null;
        $ageGroup = $_GET['age_group'] ?? null;
        $muscleGroup = $_GET['muscle_group'] ?? null;
        $author = $_GET['author'] ?? null;
        $search = $_GET['search'] ?? null;
        $status = $_GET['status'] ?? 'approved'; // Standard: Nur freigegebene

        $sql = "
            SELECT DISTINCT
                e.id, e.title, e.slug, e.author_name, e.category, e.duration_minutes, 
                e.material, e.description, e.image_path, e.video_url, e.status, e.created_at,
                c.work_duration_seconds, c.pause_duration_seconds, c.rounds, c.station_number, c.setup_notes
            FROM exercises e
            LEFT JOIN exercise_circuits c ON e.id = c.exercise_id
            LEFT JOIN exercise_age_group_assignments eag ON e.id = eag.exercise_id
            LEFT JOIN age_groups ag ON eag.age_group_id = ag.id
            LEFT JOIN exercise_muscle_group emg ON e.id = emg.exercise_id
            LEFT JOIN muscle_groups mg ON emg.muscle_group_id = mg.id
            WHERE 1=1
        ";

        $params = [];

        if ($status !== 'all') {
            $sql .= " AND e.status = ?";
            $params[] = $status;
        }

        if ($category) {
            $sql .= " AND e.category = ?";
            $params[] = $category;
        }

        if ($author) {
            $sql .= " AND e.author_name LIKE ?";
            $params[] = '%' . $author . '%';
        }

        if ($ageGroup) {
            $sql .= " AND (ag.code = ? OR ag.label = ?)";
            $params[] = $ageGroup;
            $params[] = $ageGroup;
        }

        if ($muscleGroup) {
            $sql .= " AND (mg.code = ? OR mg.name LIKE ?)";
            $params[] = $muscleGroup;
            $params[] = '%' . $muscleGroup . '%';
        }

        if ($search) {
            $sql .= " AND (e.title LIKE ? OR e.description LIKE ? OR e.material LIKE ? OR e.author_name LIKE ?)";
            $searchTerm = '%' . $search . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $sql .= " ORDER BY e.id DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rawRows = $stmt->fetchAll();

        // Übungen mit Relationen anreichern
        $exercises = [];
        foreach ($rawRows as $row) {
            $exercises[] = formatExerciseRow($db, $row);
        }

        jsonResponse([
            'success'   => true,
            'count'     => count($exercises),
            'exercises' => $exercises,
        ]);
    }

    // 3. Neue Übung einreichen (POST /api/exercises)
    if ($method === 'POST' && !$idOrAction) {
        $title = trim($data['title'] ?? '');
        $category = $data['category'] ?? '';
        $durationMinutes = (int)($data['duration_minutes'] ?? 5);
        $material = trim($data['material'] ?? '');
        $description = trim($data['description'] ?? '');
        $authorName = trim($data['author_name'] ?? '') ?: null; // Optionaler Autor
        $videoUrl = trim($data['video_url'] ?? '') ?: null;

        $authUser = getAuthenticatedUser();
        $userId = $authUser ? $authUser['id'] : (int)($data['user_id'] ?? 1);
        $status = ($authUser && $authUser['role'] === 'admin') ? 'approved' : 'pending_review';

        if (empty($title) || empty($category) || empty($description)) {
            jsonError('Titel, Kategorie und Beschreibung sind Pflichtfelder', 422);
        }

        if (!in_array($category, ['technik', 'taktik', 'kondition', 'ausdauer', 'home_workout', 'zirkel'], true)) {
            jsonError('Ungültige Kategorie angegeben', 422);
        }

        // WebP-Bilduploads verarbeiten
        $mediaList = [];
        $primaryImagePath = null;

        // Einzelnes Hauptbild (Fallback / klassisch)
        if (!empty($_FILES['image']) && is_uploaded_file($_FILES['image']['tmp_name'])) {
            $filename = convertAndSaveWebP($_FILES['image'], UPLOAD_DIR);
            if ($filename) {
                $primaryImagePath = PUBLIC_UPLOAD_URI . $filename;
                $mediaList[] = [
                    'type'       => 'image',
                    'url'        => $primaryImagePath,
                    'sort_order' => 0,
                ];
            }
        }

        // Mehrfache Bilder verarbeiten falls vorhanden
        if (!empty($_FILES['images']) && is_array($_FILES['images']['name'])) {
            $numFiles = count($_FILES['images']['name']);
            for ($i = 0; $i < $numFiles; $i++) {
                if (!empty($_FILES['images']['tmp_name'][$i]) && is_uploaded_file($_FILES['images']['tmp_name'][$i])) {
                    $fileItem = [
                        'name'     => $_FILES['images']['name'][$i],
                        'type'     => $_FILES['images']['type'][$i],
                        'tmp_name' => $_FILES['images']['tmp_name'][$i],
                        'error'    => $_FILES['images']['error'][$i],
                        'size'     => $_FILES['images']['size'][$i],
                    ];
                    $fn = convertAndSaveWebP($fileItem, UPLOAD_DIR);
                    if ($fn) {
                        $p = PUBLIC_UPLOAD_URI . $fn;
                        if (!$primaryImagePath) {
                            $primaryImagePath = $p;
                        }
                        $mediaList[] = [
                            'type'       => 'image',
                            'url'        => $p,
                            'sort_order' => count($mediaList),
                        ];
                    }
                }
            }
        }

        // Videos verarbeiten (einzeln oder mehrere)
        if (!empty($data['videos'])) {
            $videos = is_array($data['videos']) ? $data['videos'] : json_decode($data['videos'], true);
            if (is_array($videos)) {
                foreach ($videos as $vUrl) {
                    $vUrl = trim($vUrl);
                    if ($vUrl) {
                        $mediaList[] = [
                            'type'       => 'video',
                            'url'        => $vUrl,
                            'sort_order' => count($mediaList),
                        ];
                    }
                }
            }
        } elseif ($videoUrl) {
            $mediaList[] = [
                'type'       => 'video',
                'url'        => $videoUrl,
                'sort_order' => count($mediaList),
            ];
        }

        // Medien-Reihenfolge anpassen falls vom Client übergeben
        if (!empty($data['media_order'])) {
            $orderMap = is_array($data['media_order']) ? $data['media_order'] : json_decode($data['media_order'], true);
            if (is_array($orderMap)) {
                foreach ($mediaList as &$mItem) {
                    if (isset($orderMap[$mItem['url']])) {
                        $mItem['sort_order'] = (int)$orderMap[$mItem['url']];
                    }
                }
                unset($mItem);
                usort($mediaList, fn($a, $b) => $a['sort_order'] <=> $b['sort_order']);
                // Das erste Element nach Sortierung bestimmt das Thumbnail
                if (!empty($mediaList) && $mediaList[0]['type'] === 'image') {
                    $primaryImagePath = $mediaList[0]['url'];
                }
            }
        }

        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title))) . '-' . substr(uniqid(), -4);

        $db->beginTransaction();
        try {
            $stmt = $db->prepare("
                INSERT INTO exercises (
                    title, slug, author_name, category, duration_minutes, material, 
                    description, image_path, video_url, status, created_by_user_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $title, $slug, $authorName, $category, $durationMinutes, 
                $material, $description, $primaryImagePath, $videoUrl, $status, $userId
            ]);
            $exerciseId = (int)$db->lastInsertId();

            // Medien in exercise_media speichern
            $stmtMedia = $db->prepare("
                INSERT INTO exercise_media (exercise_id, type, url, sort_order)
                VALUES (?, ?, ?, ?)
            ");
            foreach ($mediaList as $idx => $m) {
                $stmtMedia->execute([$exerciseId, $m['type'], $m['url'], $m['sort_order'] ?? $idx]);
            }

            // Zirkel-Metadaten speichern falls Kategorie Zirkel
            if ($category === 'zirkel' && !empty($data['circuit'])) {
                $circuit = is_array($data['circuit']) ? $data['circuit'] : json_decode($data['circuit'], true);
                $stmtC = $db->prepare("
                    INSERT INTO exercise_circuits (
                        exercise_id, work_duration_seconds, pause_duration_seconds, 
                        rounds, station_number, setup_notes
                    ) VALUES (?, ?, ?, ?, ?, ?)
                ");
                $stmtC->execute([
                    $exerciseId,
                    (int)($circuit['work_duration_seconds'] ?? 45),
                    (int)($circuit['pause_duration_seconds'] ?? 15),
                    (int)($circuit['rounds'] ?? 3),
                    $circuit['station_number'] ?? null,
                    $circuit['setup_notes'] ?? null,
                ]);
            }

            // Altersgruppen verknüpfen
            if (!empty($data['age_group_ids'])) {
                $ageGroupIds = is_array($data['age_group_ids']) ? $data['age_group_ids'] : json_decode($data['age_group_ids'], true);
                $stmtAg = $db->prepare("INSERT INTO exercise_age_group_assignments (exercise_id, age_group_id) VALUES (?, ?)");
                foreach ($ageGroupIds as $agId) {
                    $stmtAg->execute([$exerciseId, (int)$agId]);
                }
            }

            // Muskelgruppen verknüpfen
            if (!empty($data['muscle_groups'])) {
                $muscleGroups = is_array($data['muscle_groups']) ? $data['muscle_groups'] : json_decode($data['muscle_groups'], true);
                $stmtMg = $db->prepare("INSERT INTO exercise_muscle_group (exercise_id, muscle_group_id, intensity) VALUES (?, ?, ?)");
                foreach ($muscleGroups as $mg) {
                    $stmtMg->execute([$exerciseId, (int)$mg['id'], $mg['intensity'] ?? 'primary']);
                }
            }

            $db->commit();

            // Admin per Mail über neue Einreichung informieren (falls pending)
            if ($status === 'pending_review') {
                sendAdminNewSubmissionEmail($title, $exerciseId, $authorName);
            }

            jsonResponse([
                'success' => true,
                'message' => $status === 'approved' ? 'Übung erfolgreich gespeichert und veröffentlicht!' : 'Übung erfolgreich eingereicht! Sie befindet sich nun in Moderation.',
                'id'      => $exerciseId,
            ], 201);
        } catch (\Throwable $t) {
            $db->rollBack();
            throw $t;
        }
    }

    jsonError('Aktion nicht unterstützt', 405);
}

function fetchExerciseDetail(PDO $db, int $id): ?array {
    $stmt = $db->prepare("
        SELECT 
            e.id, e.title, e.slug, e.author_name, e.category, e.duration_minutes, 
            e.material, e.description, e.image_path, e.video_url, e.status, e.created_at,
            c.work_duration_seconds, c.pause_duration_seconds, c.rounds, c.station_number, c.setup_notes
        FROM exercises e
        LEFT JOIN exercise_circuits c ON e.id = c.exercise_id
        WHERE e.id = ?
    ");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ? formatExerciseRow($db, $row) : null;
}

function formatExerciseRow(PDO $db, array $row): array {
    $id = (int)$row['id'];

    // Altersklassen
    $stmtAg = $db->prepare("
        SELECT ag.id, ag.code, ag.label, ag.sort_order 
        FROM age_groups ag
        JOIN exercise_age_group_assignments eag ON ag.id = eag.age_group_id
        WHERE eag.exercise_id = ?
        ORDER BY ag.sort_order ASC
    ");
    $stmtAg->execute([$id]);
    $ageGroups = $stmtAg->fetchAll();

    // Muskelgruppen
    $stmtMg = $db->prepare("
        SELECT mg.id, mg.code, mg.name, mg.body_region, emg.intensity
        FROM muscle_groups mg
        JOIN exercise_muscle_group emg ON mg.id = emg.muscle_group_id
        WHERE emg.exercise_id = ?
        ORDER BY emg.intensity ASC, mg.sort_order ASC
    ");
    $stmtMg->execute([$id]);
    $muscleGroups = $stmtMg->fetchAll();

    $circuit = null;
    if ($row['category'] === 'zirkel' || $row['work_duration_seconds'] !== null) {
        $circuit = [
            'work_duration_seconds'  => (int)$row['work_duration_seconds'],
            'pause_duration_seconds' => (int)$row['pause_duration_seconds'],
            'rounds'                 => (int)$row['rounds'],
            'station_number'         => $row['station_number'],
            'setup_notes'            => $row['setup_notes'],
        ];
    }

    // Medien abrufen (Bilder & Videos)
    $stmtMedia = $db->prepare("
        SELECT id, type, url, sort_order, caption
        FROM exercise_media
        WHERE exercise_id = ?
        ORDER BY sort_order ASC, id ASC
    ");
    $stmtMedia->execute([$id]);
    $media = $stmtMedia->fetchAll();

    // Fallback: Falls noch keine Einträge in exercise_media existieren
    if (empty($media)) {
        if (!empty($row['image_path'])) {
            $media[] = [
                'id'         => 0,
                'type'       => 'image',
                'url'        => $row['image_path'],
                'sort_order' => 0,
                'caption'    => null,
            ];
        }
        if (!empty($row['video_url'])) {
            $media[] = [
                'id'         => 0,
                'type'       => 'video',
                'url'        => $row['video_url'],
                'sort_order' => 1,
                'caption'    => null,
            ];
        }
    }

    return [
        'id'               => $id,
        'title'            => $row['title'],
        'slug'             => $row['slug'],
        'author_name'      => $row['author_name'],
        'category'         => $row['category'],
        'duration_minutes' => (int)$row['duration_minutes'],
        'material'         => $row['material'],
        'description'      => $row['description'],
        'image_path'       => $row['image_path'],
        'video_url'        => $row['video_url'],
        'media'            => $media,
        'status'           => $row['status'],
        'created_at'       => $row['created_at'],
        'circuit'          => $circuit,
        'age_groups'       => $ageGroups,
        'muscle_groups'    => $muscleGroups,
    ];
}
