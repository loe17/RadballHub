-- =============================================================================
-- RadballHub - Initial Seeder & Demo-Daten
-- =============================================================================

USE `radballhub`;

-- -----------------------------------------------------
-- 1. Initialdaten: Zielgruppen / Altersklassen
-- -----------------------------------------------------
INSERT IGNORE INTO `age_groups` (`id`, `code`, `label`, `sort_order`) VALUES
(1, 'beginner', 'Anfänger', 10),
(2, 'u11', 'ab U11', 20),
(3, 'u13', 'ab U13', 30),
(4, 'u15', 'ab U15', 40),
(5, 'u17', 'ab U17', 50),
(6, 'u19', 'ab U19', 60),
(7, 'elite', 'ab Elite', 70),
(8, 'all', 'für alle', 80),
(9, 'advanced', 'Fortgeschrittene', 90),
(10, 'pro', 'Profis', 100);

-- -----------------------------------------------------
-- 2. Initialdaten: Muskelgruppen / Körperzonen
-- -----------------------------------------------------
INSERT IGNORE INTO `muscle_groups` (`id`, `code`, `name`, `body_region`, `sort_order`) VALUES
(1, 'arms', 'Oberarme (Bizeps / Trizeps)', 'upper_body', 10),
(2, 'chest', 'Brust', 'upper_body', 20),
(3, 'upper_back', 'Oberer Rücken & Schultern', 'upper_body', 30),
(4, 'core', 'Rumpf / Bauch', 'core', 40),
(5, 'thighs', 'Oberschenkel (Quadrizeps / Hamstrings)', 'lower_body', 50),
(6, 'calves', 'Waden', 'lower_body', 60);

-- -----------------------------------------------------
-- 3. Initialdaten: Demo-Benutzer
-- Passwort für alle Demo-User: 'Radball2026!' ($2y$12$...)
-- -----------------------------------------------------
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `is_active`) VALUES
(1, 'Administrator', 'admin@radballhub.de', '$2y$12$W9yH50e4s8fOkmk9b85cveoGkH/J1l/V7N1vO4vM1gLgQY5kE9Z.2', 'admin', 1),
(2, 'Trainer Markus', 'trainer@radballhub.de', '$2y$12$W9yH50e4s8fOkmk9b85cveoGkH/J1l/V7N1vO4vM1gLgQY5kE9Z.2', 'coach', 1),
(3, 'Spieler Lukas', 'spieler@radballhub.de', '$2y$12$W9yH50e4s8fOkmk9b85cveoGkH/J1l/V7N1vO4vM1gLgQY5kE9Z.2', 'member', 1);

-- -----------------------------------------------------
-- 4. Initialdaten: Übungskatalog
-- -----------------------------------------------------
INSERT IGNORE INTO `exercises` (`id`, `title`, `slug`, `author_name`, `category`, `duration_minutes`, `material`, `description`, `image_path`, `video_url`, `status`, `created_by_user_id`, `reviewed_by_user_id`, `reviewed_at`) VALUES
(1, 
 'Präzisions-Drehschlag aus der Kurve', 
 'praezisions-drehschlag-aus-der-kurve', 
 'Bundestrainer Radball', 
 'technik', 
 10, 
 '2 Radballräder, 4 Bälle, 1 Tor, Hütchen', 
 '1. Spieler fährt mit moderatem Tempo von der Außenlinie in Richtung Tor.\n2. In einem Radius von ca. 3 Metern um den Torkreis erfolgt die dynamische Gewichtsverlagerung auf das Hinterrad.\n3. Drehschlag mit gezielter Schlagflächenrotation des Vorderrads in die lange Torecke.\n4. Fokus liegt auf stabiler Lenkerhaltung und sauberem Nachdrücken aus den Schultern.\n5. 5 Durchgänge von links, 5 von rechts.', 
 '/uploads/exercises/drehschlag.webp', 
 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 
 'approved', 
 2, 
 1, 
 NOW()),

