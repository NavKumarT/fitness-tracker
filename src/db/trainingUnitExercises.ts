import { db } from './index';
import * as Crypto from 'expo-crypto';

export function saveExercisesForTrainingUnit(
  trainingUnitId: string,
  exerciseIds: string[]
) {
  // Clear existing selections (safe for edits later)
  db.runSync(
    `
    DELETE FROM training_unit_exercises
    WHERE training_unit_id = ?;
    `,
    [trainingUnitId]
  );

  exerciseIds.forEach((exerciseId, index) => {
    db.runSync(
      `
      INSERT INTO training_unit_exercises
      (id, training_unit_id, exercise_id, position)
      VALUES (?, ?, ?, ?);
      `,
      [Crypto.randomUUID(), trainingUnitId, exerciseId, index]
    );
  });
}


export type UnitExercise = {
  id: string; // exercise ID
  name: string;
  primary_muscle: string;
  image_url?: string;
};

export function getExercisesForTrainingUnit(
  trainingUnitId: string
): UnitExercise[] {
  return db.getAllSync(
    `
    SELECT 
      e.id, 
      e.name, 
      e.primary_muscle, 
      e.image_url
    FROM training_unit_exercises tue
    JOIN exercises e ON e.id = tue.exercise_id
    WHERE tue.training_unit_id = ?
    ORDER BY tue.position ASC;
    `,
    [trainingUnitId]
  ) as UnitExercise[];
}
