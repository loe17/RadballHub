# RadballHub

Eine Web-Plattform zur Verwaltung von Radball- und Athletikübungen, Zusammenstellung von Trainingsplänen und zum Ausdrucken von Übungsblättern auf DIN-A4 für den Hallenbetrieb.

Lauffähig auf Netcup Webhosting (Apache/Nginx, PHP 8.x, MariaDB/MySQL).

---

## Funktionen

1. **Übungskatalog & Filterung:**
   - Kategorien: Technik, Taktik, Kondition, Ausdauer, Allein / Home-Workout, Zirkelübung.
   - Altersbereiche: Anfänger, ab U11, ab U13, ab U15, ab U17, ab U19, ab Elite, für alle, Fortgeschrittene, Profis.
   - Materialauswahl: Schnelle Auswahl aus bestehenden Materialien per Klick oder freie Eingabe neuer Materialien.
   - Mediengalerie: Mehrere Bilder und Lehrvideos pro Übung mit Reihenfolge und Kennzeichnung des Titelbildes.
   - Belastete Muskelgruppen (Oberarme, Brust, oberer Rücken, Rumpf/Bauch, Oberschenkel, Waden) mit Intensität (Primär / Sekundär).
   - Zirkel-Angaben: Belastung & Pause in Sekunden, Rundenanzahl, Stationsnummer, Aufbauhinweis.

2. **Trainingsplan-Zusammenstellung:**
   - Zusammenstellen von Übungen per Drag-and-Drop für Mobilgeräte und Desktop.
   - Speichern mehrerer Pläne unter eigenem Namen (z. B. "U17 Vorbereitung").
   - Pausenzeiten und automatische Gesamtdauer-Berechnung.
   - Belastungsprüfung: Warnung bei aufeinanderfolgenden Übungen mit gleicher primärer Muskelgruppe zur Schonung der Sportler.

3. **DIN-A4 Druck:**
   - Sauberes Drucklayout: Navigationsleisten, Knöpfe und Filter werden beim Drucken komplett ausgeblendet.
   - Jede Übung wird auf genau 1 DIN-A4-Seite ausgegeben.
   - Mehrseitiger Plandruck mit Übersicht und nachfolgenden Übungsseiten.

4. **Benutzerverwaltung & Berechtigungen:**
   - Anmeldung und Registrierung für Trainer und Mitglieder.
   - Administrator-Bereich zur Verwaltung von Benutzerrollen (Mitglied, Trainer, Administrator).
   - Moderation von neuen Übungseingaben.

5. **Datensicherung (Admin):**
   - Vollständiger Katalog-Export als ZIP-Archiv inklusive Übungsdaten und aller hochgeladenen Bilder.
   - Wiederherstellung von Übungen über gesicherte Datendateien.

6. **Design:**
   - Umschaltbarer Dark Mode (Dunkles Design) für schlechte Lichtverhältnisse.

---

## Projektstruktur

```text
RadballHub/
├── backend/
│   ├── api/
│   │   ├── auth.php              # Anmeldung, Registrierung & Rollenverwaltung
│   │   ├── config.php            # Konfiguration & Datenbank-Verbindung
│   │   ├── exercises.php         # Verwaltung von Übungen, Bildern & Videos
│   │   ├── training-plans.php    # Speichern & Verwalten von Trainingsplänen
│   │   ├── export.php            # Datensicherung (ZIP-Export & JSON-Import)
│   │   ├── feedback.php          # Rückmeldungen zu Übungen
│   │   ├── mailer.php            # E-Mail-Benachrichtigungen
│   │   └── index.php             # Zentrale Schnittstelle
│   ├── database/
│   │   ├── schema.sql            # Tabellenstruktur
│   │   └── seeders.sql           # Grunddaten & Admin-Zugang
│   └── .htaccess                 # Server-Regeln
├── frontend/
│   ├── src/
│   │   ├── components/           # Benutzeroberfläche (Karten, Dialoge, Druckansichten)
│   │   ├── services/             # Kommunikation mit dem Server
│   │   ├── store/                # Statusverwaltung für Pläne
│   │   ├── types/                # Datentypen
│   │   ├── utils/                # Belastungs-Berechnung
│   │   ├── App.tsx               # Hauptkomponente
│   │   └── index.css             # Gestaltung & Druckregeln
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   └── deploy-netcup.md          # Anleitung zur Veröffentlichung & Updates
└── .github/
    └── workflows/
        └── deploy.yml            # Automatische Veröffentlichung bei GitHub-Updates
```

---

## Lokale Entwicklung

```bash
# In das Frontend-Verzeichnis wechseln
cd frontend

# Abhängigkeiten installieren
npm install

# Tests ausführen
npm test

# Entwicklungsserver starten
npm run dev

# Produktionsversion erstellen
npm run build
```

---

## Veröffentlichung auf Netcup

Eine Schritt-für-Schritt-Anleitung zur Ersteinrichtung, zu Datenbank-Updates und zur automatischen Bereitstellung befindet sich in [`docs/deploy-netcup.md`](docs/deploy-netcup.md).

