<?php
// =============================================================================
// RadballHub - Authentifizierung & Benutzerverwaltung API
// =============================================================================

require_once __DIR__ . '/config.php';
handleCors();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$db = getDbConnection();

// JSON Body auslesen falls vorhanden
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?: [];

// 1. GET /api/auth.php?action=me
if ($method === 'GET' && $action === 'me') {
    $user = getAuthenticatedUser();
    jsonResponse([
        'success' => true,
        'user'    => $user,
    ]);
}

// 2. POST /api/auth.php?action=login
if ($method === 'POST' && $action === 'login') {
    $login = trim($data['login'] ?? $data['email'] ?? '');
    $password = $data['password'] ?? '';

    if (empty($login) || empty($password)) {
        jsonError('Bitte E-Mail / Benutzername und Passwort eingeben', 422);
    }

    $stmt = $db->prepare("SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = ? OR name = ? LIMIT 1");
    $stmt->execute([$login, $login]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        jsonError('Ungültige Anmeldedaten. Bitte prüfen Sie Ihre Eingaben.', 401);
    }

    if (empty($user['is_active'])) {
        jsonError('Dieses Benutzerkonto ist derzeit deaktiviert.', 403);
    }

    startSessionIfNeeded();
    $_SESSION['user_id'] = (int)$user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role'] = $user['role'];

    jsonResponse([
        'success' => true,
        'user'    => [
            'id'    => (int)$user['id'],
            'name'  => $user['name'],
            'email' => $user['email'],
            'role'  => $user['role'],
        ],
    ]);
}

// 3. POST /api/auth.php?action=register
if ($method === 'POST' && $action === 'register') {
    $name = trim($data['name'] ?? '');
    $email = strtolower(trim($data['email'] ?? ''));
    $password = $data['password'] ?? '';

    if (strlen($name) < 2) {
        jsonError('Bitte einen gültigen Namen mit mindestens 2 Zeichen angeben.', 422);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonError('Bitte eine gültige E-Mail-Adresse angeben.', 422);
    }

    if (strlen($password) < 6) {
        jsonError('Das Passwort muss mindestens 6 Zeichen lang sein.', 422);
    }

    // Prüfen ob E-Mail bereits existiert
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        jsonError('Diese E-Mail-Adresse ist bereits registriert.', 409);
    }

    // Erster registrierter Nutzer kann Admin werden, ansonsten 'coach'
    $countStmt = $db->query("SELECT COUNT(*) FROM users");
    $totalUsers = (int)$countStmt->fetchColumn();
    $role = ($totalUsers === 0) ? 'admin' : 'coach';

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $insertStmt = $db->prepare("INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 1)");
    $insertStmt->execute([$name, $email, $hash, $role]);
    $newId = (int)$db->lastInsertId();

    startSessionIfNeeded();
    $_SESSION['user_id'] = $newId;
    $_SESSION['user_name'] = $name;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_role'] = $role;

    jsonResponse([
        'success' => true,
        'user'    => [
            'id'    => $newId,
            'name'  => $name,
            'email' => $email,
            'role'  => $role,
        ],
    ]);
}

// 4. POST /api/auth.php?action=logout
if ($method === 'POST' && $action === 'logout') {
    startSessionIfNeeded();
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();

    jsonResponse([
        'success' => true,
        'message' => 'Erfolgreich abgemeldet.',
    ]);
}

// 5. GET /api/auth.php?action=users (Nur für Administratoren)
if ($method === 'GET' && $action === 'users') {
    $currentUser = getAuthenticatedUser();
    if (!$currentUser || $currentUser['role'] !== 'admin') {
        jsonError('Zugriff verweigert: Nur Administratoren dürfen Benutzer einsehen.', 403);
    }

    $stmt = $db->query("SELECT id, name, email, role, is_active, created_at FROM users ORDER BY id ASC");
    $users = $stmt->fetchAll();

    jsonResponse([
        'success' => true,
        'users'   => array_map(function($u) {
            return [
                'id'         => (int)$u['id'],
                'name'       => $u['name'],
                'email'      => $u['email'],
                'role'       => $u['role'],
                'is_active'  => (bool)$u['is_active'],
                'created_at' => $u['created_at'],
            ];
        }, $users),
    ]);
}

// 6. POST /api/auth.php?action=update_role (Nur für Administratoren)
if ($method === 'POST' && $action === 'update_role') {
    $currentUser = getAuthenticatedUser();
    if (!$currentUser || $currentUser['role'] !== 'admin') {
        jsonError('Zugriff verweigert: Nur Administratoren dürfen Rollen ändern.', 403);
    }

    $targetUserId = (int)($data['user_id'] ?? 0);
    $newRole = $data['role'] ?? '';
    $isActive = isset($data['is_active']) ? (int)(bool)$data['is_active'] : null;

    if ($targetUserId <= 0) {
        jsonError('Ungültige Benutzer-ID.', 422);
    }

    if (!in_array($newRole, ['admin', 'coach', 'member'], true)) {
        jsonError('Ungültige Benutzerrolle angegeben.', 422);
    }

    // Verhindere, dass der letzte Admin sich selbst degradiert
    if ($targetUserId === $currentUser['id'] && $newRole !== 'admin') {
        $adminCountStmt = $db->query("SELECT COUNT(*) FROM users WHERE role = 'admin' AND is_active = 1");
        if ((int)$adminCountStmt->fetchColumn() <= 1) {
            jsonError('Der letzte Administrator kann sich nicht selbst die Adminrechte entziehen.', 422);
        }
    }

    if ($isActive !== null) {
        $updateStmt = $db->prepare("UPDATE users SET role = ?, is_active = ? WHERE id = ?");
        $updateStmt->execute([$newRole, $isActive, $targetUserId]);
    } else {
        $updateStmt = $db->prepare("UPDATE users SET role = ? WHERE id = ?");
        $updateStmt->execute([$newRole, $targetUserId]);
    }

    jsonResponse([
        'success' => true,
        'message' => 'Benutzer erfolgreich aktualisiert.',
    ]);
}

jsonError('Unbekannte Authentifizierungs-Aktion.', 404);
