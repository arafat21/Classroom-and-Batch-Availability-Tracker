-- ================================================================
-- MIGRATION: Add status and schedule_type to schedules table
-- Run this ONLY if you have an existing database with old schema.
-- Safe to run multiple times (uses IF NOT EXISTS logic).
-- ================================================================

USE process.env.DB_NAME || 'classroom_tracker_main' ;

-- Add 'status' column if it doesn't exist
SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = process.env.DB_NAME || 'classroom_tracker_main'
      AND TABLE_NAME   = 'schedules'
      AND COLUMN_NAME  = 'status'
);

SET @sql := IF(@col_exists = 0,
    "ALTER TABLE schedules ADD COLUMN status ENUM('scheduled','cancelled') NOT NULL DEFAULT 'scheduled' AFTER schedule_date",
    "SELECT 'status column already exists'"
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add 'schedule_type' column if it doesn't exist
SET @col2_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = process.env.DB_NAME || 'classroom_tracker_main'
      AND TABLE_NAME   = 'schedules'
      AND COLUMN_NAME  = 'schedule_type'
);

SET @sql2 := IF(@col2_exists = 0,
    "ALTER TABLE schedules ADD COLUMN schedule_type ENUM('class','exam') NOT NULL DEFAULT 'class' AFTER status",
    "SELECT 'schedule_type column already exists'"
);
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Drop old unique_room_slot constraint if it exists (was on 3 cols, now we use app-level checks)
SET @con_exists := (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA     = process.env.DB_NAME || 'classroom_tracker_main'
      AND TABLE_NAME       = 'schedules'
      AND CONSTRAINT_NAME  = 'unique_room_slot'
);

SET @sql3 := IF(@con_exists > 0,
    "ALTER TABLE schedules DROP INDEX unique_room_slot",
    "SELECT 'unique_room_slot constraint not found, skipping'"
);
PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

-- Add status index
CREATE INDEX IF NOT EXISTS idx_schedule_status ON schedules(status);

SELECT 'Migration complete. Existing schedules set to status=scheduled, type=class.' AS result;
