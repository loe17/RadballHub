# RadballHub – Modulare Trainings- und Übungsplattform

Eine modulare, hochperformante Web-Plattform zur Verwaltung von Radball- und Athletikübungen, Erstellung maßgeschneiderter Trainingspläne mit Drag-and-Drop, automatisierter Belastungs-Validierung zur Vermeidung von Muskelüberlastung und pixelgenauem DIN-A4 Druckanschliff für den Hallenbetrieb.

Optimiert für den Betrieb auf einem **Netcup Webhosting 1000** (Apache/Nginx, PHP 8.x, MariaDB/MySQL).

---

## 🚀 Kernfunktionen

1. **Übungskatalog & Filterung:**
   - Kategorien: Technik, Taktik, Kondition, Allein/Home-Workout, **speziell: Zirkelübung**.
   - Altersbereiche: Anfänger, ab U11, ab U13, ab U15, ab U17, ab U19, ab Elite, für alle, Fortgeschrittene, Profis.
   - **Optionales Autorenfeld:** Neben dem Uploader-Account kann ein spezifischer Urheber/Autor (z. B. Bundestrainer, Gastverein) deklariert werden.
   - Belastete Körperzonen / Muskelgruppen (Oberarme, Brust, oberer Rücken, Rumpf/Bauch, Oberschenkel, Waden) mit Intensitäts-Differenzierung (Primär / Sekundär).
   - Zirkel-Metadaten: Belastung & Pause in Sekunden, Rundenanzahl, Stationsnummer, Aufbauhinweis.

2. **Interaktiver Trainingsplan-Builder ("Warenkorb"):**
   - Touch-optimiertes Drag-and-Drop via `@dnd-kit` für Smartphones und Tablets direkt am Spielfeldrand.
   - **Persistente Multi-Plan-Verwaltung:** Im Benutzerkonto können beliebig viele Trainingspläne unter individuellem Namen (z. B. *"U17 Taktik & Ausdauer"*) gespeichert, jederzeit aufgerufen, dupliziert und editiert werden.
   - Dynamische Pausenzeiten (30s, 60s, 90s, 120s) und Live-Summenberechnung der Gesamttrainingszeit.
   - **Intelligente Belastungs-Validierung:** Erkennt in Echtzeit aufeinanderfolgende Übungen mit identischen primären Muskelgruppen und schlägt Alarm, um Ermüdungs- und Verletzungsrisiken zu minimieren.

3. **DIN-A4 Druckoptimierung:**
   - Jede Übung wird über `@media print` CSS exakt auf **1 DIN-A4-Seite** skaliert (oben Grafik, darunter 2-Spalten-Raster für Ablauf & Material), ohne unsaubere Seitenumbrüche.
   - Mehrseitiger Plan-Druck: Deckblatt/Übersichtszeitplan auf Seite 1, danach jede gewählte Übung auf einer eigenen DIN-A4-Seite.

4. **Community & Moderation:**
   - Einreichung neuer Übungen mit Statusmodell (`draft` -> `pending_review` -> `approved` / `rejected`).
   - Feedback & Änderungsvorschläge zu bestehenden Übungen.
   - E-Mail-Benachrichtigungen über Netcup SMTP (Port 465 SSL).

5. **1-Klick-Backup & Archivierung:**
   - Vollständiger Katalog-Export als ZIP-Archiv inklusive strukturierter `exercises.json`, `exercises.csv` und aller verknüpften Bilddateien.
   - Netcup-optimiertes Streaming (`ZipStream-PHP`) mit $O(1)$ Speicherverbrauch zur Einhaltung des Shared-Hosting-Limits.

---

## 📁 Projektstruktur

```text
RadballHub/
├── backend/
│   ├── api/
│   │   ├── config.php            # Netcup DB & SMTP Konfiguration
│   │   ├── exercises.php         # REST Controller für Übungen & WebP-Upload
│   │   ├── training-plans.php    # Multi-Plan Account-Verwaltung (CRUD & Klonen)
│   │   ├── export.php            # ZIP-Backup Streaming Controller
│   │   ├── feedback.php          # Community-Feedback Controller
│   │   ├── mailer.php            # SMTP-Mailer für Netcup
│   │   └── index.php             # Zentraler API Router
│   ├── database/
│   │   ├── schema.sql            # Vollständiges DDL SQL-Schema
│   │   └── seeders.sql           # Initial- und Demodaten
│   └── .htaccess                 # Apache Rewrite-Regeln für Netcup/Plesk
├── frontend/
│   ├── src/
│   │   ├── components/           # UI-Komponenten (Header, Cards, Modals, Drawer)
│   │   ├── services/             # API & Mock Daten
│   │   ├── store/                # Zustand State Management für Multi-Pläne
│   │   ├── types/                # TypeScript Domänen-Typen
│   │   ├── utils/                # Belastungs-Validierung & Unit-Tests
│   │   ├── App.tsx               # Hauptkomponente
│   │   └── index.css             # Tailwind v4 & DIN-A4 Print CSS
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   └── deploy-netcup.md          # Schritt-für-Schritt Netcup/Plesk Anleitung
└── .github/
    └── workflows/
        └── deploy.yml            # CI/CD Workflow für automatisiertes Deployment
```

---

## 🛠️ Lokale Entwicklung

```bash
# 1. In das Frontend-Verzeichnis wechseln
cd frontend

# 2. Abhängigkeiten installieren
npm install

# 3. Unit-Tests für Belastungs-Validierung ausführen
npm test

# 4. Entwicklungsserver starten
npm run dev
# Browser öffnen: http://localhost:3000

# 5. Produktions-Build erstellen
npm run build
```

---

## 🌐 Deployment auf Netcup Webhosting 1000

Eine detaillierte Anleitung befindet sich unter [`docs/deploy-netcup.md`](docs/deploy-netcup.md).

1. In Plesk **PHP 8.2 oder 8.3-FPM** aktivieren (`memory_limit = 512M`).
2. MariaDB-Datenbank anlegen und `backend/database/schema.sql` sowie `backend/database/seeders.sql` via phpMyAdmin importieren.
3. E-Mail-Postfach (z. B. `noreply@deinedomain.de`) in Plesk erstellen und Zugangsdaten in `backend/api/config.php` eintragen.
4. Den Inhalt aus `frontend/dist/` (Assets, `index.html`) sowie `backend/api/`, `backend/.htaccess` in das `httpdocs/`-Verzeichnis des Webspaces kopieren.
