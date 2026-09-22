<?php
// =============================================================================
// Vorlage für config.local.php (Wird auf dem Netcup-Server hinterlegt)
// Diese Datei wird NIEMALS von Git oder Updates überschrieben!
// =============================================================================

// Echte Datenbank-Zugangsdaten aus Plesk:
define('DB_HOST', 'localhost');
define('DB_NAME', 'k12345_radballhub');
define('DB_USER', 'k12345_radball_user');
define('DB_PASS', 'DeinSicheresDBPasswort');

// Echte Netcup E-Mail / SMTP Zugangsdaten aus Plesk:
define('SMTP_HOST', 'mail.deinedomain.de');
define('SMTP_PORT', 465); // SSL Port
define('SMTP_USER', 'noreply@deinedomain.de');
define('SMTP_PASS', 'DeinMailPasswort');
define('SMTP_FROM_EMAIL', 'noreply@deinedomain.de');
define('SMTP_FROM_NAME', 'RadballHub Trainingsplattform');
define('ADMIN_EMAIL', 'admin@deinedomain.de');
