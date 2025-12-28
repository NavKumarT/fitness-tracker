import { db } from './index';
import * as Crypto from 'expo-crypto';

import {
  getActiveTrainingSchedule,
  advanceCycleIndex,
} from './trainingSchedules';
import {
  resolveTrainingUnitForToday,
  getTrainingUnitsForSchedule,
} from './trainingUnits';
import {
  getExercisesForTrainingUnit,
} from './trainingUnitExercises';

/* ----------------------------------
   Low-level workout creation
----------------------------------- */

function createWorkout(trainingUnitId?: string): string {
  const id = Crypto.randomUUID();
  const startedAt = Date.now();

  db.runSync(
    `INSERT INTO workouts (id, started_at, training_unit_id) VALUES (?, ?, ?);`,
    [id, startedAt, trainingUnitId ?? null]
  );

  return id;
}

/* ----------------------------------
   Public API
----------------------------------- */

export function startWorkout(): string {
  return createWorkout();
}

export function endWorkout(workoutId: string) {
  const endedAt = Date.now();

  const workout = db.getFirstSync(
    `
    SELECT started_at
    FROM workouts
    WHERE id = ?;
    `,
    [workoutId]
  ) as { started_at: number } | null;

  if (!workout) return;

  const duration =
    Math.max(0, endedAt - workout.started_at);

  db.runSync(
    `
    UPDATE workouts
    SET ended_at = ?, duration = ?
    WHERE id = ?;
    `,
    [endedAt, duration, workoutId]
  );
}


/* ----------------------------------
   Template-based workout
----------------------------------- */

export function startWorkoutFromTemplate(force = false): string | null {
  const schedule = getActiveTrainingSchedule();
  if (!schedule) return null;

  const units = getTrainingUnitsForSchedule(schedule.id);
  if (units.length === 0) return null;

  const unit = resolveTrainingUnitForToday(schedule);
  if (!unit || (!force && unit.is_rest === 1)) return null;

  let workoutId: string | null = null;

  // 🔒 ATOMIC TRANSACTION
  db.execSync('BEGIN TRANSACTION;');

  try {
    workoutId = createWorkout(unit.id);

    const exercises = getExercisesForTrainingUnit(unit.id);

    exercises.forEach((exercise, index) => {
      db.runSync(
        `
        INSERT INTO workout_exercises
        (id, workout_id, exercise_id, position)
        VALUES (?, ?, ?, ?);
        `,
        [Crypto.randomUUID(), workoutId, exercise.id, index]
      );
    });

    // Advance cycle index safely
    if (schedule.type === 'cycle') {
      const nextIndex =
        (unit.order_index + 1) % units.length;

      advanceCycleIndex(schedule.id, nextIndex);
    }

    db.execSync('COMMIT;');
    return workoutId;
  } catch (e) {
    db.execSync('ROLLBACK;');
    throw e;
  }
}

export function addExercisesToWorkout(workoutId: string, exerciseIds: string[]) {
  if (exerciseIds.length === 0) return;

  db.execSync('BEGIN TRANSACTION;');
  try {
    // Get current max position
    const result = db.getFirstSync(
      `SELECT MAX(position) as maxPos FROM workout_exercises WHERE workout_id = ?`,
      [workoutId]
    ) as { maxPos: number | null };

    let currentPos = (result?.maxPos ?? -1) + 1;

    exerciseIds.forEach((exerciseId) => {
      db.runSync(
        `
        INSERT INTO workout_exercises
        (id, workout_id, exercise_id, position)
        VALUES (?, ?, ?, ?);
        `,
        [Crypto.randomUUID(), workoutId, exerciseId, currentPos]
      );
      currentPos++;
    });

    db.execSync('COMMIT;');
  } catch (e) {
    db.execSync('ROLLBACK;');
    throw e;
  }
}


export function getIncompleteWorkout(): string | null {
  const row = db.getFirstSync(
    `
    SELECT id
    FROM workouts
    WHERE ended_at IS NULL
    ORDER BY started_at DESC
    LIMIT 1;
    `
  ) as { id: string } | null;

  return row?.id ?? null;
}

export function isWorkoutEmpty(workoutId: string): boolean {
  // Check if it has any exercises
  const result = db.getFirstSync(
    `SELECT COUNT(*) as count FROM workout_exercises WHERE workout_id = ?`,
    [workoutId]
  ) as { count: number } | null;

  return (result?.count ?? 0) === 0;
}

export function hasCompletedWorkoutToday(requiredUnitId?: string): boolean {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const query = requiredUnitId
    ? `
      SELECT id
      FROM workouts
      WHERE ended_at IS NOT NULL
        AND ended_at >= ?
        AND training_unit_id = ?
      LIMIT 1;
      `
    : `
      SELECT id
      FROM workouts
      WHERE ended_at IS NOT NULL
        AND ended_at >= ?
      LIMIT 1;
      `;

  const args = requiredUnitId
    ? [startOfDay.getTime(), requiredUnitId]
    : [startOfDay.getTime()];

  const row = db.getFirstSync(query, args) as { id: string } | null;

  return !!row;
}


export function getLastCompletedWorkoutId(): string | null {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const row = db.getFirstSync(
    `
    SELECT id
    FROM workouts
    WHERE ended_at IS NOT NULL
      AND ended_at >= ?
    ORDER BY ended_at DESC
    LIMIT 1;
    `,
    [startOfDay.getTime()]
  ) as { id: string } | null;


  return row?.id ?? null;
}

export function hasCompletedWorkoutForScheduleToday(scheduleId: string): boolean {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const row = db.getFirstSync(
    `
    SELECT w.id
    FROM workouts w
    JOIN training_units tu ON w.training_unit_id = tu.id
    WHERE w.ended_at IS NOT NULL
      AND w.ended_at >= ?
      AND tu.schedule_id = ?
    LIMIT 1;
    `,
    [startOfDay.getTime(), scheduleId]
  ) as { id: string } | null;

  return !!row;
}

export function discardWorkout(workoutId: string) {
  db.execSync('BEGIN TRANSACTION;');
  try {
    db.runSync('DELETE FROM workout_sets WHERE workout_exercise_id IN (SELECT id FROM workout_exercises WHERE workout_id = ?)', [workoutId]);
    db.runSync('DELETE FROM workout_exercises WHERE workout_id = ?', [workoutId]);
    db.runSync('DELETE FROM workouts WHERE id = ?', [workoutId]);
    db.execSync('COMMIT;');
  } catch (e) {
    db.execSync('ROLLBACK;');
    throw e;
  }
}
