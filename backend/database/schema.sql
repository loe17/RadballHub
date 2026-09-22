-- =============================================================================
-- RadballHub - Datenbank-Schema (DDL)
-- Zielumgebung: Netcup Webhosting 1000 (MariaDB 10.x / MySQL 8.x)
-- Zeichensatz: UTF-8 Multibyte (utf8mb4_unicode_ci)
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------
-- 1. Tabelle: users (Benutzer & Rollen)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'coach', 'member') NOT NULL DEFAULT 'member',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `remember_token` VARCHAR(100) NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 2. Tabelle: age_groups (Zielgruppen & Altersbereiche)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `age_groups` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `label` VARCHAR(80) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  INDEX `idx_age_groups_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 3. Tabelle: muscle_groups (Belastete Körperzonen)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `muscle_groups` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `body_region` ENUM('upper_body', 'core', 'lower_body', 'full_body') NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 4. Tabelle: exercises (Übungskatalog)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `exercises` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `author_name` VARCHAR(191) NULL DEFAULT NULL,
  `category` ENUM('technik', 'taktik', 'kondition', 'home_workout', 'zirkel') NOT NULL,
  `duration_minutes` INT UNSIGNED NOT NULL DEFAULT 5,
  `material` VARCHAR(500) NULL DEFAULT NULL,
  `description` MEDIUMTEXT NOT NULL,
  `image_path` VARCHAR(500) NULL DEFAULT NULL,
  `video_url` VARCHAR(500) NULL DEFAULT NULL,
  `status` ENUM('draft', 'pending_review', 'approved', 'rejected') NOT NULL DEFAULT 'draft',
  `rejection_reason` TEXT NULL DEFAULT NULL,
  `created_by_user_id` BIGINT UNSIGNED NOT NULL,
  `reviewed_by_user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `reviewed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_exercises_creator` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_exercises_reviewer` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_exercises_status_category` (`status`, `category`),
  INDEX `idx_exercises_author` (`author_name`),
  INDEX `idx_exercises_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 5. Tabelle: exercise_circuits (Zusatzfelder für Zirkeltraining)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `exercise_circuits` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `exercise_id` BIGINT UNSIGNED NOT NULL UNIQUE,
  `work_duration_seconds` INT UNSIGNED NOT NULL DEFAULT 45,
  `pause_duration_seconds` INT UNSIGNED NOT NULL DEFAULT 15,
  `rounds` INT UNSIGNED NOT NULL DEFAULT 3,
  `station_number` VARCHAR(20) NULL DEFAULT NULL,
  `setup_notes` TEXT NULL DEFAULT NULL,
  CONSTRAINT `fk_circuits_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 6. Tabelle: exercise_age_group_assignments (m:n)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `exercise_age_group_assignments` (
  `exercise_id` BIGINT UNSIGNED NOT NULL,
  `age_group_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`exercise_id`, `age_group_id`),
  CONSTRAINT `fk_eag_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_eag_age_group` FOREIGN KEY (`age_group_id`) REFERENCES `age_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 7. Tabelle: exercise_muscle_group (m:n mit Intensität)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `exercise_muscle_group` (
  `exercise_id` BIGINT UNSIGNED NOT NULL,
  `muscle_group_id` INT UNSIGNED NOT NULL,
  `intensity` ENUM('primary', 'secondary') NOT NULL DEFAULT 'primary',
  PRIMARY KEY (`exercise_id`, `muscle_group_id`),
  CONSTRAINT `fk_emg_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_emg_muscle` FOREIGN KEY (`muscle_group_id`) REFERENCES `muscle_groups` (`id`) ON DELETE CASCADE,
  INDEX `idx_emg_intensity` (`intensity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 8. Tabelle: training_plans (Trainingspläne im Benutzerkonto)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `training_plans` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `is_favorite` TINYINT(1) NOT NULL DEFAULT 0,
  `default_pause_between_exercises_seconds` INT UNSIGNED NOT NULL DEFAULT 60,
  `is_public` TINYINT(1) NOT NULL DEFAULT 0,
  `last_used_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_plans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_plans_user` (`user_id`),
  INDEX `idx_plans_last_used` (`last_used_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 9. Tabelle: training_plan_items (Plan-Einträge & Sequenz)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `training_plan_items` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `training_plan_id` BIGINT UNSIGNED NOT NULL,
  `exercise_id` BIGINT UNSIGNED NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `custom_duration_minutes` INT UNSIGNED NULL DEFAULT NULL,
  `custom_pause_seconds` INT UNSIGNED NULL DEFAULT NULL,
  `custom_notes` VARCHAR(500) NULL DEFAULT NULL,
  CONSTRAINT `fk_plan_items_plan` FOREIGN KEY (`training_plan_id`) REFERENCES `training_plans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_plan_items_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE,
  INDEX `idx_plan_items_order` (`training_plan_id`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 10. Tabelle: exercise_feedback_and_reviews (Moderation & Feedback)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `exercise_feedback_and_reviews` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `exercise_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `type` ENUM('change_suggestion', 'moderator_feedback', 'issue_report') NOT NULL DEFAULT 'change_suggestion',
  `message` TEXT NOT NULL,
  `status` ENUM('open', 'applied', 'declined') NOT NULL DEFAULT 'open',
  `admin_reply` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_feedback_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_feedback_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_feedback_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
