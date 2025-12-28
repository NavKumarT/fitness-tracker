import { db } from './index';

export type WorkoutSummary = {
  durationMinutes: number;
  exerciseCount: number;
  setCount: number;
};

export function getWorkoutSummary(
  workoutId: string
): WorkoutSummary {
  const durationRow = db.getFirstSync(
    `
    SELECT
      (ended_at - started_at) / 60000 as duration
    FROM workouts
    WHERE id = ?;
    `,
    [workoutId]
  ) as { duration: number } | null;

  const exerciseRow = db.getFirstSync(
    `
    SELECT COUNT(*) as count
    FROM workout_exercises
    WHERE workout_id = ?;
    `,
    [workoutId]
  ) as { count: number };

  const setRow = db.getFirstSync(
    `
    SELECT COUNT(*) as count
    FROM workout_sets ws
    JOIN workout_exercises we
      ON ws.workout_exercise_id = we.id
    WHERE we.workout_id = ?;
    `,
    [workoutId]
  ) as { count: number };

  return {
    durationMinutes: Math.max(
      1,
      Math.round(durationRow?.duration ?? 0)
    ),
    exerciseCount: exerciseRow.count,
    setCount: setRow.count,
  };
}
