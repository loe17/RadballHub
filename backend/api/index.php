<?php
// =============================================================================
// RadballHub - Zentraler REST API Router
// =============================================================================

require_once __DIR__ . '/config.php';
handleCors();

// Request URI und Methode parsen
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Pfad bereinigen (Präfix /api/ entfernen)
$path = preg_replace('#^/api/?#', '', $uri);
$segments = explode('/', trim($path, '/'));
$resource = $segments[0] ?? '';
$subResource = $segments[1] ?? null;
$action = $segments[2] ?? null;

// JSON-Body bei POST/PUT parsen
$rawInput = file_get_contents('php://input');
$requestData = [];
if (!empty($rawInput)) {
    $requestData = json_decode($rawInput, true) ?? [];
}
// Auch reguläre Form-Daten einbeziehen (z. B. bei multipart/form-data)
$requestData = array_merge($requestData, $_POST);

try {
    switch ($resource) {
        case 'meta':
            // Metadaten für Dropdowns (Altersklassen & Muskelgruppen)
            $db = getDbConnection();
            $ageGroups = $db->query("SELECT id, code, label, sort_order FROM age_groups ORDER BY sort_order ASC")->fetchAll();
            $muscleGroups = $db->query("SELECT id, code, name, body_region, sort_order FROM muscle_groups ORDER BY sort_order ASC")->fetchAll();
            jsonResponse([
                'success'      => true,
                'age_groups'   => $ageGroups,
                'muscle_groups'=> $muscleGroups,
            ]);
            break;

        case 'exercises':
            require_once __DIR__ . '/exercises.php';
            handleExercisesRoute($method, $subResource, $action, $requestData);
            break;

        case 'training-plans':
            require_once __DIR__ . '/training-plans.php';
            handleTrainingPlansRoute($method, $subResource, $action, $requestData);
            break;

        case 'feedback':
            require_once __DIR__ . '/feedback.php';
            handleFeedbackRoute($method, $requestData);
            break;

        case 'auth':
            require_once __DIR__ . '/auth.php';
            break;

        case 'admin':
            if ($subResource === 'export-zip') {
                require_once __DIR__ . '/export.php';
                handleExportZip();
            } elseif ($subResource === 'import-backup') {
                require_once __DIR__ . '/export.php';
                handleImportBackup($requestData);
            } else {
                jsonError('Unbekannte Admin-Aktion', 404);
            }
            break;

        case 'health':
            jsonResponse([
                'status'    => 'ok',
                'timestamp' => date('c'),
                'php'       => PHP_VERSION,
                'system'    => 'RadballHub API auf Netcup Webhosting',
            ]);
            break;

        default:
            jsonError('Endpunkt nicht gefunden: /api/' . $path, 404);
    }
} catch (\PDOException $e) {
    // In Produktion keine sensiblen DB-Fehler nach außen geben
    error_log('Database error: ' . $e->getMessage());
    jsonError('Datenbankfehler aufgetreten', 500, ['message' => $e->getMessage()]);
} catch (\Throwable $e) {
    error_log('General error: ' . $e->getMessage());
    jsonError('Interner Serverfehler', 500, ['message' => $e->getMessage()]);
}