(2, 
 '2-gegen-1 Umschaltspiel & Torhüter-Entscheidung', 
 '2-gegen-1-umschaltspiel-torhueter-entscheidung', 
 'Lukas M. (Trainer A-Lizenz)', 
 'taktik', 
 15, 
 'Volles Spielfeld, 1 Tor, Bälle, Markierungshütchen', 
 '1. Angreifer A und B starten an der Mittellinie im Schnellangriff.\n2. Verteidiger startet an der Torkreislinie und muss die Passlinie zustellen, ohne die Ecke aufzugeben.\n3. Angreifer müssen durch schnelles Doppelpass-Spiel oder Körpertäuschung den Verteidiger binden.\n4. Abschluss erfolgt innerhalb von maximal 8 Sekunden nach Balleroberung.\n5. Rollentausch nach je 3 Angriffen.', 
 '/uploads/exercises/umschaltspiel.webp', 
 NULL, 
 'approved', 
 2, 
 1, 
 NOW()),

(3, 
 'Hochintensiver Antritt & Radball-Sprint', 
 'hochintensiver-antritt-radball-sprint', 
 'Athletikteam Radsport', 
 'kondition', 
 12, 
 'Radballrad, Stoppuhr, 4 Markierungsteller', 
 '1. Stillstand auf dem Rad an der Grundlinie (Balance-Halt).\n2. Auf Pfiff maximaler Antritt über die gesamte Hallenlänge (14 Meter).\n3. Vollbremsung mit Vorderrad-Querstellen vor der Bande.\n4. 180-Grad-Wende auf dem Hinterrad und sofortiger Rücksprint.\n5. 6 Serien mit je 45 Sekunden Pause.', 
 '/uploads/exercises/sprint.webp', 
 NULL, 
 'approved', 
 1, 
 1, 
 NOW()),

(4, 
 'Stabi-Core: Unterarmstütz mit dynamischer Lenker-Rotation', 
 'stabi-core-unterarmstuetz-dynamische-lenker-rotation', 
 'Physio-Team Radsport', 
 'home_workout', 
 8, 
 'Gymnastikmatte, optional leichter Radball-Lenker oder Kurzhantel', 
 '1. Ausgangsposition ist der klassische Unterarmstütz (Plank).\n2. Der Körper bildet von den Fersen bis zum Kopf eine gerade Linie, Bauchnabel aktiv nach innen ziehen.\n3. Im 3-Sekunden-Takt wird ein Arm gelöst und eine horizontale Rotationsbewegung (wie beim Lenken unter Druck) simuliert.\n4. 45 Sekunden Belastung pro Seite, 3 Durchgänge.', 
 '/uploads/exercises/core-plank.webp', 
 NULL, 
 'approved', 
 3, 
 1, 
 NOW()),

(5, 
 'Zirkel: Explosive Jump-Squats & Oberschenkel-Power', 
 'zirkel-explosive-jump-squats', 
 'Athletikverband', 
 'zirkel', 
 6, 
 'Springseil, Stoppuhr, Markierung', 
 '1. Tiefe Kniebeuge mit geradem Rücken, Oberschenkel parallel zum Boden.\n2. Explosiver Strecksprung nach oben mit maximaler Kniestreckung.\n3. Sanfte Landung auf den Fußballen und direkte Abfederung in die nächste Wiederholung.\n4. Konzentration auf saubere Beinachse (Knie kippen nicht nach innen).', 
 '/uploads/exercises/jump-squats.webp', 
 NULL, 
 'approved', 
 1, 
 1, 
 NOW()),

(6, 
 'Zirkel: Medizinball-Slam & Rumpf-Rotation', 
 'zirkel-medizinball-slam-rumpf-rotation', 
 'Konditionstrainer E.', 
 'zirkel', 
 6, 
 '3kg bis 5kg Slam Ball / Medizinball', 
 '1. Schulterbreiter Stand mit leicht gebeugten Knien.\n2. Ball mit beiden Händen explosiv über den Kopf führen und mit voller Kraft vor die Füße auf den Hallenboden schmettern.\n3. Ball im Rebound aufnehmen, Körper drehen und seitlich rotieren.\n4. Kräftigt Rumpf, Bauch und oberen Rücken für harte Schlagbälle.', 
 '/uploads/exercises/slam-ball.webp', 
 NULL, 
 'approved', 
 2, 
 1, 
 NOW());

