# Deployment & Update-Leitfaden: Netcup Webhosting 1000

Diese Anleitung erklärt:
1. Wie du die Plattform erstmals veröffentlichst.
2. Was die automatische Veröffentlichung (GitHub Actions) ist und wie sie funktioniert.
3. Wie du bestehende Installationen aktualisierst (Datenbank-Aktualisierung), ohne vorhandene Daten zu verlieren.
4. Wie Benutzerkonten, Rollen und die Datensicherung verwaltet werden.

---

## 1. Erstveröffentlichung auf Netcup

### Schritt 1: Plesk vorbereiten
1. **PHP-Version:** In Plesk unter *Websites & Domains > PHP-Einstellungen* auf `PHP 8.2` oder `8.3` stellen (`memory_limit = 512M`).
2. **Datenbank anlegen:** Unter *Datenbanken* eine MariaDB/MySQL-Datenbank erstellen samt Benutzer und Passwort.
3. **Tabellen importieren:** In phpMyAdmin die Datei `backend/database/schema.sql` und `backend/database/seeders.sql` importieren.
4. **E-Mail-Postfach:** Unter *E-Mail* das Postfach (z. B. `benachrichtigungen@rve1922.de`) anlegen.

### Schritt 2: Zugangsdaten hinterlegen (`config.local.php`)
Erstelle auf dem Server im Ordner `/httpdocs/api/` eine Datei namens `config.local.php` (siehe Vorlage `backend/api/config.local.example.php`):
```php
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'deine_datenbank');
define('DB_USER', 'dein_benutzer');
define('DB_PASS', 'DeinPasswort');

define('SMTP_HOST', 'mail.deinedomain.de');
define('SMTP_PORT', 465); // SSL
define('SMTP_USER', 'benachrichtigungen@deinedomain.de');
define('SMTP_PASS', 'DeinMailPasswort');
define('ADMIN_EMAIL', 'admin@deinedomain.de');
```

Diese Datei wird bei zukünftigen Updates niemals überschrieben. Deine Zugangsdaten bleiben dauerhaft auf dem Server geschützt.

### Schritt 3: Manuelles Hochladen (Alternative zu GitHub Actions)
Falls du Dateien direkt per FTP hochladen möchtest:
1. Baue das Frontend lokal:
   ```bash
   cd frontend
   npm run build
   ```
2. Lade per FTP-Programm (z. B. FileZilla) in das Verzeichnis der Subdomain bzw. `/httpdocs/` hoch:
   - Den Inhalt von `frontend/dist/` (`index.html`, Ordner `assets/`)
   - Den Ordner `backend/api/` nach `/api/`
   - Die Datei `backend/.htaccess` als `.htaccess`
   - Lege den Ordner an: `/storage/uploads/exercises/` (Berechtigung `755`)

---

## 2. Automatische Veröffentlichung mit GitHub Actions

Die Datei `.github/workflows/deploy.yml` baut bei jedem Speichern auf GitHub die Anwendung und überträgt sie automatisch auf den Netcup-Server:

1. Gehe in deinem GitHub-Repository auf:
   **Settings > Secrets and variables > Actions > New repository secret**
2. Lege folgende 3 Zugänge an:
   - `NETCUP_FTP_HOST`: Die Serveradresse (z. B. `hosting162160.a2fef.netcup.net` oder die IP-Adresse).
   - `NETCUP_FTP_USER`: Dein FTP-Benutzername aus Plesk.
   - `NETCUP_FTP_PASSWORD`: Dein FTP-Passwort.
3. Sobald neue Änderungen in den Hauptzweig (`main`) übertragen werden, baut GitHub die Anwendung und überträgt nur die Programmdateien. Deine hochgeladenen Bilder und die Datenbank bleiben unangetastet.

---

## 3. Bestehende Datenbank aktualisieren (Update von früheren Versionen)

Wenn du die Plattform bereits installiert hast und auf die neue Version mit der Kategorie **Ausdauer** und **mehreren Bildern/Videos pro Übung** umstellst, führe folgenden Befehl einmalig in **phpMyAdmin** unter dem Reiter **SQL** aus:

```sql
-- 1. Neue Kategorie "Ausdauer" zu Übungen hinzufügen:
ALTER TABLE exercises MODIFY category ENUM('technik', 'taktik', 'kondition', 'ausdauer', 'home_workout', 'zirkel') NOT NULL;

-- 2. Neue Tabelle für mehrere Bilder und Videos pro Übung anlegen:
CREATE TABLE IF NOT EXISTS exercise_media (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  exercise_id BIGINT UNSIGNED NOT NULL,
  type ENUM('image', 'video') NOT NULL DEFAULT 'image',
  url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  caption VARCHAR(255) NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_media_exercise FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE,
  INDEX idx_media_order (exercise_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Bestehende Übungen und Bilder bleiben dabei vollständig erhalten.

---

## 4. Benutzerverwaltung, Rollen und Anmeldung

### Standard-Administrator
Nach dem Import von `seeders.sql` existiert ein initialer Administrator:
- **E-Mail:** `admin@radballhub.de`
- **Passwort:** `Radball2026!`

Nach der ersten Anmeldung kannst du dieses Konto nutzen oder dir ein eigenes Konto erstellen und zum Administrator ernennen.

### Registrierung und Rollen
- Jeder Trainer und jedes Vereinsmitglied kann sich über den Button **Anmelden / Registrieren** oben rechts selbst ein Konto erstellen.
- Neue Konten erhalten standardmäßig die Rolle **Trainer**. Trainer können Übungen einreichen, eigene Trainingspläne zusammenstellen und drucken.
- **Administrator-Rechte:** Nur angemeldete Administratoren sehen oben rechts den Button **Verwaltung**.
- In der Verwaltung kann der Administrator:
  - Allen registrierten Benutzern neue Rollen zuweisen (z. B. ein Mitglied zum Administrator befördern).
  - Der letzte verbleibende Administrator kann sich nicht selbst die Rechte entziehen, damit der Zugang immer gesichert bleibt.

---

## 5. Datensicherung (Backup & Wiederherstellung)

Die Datensicherung ist ausschließlich für Administratoren zugänglich, um unbefugte Exporte zu verhindern:

1. Melde dich als Administrator an und klicke oben rechts auf **Verwaltung**.
2. **Katalog-Backup herunterladen (ZIP):**
   Erstellt eine vollständige Sicherung aller Übungen (als JSON- und CSV-Datei) sowie aller hochgeladenen Übungsbilder in einer praktischen ZIP-Datei auf deinem Computer.
3. **Katalog wiederherstellen (JSON):**
   Ermöglicht das Einspielen einer zuvor gesicherten `exercises.json`-Datei, um Übungen bei Bedarf wiederherzustellen.

