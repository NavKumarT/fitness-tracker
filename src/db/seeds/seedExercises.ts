import { db } from '../index';
import { EXERCISE_SEED } from './exercises';

export function seedExercises() {
  const now = Date.now();

  EXERCISE_SEED.forEach((ex) => {
    // Insert exercise if not exists
    db.runSync(
      `
      INSERT INTO exercises
      (id, name, primary_muscle, equipment, image_url, is_custom, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
      ON CONFLICT(id) DO UPDATE SET
        image_url = excluded.image_url,
        primary_muscle = excluded.primary_muscle,
        equipment = excluded.equipment;
      `,
      [ex.id, ex.name, ex.primary_muscle, ex.equipment, ex.image_url, now]
    );

    // Insert aliases
    ex.aliases.forEach((alias) => {
      db.runSync(
        `
        INSERT OR IGNORE INTO exercise_aliases
        (id, exercise_id, alias)
        VALUES (?, ?, ?);
        `,
        [`${ex.id}:${alias}`, ex.id, alias]
      );
    });
  });
}
