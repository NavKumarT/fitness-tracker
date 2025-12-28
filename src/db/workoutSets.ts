import { db } from './index';
import * as Crypto from 'expo-crypto';
import type { WorkoutSet } from './types';

/* ----------------------------------
   Fetch sets for an exercise
----------------------------------- */

export function getSetsForWorkoutExercise(
  workoutExerciseId: string
): WorkoutSet[] {
  return db.getAllSync(
    `
    SELECT
      id,
      workout_exercise_id,
      set_index,
      weight,
      reps,
      created_at
    FROM workout_sets
    WHERE workout_exercise_id = ?
    ORDER BY set_index ASC;
    `,
    [workoutExerciseId]
  ) as WorkoutSet[];
}

/* ----------------------------------
   Add a new set (append)
----------------------------------- */

export function addSet(
  workoutExerciseId: string
): WorkoutSet {
  const existing = getSetsForWorkoutExercise(workoutExerciseId);
  const nextIndex = existing.length;

  const id = Crypto.randomUUID();
  const createdAt = Date.now();

  // Default to last set values if they exist
  const last = existing[existing.length - 1];

  const weight = last?.weight ?? null;
  const reps = last?.reps ?? null;

  db.runSync(
    `
    INSERT INTO workout_sets
    (id, workout_exercise_id, set_index, weight, reps, created_at)
    VALUES (?, ?, ?, ?, ?, ?);
    `,
    [
      id,
      workoutExerciseId,
      nextIndex,
      weight,
      reps,
      createdAt,
    ]
  );

  return {
    id,
    workout_exercise_id: workoutExerciseId,
    set_index: nextIndex,
    weight,
    reps,
    created_at: createdAt,
  };
}

/* ----------------------------------
   Update a set (save on blur)
----------------------------------- */

export function updateSet(
  setId: string,
  updates: {
    weight?: number | null;
    reps?: number | null;
  }
) {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.weight !== undefined) {
    fields.push('weight = ?');
    values.push(updates.weight);
  }

  if (updates.reps !== undefined) {
    fields.push('reps = ?');
    values.push(updates.reps);
  }

  if (fields.length === 0) return;

  values.push(setId);

  db.runSync(
    `
    UPDATE workout_sets
    SET ${fields.join(', ')}
    WHERE id = ?;
    `,
    values
  );
}

/* ----------------------------------
   Delete a set + reindex
----------------------------------- */

export function deleteSet(setId: string) {
  // Find set to delete
  const target = db.getFirstSync(
    `
    SELECT workout_exercise_id, set_index
    FROM workout_sets
    WHERE id = ?;
    `,
    [setId]
  ) as { workout_exercise_id: string; set_index: number } | null;

  if (!target) return;

  db.execSync('BEGIN TRANSACTION;');

  try {
    // Delete the set
    db.runSync(
      `DELETE FROM workout_sets WHERE id = ?;`,
      [setId]
    );

    // Reindex remaining sets
    db.runSync(
      `
      UPDATE workout_sets
      SET set_index = set_index - 1
      WHERE workout_exercise_id = ?
        AND set_index > ?;
      `,
      [target.workout_exercise_id, target.set_index]
    );

    db.execSync('COMMIT;');
  } catch (e) {
    db.execSync('ROLLBACK;');
    throw e;
  }
}
