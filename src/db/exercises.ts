import * as Crypto from 'expo-crypto';
import { db } from './index';

export type Exercise = {
  id: string;
  name: string;
  primary_muscle: string;
  image_url?: string;
  aliases?: string; // Comma separated
};

export function getAllExercises(): Exercise[] {
  return db.getAllSync(
    `
    SELECT 
      e.id, 
      e.name, 
      e.primary_muscle, 
      e.image_url,
      GROUP_CONCAT(ea.alias, ',') as aliases
    FROM exercises e
    LEFT JOIN exercise_aliases ea ON e.id = ea.exercise_id
    GROUP BY e.id
    ORDER BY e.primary_muscle, e.name;
    `
  );
}

export function createCustomExercise(name: string): string {
  const id = Crypto.randomUUID();
  const now = Date.now();

  db.runSync(
    `INSERT INTO exercises (id, name, primary_muscle, equipment, image_url, is_custom, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, name, 'Other', 'Other', null, 1, now]
  );

  return id;
}
