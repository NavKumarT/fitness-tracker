import { db } from './index';

export function getWorkoutHistory(order: 'ASC' | 'DESC' = 'DESC') {
  return db.getAllSync(
    `
    SELECT
      w.id,
      w.started_at,
      w.ended_at,
      w.duration,
      COUNT(DISTINCT we.exercise_id) as exercise_count,
      COALESCE(SUM(ws.weight * ws.reps), 0) as total_volume
    FROM workouts w
    LEFT JOIN workout_exercises we
      ON w.id = we.workout_id
    LEFT JOIN workout_sets ws
      ON we.id = ws.workout_exercise_id
    WHERE w.ended_at IS NOT NULL
    GROUP BY w.id
    ORDER BY w.started_at ${order};
    `
  ) as Array<{
    id: string;
    started_at: number;
    ended_at: number;
    duration: number | null;
    exercise_count: number;
    total_volume: number;
  }>;
}


export function getWorkoutDetail(workoutId: string) {
  return db.getAllSync(
    `
    SELECT
      e.name as exercise,
      ws.weight,
      ws.reps,
      ws.set_index
    FROM workout_sets ws
    JOIN workout_exercises we
      ON ws.workout_exercise_id = we.id
    JOIN exercises e
      ON we.exercise_id = e.id
    WHERE we.workout_id = ?
    ORDER BY we.position ASC, ws.set_index ASC;
    `,
    [workoutId]
  ) as Array<{
    exercise: string;
    weight: number;
    reps: number;
    set_index: number;
  }>;
}

export function getWorkoutById(workoutId: string) {
  return db.getFirstSync(
    `
    SELECT *
    FROM workouts
    WHERE id = ?;
    `,
    [workoutId]
  ) as {
    id: string;
    started_at: number;
    ended_at: number | null;
    duration: number | null; // stored duration in seconds or null
  } | null;
}
