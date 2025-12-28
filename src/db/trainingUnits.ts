import { db } from './index';
import * as Crypto from 'expo-crypto';
import { TrainingUnit } from './types';
// import { TrainingUnit } from './types';

export function createTrainingUnit(
  scheduleId: string,
  orderIndex: number,
  label: string,
  isRest: boolean
) {
  const id = Crypto.randomUUID();

  db.runSync(
    `
    INSERT INTO training_units
    (id, schedule_id, order_index, label, is_rest)
    VALUES (?, ?, ?, ?, ?);
    `,
    [id, scheduleId, orderIndex, label, isRest ? 1 : 0]
  );

  return id;
}

export function getTrainingUnits(scheduleId: string) {
  return db.getAllSync(
    `
    SELECT *
    FROM training_units
    WHERE schedule_id = ?
    ORDER BY order_index ASC;
    `,
    [scheduleId]
  );
}

// import { db } from './index';
export function getTrainingUnitsForSchedule(
  scheduleId: string
): TrainingUnit[] {
  return db.getAllSync(
    `
    SELECT id, schedule_id, order_index, label, is_rest
    FROM training_units
    WHERE schedule_id = ?
    ORDER BY order_index ASC;
    `,
    [scheduleId]
  ) as TrainingUnit[];
}

export function resolveTrainingUnitForToday(
  schedule: { id: string; type: 'cycle' | 'weekly'; current_index: number }
): TrainingUnit | null {
  // WEEKLY
  if (schedule.type === 'weekly') {
    const jsDay = new Date().getDay(); // Sun = 0
    // DB convention: 1=Mon, ..., 6=Sat, 0=Sun (matching Date.getDay?)
    // In WeeklyBuilder, we used: 1=Mon, ..., 6=Sat, 0=Sun. 
    // Wait, let's verify WeeklyScheduleBuilder values: 
    // Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6, Sun=0.
    // Date.getDay(): Sun=0, Mon=1. Perfect match.

    return db.getFirstSync(
      `
      SELECT *
      FROM training_units
      WHERE schedule_id = ?
        AND weekday = ?
      LIMIT 1;
      `,
      [schedule.id, jsDay]
    ) as TrainingUnit | null;
  }

  // CYCLE
  const units = db.getAllSync(
    `
    SELECT *
    FROM training_units
    WHERE schedule_id = ?
    ORDER BY order_index ASC;
    `,
    [schedule.id]
  ) as TrainingUnit[];

  if (units.length === 0) return null;

  const unit = units[schedule.current_index] ?? null;

  if (unit && unit.is_rest === 1) {
    // find next non-rest unit in the future (this session only? or skip rest days?)
    // Interpretation: "Today's unit" is simply the current index.
    // If it is a rest day, the UI shows Rest Day.
    return unit;
  }

  return unit;
}

export function resolveNextTrainingUnit(
  scheduleId: string,
  currentIndex: number, // Meaningless for 'weekly'
  type: 'cycle' | 'weekly'
) {
  if (type === 'weekly') {
    const today = new Date().getDay();
    // Look ahead 7 days
    for (let i = 1; i <= 7; i++) {
      const nextDay = (today + i) % 7;
      const unit = db.getFirstSync(
        `
            SELECT *
            FROM training_units
            WHERE schedule_id = ?
            AND weekday = ?
            LIMIT 1;
            `,
        [scheduleId, nextDay]
      ) as { id: string; label: string | null; is_rest: number; weekday: number } | null;

      if (unit && unit.is_rest === 0) {
        return { unit, daysAway: i };
      }
    }
    return null;
  }

  // CYCLE
  const units = db.getAllSync(
    `
    SELECT *
    FROM training_units
    WHERE schedule_id = ?
    ORDER BY order_index ASC;
    `,
    [scheduleId]
  ) as Array<{
    id: string;
    label: string | null;
    is_rest: number;
    order_index: number;
  }>;

  if (!units.length) return null;

  const total = units.length;

  for (let offset = 1; offset <= total; offset++) {
    const idx = (currentIndex + offset) % total;
    const unit = units[idx];

    if (unit.is_rest === 0) {
      return { unit, daysAway: offset };
    }
  }

  return null;
}

export function getWeeklyWorkoutUnits(scheduleId: string) {
  return db.getAllSync(
    `
    SELECT *
    FROM training_units
    WHERE schedule_id = ?
      AND is_rest = 0
    ORDER BY weekday ASC;
    `,
    [scheduleId]
  ) as Array<{
    id: string;
    label: string | null;
    weekday: number;
  }>;
}

export function getTrainingUnitByWeekday(
  scheduleId: string,
  weekday: number
) {
  return db.getFirstSync(
    `
    SELECT *
    FROM training_units
    WHERE schedule_id = ?
      AND weekday = ?
    LIMIT 1;
    `,
    [scheduleId, weekday]
  ) as { id: string } | null;
}

// ... existing code ...

export function addExerciseToTrainingUnit(
  trainingUnitId: string,
  exerciseId: string,
  position: number
) {
  db.runSync(
    `
    INSERT INTO training_unit_exercises
      (id, training_unit_id, exercise_id, position)
    VALUES (?, ?, ?, ?);
    `,
    [
      Crypto.randomUUID(),
      trainingUnitId,
      exerciseId,
      position,
    ]
  );
}

export function getScheduleWithExercises(scheduleId: string) {
  // Get all units
  const units = db.getAllSync(
    `
    SELECT id, label, is_rest, weekday, order_index
    FROM training_units
    WHERE schedule_id = ?
    ORDER BY order_index ASC, weekday ASC;
    `,
    [scheduleId]
  ) as Array<{
    id: string;
    label: string | null;
    is_rest: number;
    weekday: number | null;
    order_index: number | null;
  }>;

  // Enhance with exercises
  return units.map((unit) => {
    const exercises = db.getAllSync(
      `
      SELECT e.id, e.name, e.primary_muscle, tue.position
      FROM training_unit_exercises tue
      JOIN exercises e ON tue.exercise_id = e.id
      WHERE tue.training_unit_id = ?
      ORDER BY tue.position ASC;
      `,
      [unit.id]
    ) as Array<{
      id: string;
      name: string;
      primary_muscle: string;
    }>;

    return { ...unit, exercises };
  });
}
