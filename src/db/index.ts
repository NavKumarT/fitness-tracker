import * as SQLite from 'expo-sqlite';
import { seedExercises } from './seeds/seedExercises';

export const db = SQLite.openDatabaseSync('fitness.db');

export function initDb() {
  // ======================
  // CONFIG
  // ======================
  db.execSync('PRAGMA journal_mode = WAL;');
  db.execSync('PRAGMA foreign_keys = ON;');

  // ======================
  // CORE TABLES
  // ======================
  db.execSync(`
    -- ======================
    -- WORKOUTS
    -- ======================

    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY NOT NULL,
      started_at INTEGER NOT NULL,
      ended_at INTEGER,
      duration INTEGER
    );

    CREATE TABLE IF NOT EXISTS workout_exercises (
      id TEXT PRIMARY KEY NOT NULL,
      workout_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      FOREIGN KEY (workout_id) REFERENCES workouts(id),
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    );

    CREATE TABLE IF NOT EXISTS workout_sets (
      id TEXT PRIMARY KEY NOT NULL,
      workout_exercise_id TEXT NOT NULL,
      set_index INTEGER NOT NULL,
      weight REAL,
      reps INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id)
    );

    -- ======================
    -- EXERCISE LIBRARY
    -- ======================

    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      primary_muscle TEXT NOT NULL,
      equipment TEXT,
      image_url TEXT,
      is_custom INTEGER DEFAULT 0,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS exercise_aliases (
      id TEXT PRIMARY KEY NOT NULL,
      exercise_id TEXT NOT NULL,
      alias TEXT NOT NULL,
      FOREIGN KEY (exercise_id) REFERENCES exercises (id)
    );

    CREATE TABLE IF NOT EXISTS exercise_metadata (
      exercise_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      FOREIGN KEY (exercise_id) REFERENCES exercises (id)
    );

    -- ======================
    -- TRAINING SCHEDULES
    -- ======================

    CREATE TABLE IF NOT EXISTS training_schedules (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,               -- 'cycle' | 'weekly'
      current_index INTEGER DEFAULT 0,  -- used only for cycle
      is_active INTEGER DEFAULT 1,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS training_units (
      id TEXT PRIMARY KEY NOT NULL,
      schedule_id TEXT NOT NULL,
      order_index INTEGER,              -- used only for cycle
      weekday INTEGER,                  -- used only for weekly (0–6)
      label TEXT,
      is_rest INTEGER DEFAULT 0,
      FOREIGN KEY (schedule_id) REFERENCES training_schedules (id)
    );

    CREATE TABLE IF NOT EXISTS training_unit_exercises (
      id TEXT PRIMARY KEY NOT NULL,
      training_unit_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      FOREIGN KEY (training_unit_id) REFERENCES training_units (id),
      FOREIGN KEY (exercise_id) REFERENCES exercises (id)
    );
  `);

  // ======================
  // MIGRATIONS (SAFE)
  // ======================

  // Add weekday column for weekly schedules (existing installs)
  try {
    db.runSync(
      `ALTER TABLE training_units ADD COLUMN weekday INTEGER;`
    );
  } catch {
    // Column already exists — safe to ignore
  }

  // Add image_url to exercises
  try {
    db.runSync(
      `ALTER TABLE exercises ADD COLUMN image_url TEXT;`
    );
  } catch {
    // Column already exists
  }

  // Add training_unit_id to workouts
  try {
    db.runSync(
      `ALTER TABLE workouts ADD COLUMN training_unit_id TEXT;`
    );
  } catch {
    // Column already exists
  }

  // ======================
  // SYNC MIGRATIONS
  // ======================
  const tablesToSync = [
    'workouts',
    'workout_exercises',
    'workout_sets',
    'training_schedules',
    'training_units',
    'training_unit_exercises'
  ];

  tablesToSync.forEach(table => {
    try { db.runSync(`ALTER TABLE ${table} ADD COLUMN userId TEXT;`); } catch { }
    try { db.runSync(`ALTER TABLE ${table} ADD COLUMN syncStatus INTEGER DEFAULT 0;`); } catch { } // 0=Synced, 1=Pending, 2=Error
    try { db.runSync(`ALTER TABLE ${table} ADD COLUMN updatedAt INTEGER;`); } catch { }
  });

  // ======================
  // SEED DATA
  // ======================
  seedExercises();
}
