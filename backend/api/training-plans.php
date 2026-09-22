<?php
// =============================================================================
// RadballHub - Trainingspläne Controller (Multi-Plan Account-Verwaltung)
// =============================================================================

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/exercises.php';

function handleTrainingPlansRoute(string $method, ?string $idOrAction, ?string $subAction, array $data): void {
    $db = getDbConnection();
    $userId = (int)($data['user_id'] ?? $_GET['user_id'] ?? 1); // Aus Auth-Token

    // 1. Aktionen auf konkretem Plan (/api/training-plans/{id})
    if ($idOrAction && is_numeric($idOrAction)) {
        $planId = (int)$idOrAction;

        // Duplizieren: POST /api/training-plans/{id}/duplicate
        if ($subAction === 'duplicate' && $method === 'POST') {
            $newPlanId = duplicateTrainingPlan($db, $planId, $userId);
            jsonResponse([
                'success' => true,
                'message' => 'Trainingsplan erfolgreich dupliziert.',
                'id'      => $newPlanId,
            ], 201);
        }

        // Details abrufen: GET /api/training-plans/{id}
        if ($method === 'GET') {
            $plan = fetchTrainingPlanDetail($db, $planId, $userId);
            if (!$plan) {
                jsonError('Trainingsplan nicht gefunden', 404);
            }

            // Timestamp aktualisieren (wurde gerade geladen)
            $db->prepare("UPDATE training_plans SET last_used_at = NOW() WHERE id = ?")->execute([$planId]);

            jsonResponse(['success' => true, 'plan' => $plan]);
        }

        // Aktualisieren: PUT /api/training-plans/{id}
        if ($method === 'PUT') {
            $title = trim($data['title'] ?? '');
            if (empty($title)) {
                jsonError('Der Trainingsplan benötigt einen Namen', 422);
            }

            $description = $data['description'] ?? null;
            $isFavorite = isset($data['is_favorite']) ? (int)(bool)$data['is_favorite'] : null;
            $defaultPause = (int)($data['default_pause_between_exercises_seconds'] ?? 60);

            $db->beginTransaction();
            try {
                $sql = "UPDATE training_plans SET title = ?, description = ?, default_pause_between_exercises_seconds = ?, last_used_at = NOW()";
                $params = [$title, $description, $defaultPause];

                if ($isFavorite !== null) {
                    $sql .= ", is_favorite = ?";
                    $params[] = $isFavorite;
                }
                $sql .= " WHERE id = ? AND user_id = ?";
                $params[] = $planId;
                $params[] = $userId;

                $stmt = $db->prepare($sql);
                $stmt->execute($params);

                // Falls Items mitgeliefert wurden, ersetzen
                if (isset($data['items']) && is_array($data['items'])) {
                    $db->prepare("DELETE FROM training_plan_items WHERE training_plan_id = ?")->execute([$planId]);
                    insertPlanItems($db, $planId, $data['items']);
                }

                $db->commit();
                jsonResponse(['success' => true, 'message' => 'Trainingsplan erfolgreich aktualisiert.']);
            } catch (\Throwable $t) {
                $db->rollBack();
                throw $t;
            }
        }

        // Löschen: DELETE /api/training-plans/{id}
        if ($method === 'DELETE') {
            $stmt = $db->prepare("DELETE FROM training_plans WHERE id = ? AND user_id = ?");
            $stmt->execute([$planId, $userId]);
            if ($stmt->rowCount() === 0) {
                jsonError('Trainingsplan nicht gefunden oder keine Berechtigung', 404);
            }
            jsonResponse(['success' => true, 'message' => 'Trainingsplan gelöscht.']);
        }
    }

    // 2. Liste aller Pläne des Nutzers (GET /api/training-plans)
    if ($method === 'GET' && !$idOrAction) {
        $stmt = $db->prepare("
            SELECT 
                tp.id, tp.title, tp.description, tp.is_favorite, 
                tp.default_pause_between_exercises_seconds, tp.last_used_at, 
                tp.created_at, tp.updated_at,
                COUNT(tpi.id) AS total_exercises,
                COALESCE(SUM(COALESCE(tpi.custom_duration_minutes, e.duration_minutes)), 0) AS total_exercise_minutes,
                COALESCE(SUM(COALESCE(tpi.custom_pause_seconds, tp.default_pause_between_exercises_seconds)), 0) AS total_pause_seconds
            FROM training_plans tp
            LEFT JOIN training_plan_items tpi ON tp.id = tpi.training_plan_id
            LEFT JOIN exercises e ON tpi.exercise_id = e.id
            WHERE tp.user_id = ?
            GROUP BY tp.id
            ORDER BY tp.is_favorite DESC, COALESCE(tp.last_used_at, tp.updated_at) DESC
        ");
        $stmt->execute([$userId]);
        $plans = $stmt->fetchAll();

        jsonResponse([
            'success' => true,
            'count'   => count($plans),
            'plans'   => $plans,
        ]);
    }

    // 3. Neuen Plan anlegen (POST /api/training-plans)
    if ($method === 'POST' && !$idOrAction) {
        $title = trim($data['title'] ?? '');
        if (empty($title)) {
            jsonError('Bitte gib dem Trainingsplan einen Namen (z. B. "Dienstags-Training")', 422);
        }

        $description = trim($data['description'] ?? '');
        $defaultPause = (int)($data['default_pause_between_exercises_seconds'] ?? 60);
        $isFavorite = !empty($data['is_favorite']) ? 1 : 0;
        $items = $data['items'] ?? [];

        $db->beginTransaction();
        try {
            $stmt = $db->prepare("
                INSERT INTO training_plans (user_id, title, description, is_favorite, default_pause_between_exercises_seconds, last_used_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([$userId, $title, $description ?: null, $isFavorite, $defaultPause]);
            $newPlanId = (int)$db->lastInsertId();

            if (!empty($items) && is_array($items)) {
                insertPlanItems($db, $newPlanId, $items);
            }

            $db->commit();
            jsonResponse([
                'success' => true,
                'message' => "Trainingsplan '$title' erfolgreich gespeichert.",
                'id'      => $newPlanId,
            ], 201);
        } catch (\Throwable $t) {
            $db->rollBack();
            throw $t;
        }
    }

    jsonError('Aktion nicht unterstützt', 405);
}

function insertPlanItems(PDO $db, int $planId, array $items): void {
    $stmt = $db->prepare("
        INSERT INTO training_plan_items (
            training_plan_id, exercise_id, sort_order, 
            custom_duration_minutes, custom_pause_seconds, custom_notes
        ) VALUES (?, ?, ?, ?, ?, ?)
    ");

    $order = 1;
    foreach ($items as $item) {
        $exerciseId = (int)($item['exercise_id'] ?? $item['id'] ?? 0);
        if ($exerciseId > 0) {
            $stmt->execute([
                $planId,
                $exerciseId,
                $order++,
                !empty($item['custom_duration_minutes']) ? (int)$item['custom_duration_minutes'] : null,
                isset($item['custom_pause_seconds']) ? (int)$item['custom_pause_seconds'] : null,
                $item['custom_notes'] ?? null,
            ]);
        }
    }
}

function fetchTrainingPlanDetail(PDO $db, int $planId, int $userId): ?array {
    $stmt = $db->prepare("SELECT * FROM training_plans WHERE id = ? AND user_id = ?");
    $stmt->execute([$planId, $userId]);
    $plan = $stmt->fetch();
    if (!$plan) {
        return null;
    }

    // Geordnete Items mit Übungsdetails laden
    $stmtItems = $db->prepare("
        SELECT 
            tpi.id AS item_id, tpi.sort_order, tpi.custom_duration_minutes, 
            tpi.custom_pause_seconds, tpi.custom_notes,
            e.id AS exercise_id, e.title, e.slug, e.author_name, e.category, e.duration_minutes,
            e.material, e.description, e.image_path, e.video_url
        FROM training_plan_items tpi
        JOIN exercises e ON tpi.exercise_id = e.id
        WHERE tpi.training_plan_id = ?
        ORDER BY tpi.sort_order ASC
    ");
    $stmtItems->execute([$planId]);
    $items = $stmtItems->fetchAll();

    $enrichedItems = [];
    foreach ($items as $item) {
        $exercise = fetchExerciseDetail($db, (int)$item['exercise_id']);
        $enrichedItems[] = [
            'item_id'                => (int)$item['item_id'],
            'sort_order'             => (int)$item['sort_order'],
            'custom_duration_minutes'=> $item['custom_duration_minutes'] ? (int)$item['custom_duration_minutes'] : null,
            'custom_pause_seconds'   => $item['custom_pause_seconds'] !== null ? (int)$item['custom_pause_seconds'] : null,
            'custom_notes'           => $item['custom_notes'],
            'exercise'               => $exercise,
        ];
    }

    $plan['items'] = $enrichedItems;
    return $plan;
}

function duplicateTrainingPlan(PDO $db, int $sourcePlanId, int $userId): int {
    $source = fetchTrainingPlanDetail($db, $sourcePlanId, $userId);
    if (!$source) {
        jsonError('Quellplan nicht gefunden', 404);
    }

    $newTitle = 'Kopie von ' . $source['title'];

    $db->beginTransaction();
    try {
        $stmt = $db->prepare("
            INSERT INTO training_plans (user_id, title, description, is_favorite, default_pause_between_exercises_seconds, last_used_at)
            VALUES (?, ?, ?, 0, ?, NOW())
        ");
        $stmt->execute([$userId, $newTitle, $source['description'], $source['default_pause_between_exercises_seconds']]);
        $newPlanId = (int)$db->lastInsertId();

        $itemsToInsert = [];
        foreach ($source['items'] as $item) {
            $itemsToInsert[] = [
                'exercise_id'             => $item['exercise']['id'],
                'custom_duration_minutes' => $item['custom_duration_minutes'],
                'custom_pause_seconds'    => $item['custom_pause_seconds'],
                'custom_notes'            => $item['custom_notes'],
            ];
        }

        insertPlanItems($db, $newPlanId, $itemsToInsert);
        $db->commit();
        return $newPlanId;
    } catch (\Throwable $t) {
        $db->rollBack();
        throw $t;
    }
}
