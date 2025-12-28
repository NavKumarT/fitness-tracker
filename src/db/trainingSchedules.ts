import { db } from './index';
import * as Crypto from 'expo-crypto';
import { TrainingSchedule } from './types';

export function createTrainingSchedule(type: 'weekly' | 'cycle') {
  const id = Crypto.randomUUID();
  const now = Date.now();

  // Deactivate existing schedules
  db.runSync(
    `
    UPDATE training_schedules
    SET is_active = 0;
    `
  );

  // Create new active schedule
  db.runSync(
    `
    INSERT INTO training_schedules
    (id, name, type, current_index, is_active, created_at)
    VALUES (?, ?, ?, 0, 1, ?);
    `,
    [id, 'Default Schedule', type, now]
  );

  return id;
}

// export function getActiveTrainingSchedule() {
//   return db.getFirstSync(
//     `
//     SELECT *
//     FROM training_schedules
//     WHERE is_active = 1
//     LIMIT 1;
//     `
//   );
// }

export function advanceCycleIndex(
  scheduleId: string,
  nextIndex: number
) {
  db.runSync(
    `
    UPDATE training_schedules
    SET current_index = ?
    WHERE id = ?;
    `,
    [nextIndex, scheduleId]
  );
}




export function getActiveTrainingSchedule(): TrainingSchedule | null {
  return db.getFirstSync(
    `
    SELECT id, name, type, current_index, is_active, created_at
    FROM training_schedules
    WHERE is_active = 1
    LIMIT 1;
    `
  ) as TrainingSchedule | null;
}

type WeekDayConfig = {
  weekday: number;
  label: string | null;
  is_rest: boolean;
};

export function createWeeklySchedule(
  name: string,
  days: WeekDayConfig[]
) {
  const scheduleId = Crypto.randomUUID();
  const now = Date.now();

  // 1️⃣ Deactivate existing schedules
  db.runSync(
    `
    UPDATE training_schedules
    SET is_active = 0;
    `
  );

  // 2️⃣ Create weekly schedule
  db.runSync(
    `
    INSERT INTO training_schedules
      (id, name, type, current_index, is_active, created_at)
    VALUES (?, ?, 'weekly', 0, 1, ?);
    `,
    [scheduleId, name, now]
  );

  // 3️⃣ Create training units (one per weekday)
  days.forEach((day) => {
    db.runSync(
      `
      INSERT INTO training_units
        (id, schedule_id, weekday, label, is_rest)
      VALUES (?, ?, ?, ?, ?);
      `,
      [
        Crypto.randomUUID(),
        scheduleId,
        day.weekday,
        day.label,
        day.is_rest ? 1 : 0,
      ]
    );
  });

  return scheduleId;
}
