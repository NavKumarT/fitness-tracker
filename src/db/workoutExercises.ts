import { db } from './index';

export type WorkoutExercise = {
  id: string;
  workout_id: string;
  exercise_id: string;
  position: number;
  name: string;
  primary_muscle: string;
  image_url?: string;
};

export function getWorkoutExercises(
  workoutId: string
): WorkoutExercise[] {
  return db.getAllSync(
    `
    SELECT
      we.id,
      we.workout_id,
      we.exercise_id,
      we.position,
      e.name,
      e.primary_muscle,
      e.image_url
    FROM workout_exercises we
    JOIN exercises e ON e.id = we.exercise_id
    WHERE we.workout_id = ?
    ORDER BY we.position ASC;
    `,
    [workoutId]
  ) as WorkoutExercise[];
}
