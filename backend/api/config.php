<?php
// =============================================================================
// RadballHub - Backend Konfiguration & Hilfsfunktionen
// Optimiert für Netcup Webhosting 1000 (PHP 8.1 - 8.3)
// =============================================================================

// Zeitzone & Fehlerbehandlung
date_default_timezone_set('Europe/Berlin');
error_reporting(E_ALL);
ini_set('display_errors', '0'); // Auf Produktivservern aus
ini_set('log_errors', '1');

// Optionale lokale Server-Konfiguration (wird bei Updates NIEMALS überschrieben)
if (file_exists(__DIR__ . '/config.local.php')) {
    require_once __DIR__ . '/config.local.php';
}

// Datenbank-Konfiguration (Fallback falls nicht in config.local.php definiert)
if (!defined('DB_HOST')) define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
if (!defined('DB_NAME')) define('DB_NAME', getenv('DB_NAME') ?: 'radballhub');
if (!defined('DB_USER')) define('DB_USER', getenv('DB_USER') ?: 'radball_user');
if (!defined('DB_PASS')) define('DB_PASS', getenv('DB_PASS') ?: 'radball_secret');
if (!defined('DB_PORT')) define('DB_PORT', getenv('DB_PORT') ?: '3306');

// Netcup SMTP Konfiguration (Fallback)
if (!defined('SMTP_HOST')) define('SMTP_HOST', getenv('SMTP_HOST') ?: 'mail.deinedomain.de');
if (!defined('SMTP_PORT')) define('SMTP_PORT', (int)(getenv('SMTP_PORT') ?: 465));
if (!defined('SMTP_USER')) define('SMTP_USER', getenv('SMTP_USER') ?: 'noreply@deinedomain.de');
if (!defined('SMTP_PASS')) define('SMTP_PASS', getenv('SMTP_PASS') ?: 'DeinSicheresPasswort');
if (!defined('SMTP_FROM_EMAIL')) define('SMTP_FROM_EMAIL', getenv('SMTP_FROM_EMAIL') ?: 'noreply@deinedomain.de');
if (!defined('SMTP_FROM_NAME')) define('SMTP_FROM_NAME', getenv('SMTP_FROM_NAME') ?: 'RadballHub Trainingsplattform');
if (!defined('ADMIN_EMAIL')) define('ADMIN_EMAIL', getenv('ADMIN_EMAIL') ?: 'admin@deinedomain.de');

// Pfade
define('UPLOAD_DIR', __DIR__ . '/../storage/uploads/exercises/');
define('PUBLIC_UPLOAD_URI', '/storage/uploads/exercises/');

/**
 * PDO-Datenbankverbindung mit UTF8mb4 und Exception-Mode
 */
function getDbConnection(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_PORT, DB_NAME);
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    }
    return $pdo;
}

/**
 * Einheitliche JSON-API Antwort
 */
function jsonResponse(mixed $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Hilfsfunktion für JSON-Fehlerantworten
 */
function jsonError(string $message, int $status = 400, mixed $details = null): void {
    jsonResponse([
        'success' => false,
        'error'   => $message,
        'details' => $details,
    ], $status);
}

/**
 * CORS-Header setzen für SPA-Integration
 */
function handleCors(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/**
 * Sichere Session initialisieren
 */
function startSessionIfNeeded(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => 86400 * 30,
            'path'     => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }
}

/**
 * Aktuell eingeloggten Benutzer ermitteln
 */
function getAuthenticatedUser(): ?array {
    startSessionIfNeeded();
    if (!empty($_SESSION['user_id'])) {
        return [
            'id'    => (int)$_SESSION['user_id'],
            'name'  => $_SESSION['user_name'] ?? '',
            'email' => $_SESSION['user_email'] ?? '',
            'role'  => $_SESSION['user_role'] ?? 'member',
        ];
    }
    return null;
}

/**
 * WebP-Bildkonvertierung mit automatischer Größenanpassung
 * Nutzt GD oder Imagick (standardmäßig auf Netcup aktiv)
 */
function convertAndSaveWebP(array $uploadedFile, string $targetDir, int $maxWidth = 1600, int $quality = 82): ?string {
    if (!isset($uploadedFile['tmp_name']) || !is_uploaded_file($uploadedFile['tmp_name'])) {
        return null;
    }

    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    $sourcePath = $uploadedFile['tmp_name'];
    $imageInfo = @getimagesize($sourcePath);
    if (!$imageInfo) {
        return null;
    }

    $mime = $imageInfo['mime'];
    $srcWidth = $imageInfo[0];
    $srcHeight = $imageInfo[1];

    // Source Image Resource erzeugen
    $srcImage = match ($mime) {
        'image/jpeg' => @imagecreatefromjpeg($sourcePath),
        'image/png'  => @imagecreatefrompng($sourcePath),
        'image/webp' => @imagecreatefromwebp($sourcePath),
        default      => null,
    };

    if (!$srcImage) {
        return null;
    }

    // EXIF Orientierung prüfen & rotieren (bei JPEG)
    if (function_exists('exif_read_data') && $mime === 'image/jpeg') {
        $exif = @exif_read_data($sourcePath);
        if (!empty($exif['Orientation'])) {
            $srcImage = match ($exif['Orientation']) {
                3 => imagerotate($srcImage, 180, 0),
                6 => imagerotate($srcImage, -90, 0),
                8 => imagerotate($srcImage, 90, 0),
                default => $srcImage,
            };
            $srcWidth = imagesx($srcImage);
            $srcHeight = imagesy($srcImage);
        }
    }

    // Proportionen skalieren falls > $maxWidth
    if ($srcWidth > $maxWidth) {
        $newWidth = $maxWidth;
        $newHeight = (int)round(($srcHeight / $srcWidth) * $maxWidth);
    } else {
        $newWidth = $srcWidth;
        $newHeight = $srcHeight;
    }

    $dstImage = imagecreatetruecolor($newWidth, $newHeight);
    imagealphablending($dstImage, false);
    imagesavealpha($dstImage, true);

    imagecopyresampled(
        $dstImage,
        $srcImage,
        0, 0, 0, 0,
        $newWidth, $newHeight,
        $srcWidth, $srcHeight
    );

    // Dateiname generieren
    $filename = uniqid('ex_', true) . '.webp';
    $targetFile = rtrim($targetDir, '/') . '/' . $filename;

    // Speichern als WebP
    imagewebp($dstImage, $targetFile, $quality);

    imagedestroy($srcImage);
    imagedestroy($dstImage);

    return $filename;
}