-- -----------------------------------------------------
-- 5. Zirkel-Zusatzdaten für Zirkelübungen
-- -----------------------------------------------------
INSERT IGNORE INTO `exercise_circuits` (`exercise_id`, `work_duration_seconds`, `pause_duration_seconds`, `rounds`, `station_number`, `setup_notes`) VALUES
(5, 45, 15, 3, 'Station 1', 'Freier Hallenbereich, min. 2m Abstand zu Hallenwänden.'),
(6, 40, 20, 3, 'Station 2', 'Mattenunterlage schont den Hallenboden bei harten Slams.');

-- -----------------------------------------------------
-- 6. Verknüpfung: Übung zu Altersgruppen
-- -----------------------------------------------------
INSERT IGNORE INTO `exercise_age_group_assignments` (`exercise_id`, `age_group_id`) VALUES
(1, 4), (1, 5), (1, 6), (1, 7), (1, 9), -- Drehschlag: ab U15, U17, U19, Elite, Fortgeschrittene
(2, 5), (2, 6), (2, 7), (2, 9), (2, 10), -- 2-gegen-1: ab U17, U19, Elite, Fortgeschrittene, Profis
(3, 4), (3, 5), (3, 6), (3, 7), (3, 8), -- Sprint: ab U15 bis Elite, für alle
(4, 8), (4, 1), (4, 9), -- Plank: für alle, Anfänger, Fortgeschrittene
(5, 5), (5, 6), (5, 7), (5, 9), -- Jump Squats: ab U17 bis Elite
(6, 5), (6, 6), (6, 7), (6, 8); -- Slam Ball: ab U17, für alle

-- -----------------------------------------------------
-- 7. Verknüpfung: Übung zu Muskelgruppen
-- -----------------------------------------------------
INSERT IGNORE INTO `exercise_muscle_group` (`exercise_id`, `muscle_group_id`, `intensity`) VALUES
-- Übung 1: Drehschlag -> Oberarme (primary), oberer Rücken (secondary), Rumpf (secondary)
(1, 1, 'primary'),
(1, 3, 'secondary'),
(1, 4, 'secondary'),

-- Übung 2: 2-gegen-1 Umschaltspiel -> Oberschenkel (primary), Rumpf (secondary)
(2, 5, 'primary'),
(2, 4, 'secondary'),

-- Übung 3: Radball-Sprint -> Oberschenkel (primary), Waden (primary), Rumpf (secondary)
(3, 5, 'primary'),
(3, 6, 'primary'),
(3, 4, 'secondary'),

-- Übung 4: Stabi-Core -> Rumpf / Bauch (primary), Oberer Rücken (secondary)
(4, 4, 'primary'),
(4, 3, 'secondary'),

-- Übung 5: Jump Squats -> Oberschenkel (primary), Waden (secondary)
(5, 5, 'primary'),
(5, 6, 'secondary'),

-- Übung 6: Slam Ball -> Rumpf / Bauch (primary), Oberer Rücken (primary), Brust (secondary)
(6, 4, 'primary'),
(6, 3, 'primary'),
(6, 2, 'secondary');

-- -----------------------------------------------------
-- 8. Gespeicherter Demo-Trainingsplan im Benutzerkonto
-- -----------------------------------------------------
INSERT IGNORE INTO `training_plans` (`id`, `user_id`, `title`, `description`, `is_favorite`, `default_pause_between_exercises_seconds`, `is_public`, `last_used_at`) VALUES
(1, 2, 'Saisonauftakt U17: Schnellkraft & Schlagtechnik', 'Intensiver 45-Minuten-Plan zur Vorbereitung auf die Spieltagsserie.', 1, 90, 1, NOW());

INSERT IGNORE INTO `training_plan_items` (`training_plan_id`, `exercise_id`, `sort_order`, `custom_duration_minutes`, `custom_pause_seconds`, `custom_notes`) VALUES
(1, 4, 1, 8, 60, 'Mobilisation und Voraktivierung der Core-Muskulatur'),
(1, 1, 2, 12, 90, 'Saubere Technik vor Tempo'),
(1, 3, 3, 10, 120, 'Volle Sprintausbelastung'),
(1, 2, 4, 15, 60, 'Abschlussspiel 2-gegen-1');
