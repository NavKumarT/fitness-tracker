import { db } from './index';

type ConsistencyPoint = {
  date: string; // YYYY-MM-DD
  count: number;
};

type WeeklyStat = {
  weekLabel: string; // "Dec 18"
  volume: number;
  durationMs: number;
  workoutCount: number;
};

// Returns a list of dates and workout counts for the last X days
export function getConsistencyHeatmap(days = 90): ConsistencyPoint[] {
  // SQLite doesn't have a simple Date range generator, so we just query active days 
  // and the UI will fill in the gaps / grid.

  // We GROUP BY date(started_at / 1000, 'unixepoch', 'localtime')
  const rows = db.getAllSync<{ day: string; cnt: number }>(`
    SELECT 
      date(started_at / 1000, 'unixepoch', 'localtime') as day,
      count(*) as cnt
    FROM workouts
    WHERE started_at > (unixepoch('now') - ? * 86400) * 1000
    GROUP BY day
  `, [days]);

  return rows.map(r => ({ date: r.day, count: r.cnt }));
}

// Returns aggregate volume/time per week for the last 6 weeks
export function getWeeklyStats(): WeeklyStat[] {
  // This is a bit complex in pure SQLite. 
  // We'll fetch all individual workout summaries for the last 45 days 
  // and aggregate in JS for simplicity and safety.

  const cutoff = Date.now() - (45 * 24 * 60 * 60 * 1000);

  const rows = db.getAllSync<{
    started_at: number;
    duration: number | null;
    total_volume: number;
  }>(`
    SELECT 
      w.started_at,
      w.duration,
      COALESCE(SUM(ws.weight * ws.reps), 0) as total_volume
    FROM workouts w
    LEFT JOIN workout_exercises we ON w.id = we.workout_id
    LEFT JOIN workout_sets ws ON we.id = ws.workout_exercise_id
    WHERE w.started_at > ?
    GROUP BY w.id
    ORDER BY w.started_at ASC
  `, [cutoff]);

  // Group by "Week starting Monday"
  const weeks = new Map<string, WeeklyStat>();

  rows.forEach(row => {
    const date = new Date(row.started_at);
    // Get start of week (Monday)
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const startOfWeek = new Date(date.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    // Label: "Dec 18"
    const label = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (!weeks.has(label)) {
      weeks.set(label, { weekLabel: label, volume: 0, durationMs: 0, workoutCount: 0 });
    }

    const w = weeks.get(label)!;
    w.volume += row.total_volume;
    w.durationMs += (row.duration || 0);
    w.workoutCount += 1;
  });

  // Convert map to array and take last 6
  return Array.from(weeks.values()).slice(-6);
}

export type MuscleUsage = {
  muscle: string;
  setCount: number;
  volume: number;
};

// Returns aggregate set count and volume per muscle for the last X days
export function getMuscleUsage(days = 30): MuscleUsage[] {
  const rows = db.getAllSync<{
    primary_muscle: string;
    set_count: number;
    total_volume: number;
  }>(`
    SELECT 
      e.primary_muscle,
      COUNT(ws.id) as set_count,
      COALESCE(SUM(ws.weight * ws.reps), 0) as total_volume
    FROM workouts w
    JOIN workout_exercises we ON w.id = we.workout_id
    JOIN exercises e ON we.exercise_id = e.id
    JOIN workout_sets ws ON we.id = ws.workout_exercise_id
    WHERE w.started_at > (unixepoch('now') - ? * 86400) * 1000
    GROUP BY e.primary_muscle
    ORDER BY total_volume DESC
  `, [days]);

  return rows.map(r => ({
    muscle: r.primary_muscle,
    setCount: r.set_count,
    volume: r.total_volume
  }));
}
