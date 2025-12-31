import { db } from './index';

export type PRRecord = {
    exerciseId: string;
    exerciseName: string;
    weight: number;
    date: number;
};

export type ExerciseHistoryPoint = {
    date: number;
    maxWeight: number;
};

/**
 * Returns the all-time maximum weight lifted for a specific exercise.
 */
export function getPersonalRecord(exerciseId: string): number {
    const result = db.getFirstSync(
        `
    SELECT MAX(ws.weight) as max_weight
    FROM workout_sets ws
    JOIN workout_exercises we ON ws.workout_exercise_id = we.id
    WHERE we.exercise_id = ?
    `,
        [exerciseId]
    ) as { max_weight: number | null } | null;

    return result?.max_weight ?? 0;
}

/**
 * Returns the history of max weight per day for an exercise (useful for charts).
 */
export function getExerciseHistory(exerciseId: string): ExerciseHistoryPoint[] {
    // We group by workout (started_at) and take the max weight of that session
    return db.getAllSync(
        `
    SELECT 
      w.started_at as date,
      MAX(ws.weight) as maxWeight
    FROM workout_sets ws
    JOIN workout_exercises we ON ws.workout_exercise_id = we.id
    JOIN workouts w ON we.workout_id = w.id
    WHERE we.exercise_id = ? AND ws.weight IS NOT NULL
    GROUP BY w.id
    ORDER BY w.started_at ASC;
    `,
        [exerciseId]
    ) as ExerciseHistoryPoint[];
}

/**
 * Returns a list of the recent exercises where the user hit a "high" weight.
 * Since tracking "real" PR timeline is complex in pure SQL without window functions (finding *when* the max increased),
 * for now we will just return the top heaviest lifts ever recorded.
 * 
 * Ideally: We want "Recent PRs". 
 * Logic: Find the max weight for each exercise. If that max weight occurred in the last N days, it's a recent PR.
 */
export function getRecentPRs(days = 30): PRRecord[] {
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);

    // 1. Get List of all exercises and their absolute MAX weight
    // 2. Check if that MAX weight occurred recently

    // Complexity: If I lifted 100kg 1 year ago, and 100kg yesterday, is it a "Recent PR"? 
    // Maybe not "New", but it's a "Top Lift".
    // Let's refine: "Exercises with Recent Activity" sorted by performance?
    // Let's stick to: "Best Lifts Recently". 

    return db.getAllSync(
        `
    SELECT 
        e.id as exerciseId,
        e.name as exerciseName,
        COALESCE(MAX(ws.weight), 0) as weight,
        MAX(w.started_at) as date
    FROM workout_sets ws
    JOIN workout_exercises we ON ws.workout_exercise_id = we.id
    JOIN workouts w ON we.workout_id = w.id
    JOIN exercises e ON we.exercise_id = e.id
    WHERE w.started_at >= ?
    GROUP BY e.id
    ORDER BY date DESC
    LIMIT 10;
    `,
        [since]
    ) as PRRecord[];
}

/**
 * Simple helper to check if a specific weight is a PR.
 * Returns true if this weight > current existing max (excluding this specific set if we could distinguish, but simpler: > existing max).
 * 
 * Usage: Before saving a set, call `getPersonalRecord`. If newWeight > existingRecord, it's a PR.
 */
export function isNewPR(exerciseId: string, weight: number): boolean {
    const currentMax = getPersonalRecord(exerciseId);
    return weight > currentMax;
}

export type MuscleVolume = {
    muscle: string;
    volume: number;
};

/**
 * Returns the total volume lifted per muscle group in the last N days.
 * Volume = weight * reps.
 * Used for the Body Heatmap visualization.
 */
/**
 * Returns the total volume lifted per muscle group in the last N days.
 * Volume = weight * reps.
 * Used for the Body Heatmap visualization.
 */
export function getMuscleVolumeHeatmap(days = 7): MuscleVolume[] {
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);

    return db.getAllSync(
        `
        SELECT 
            e.primary_muscle as muscle,
            COUNT(ws.id) as volume
        FROM workout_sets ws
        JOIN workout_exercises we ON ws.workout_exercise_id = we.id
        JOIN workouts w ON we.workout_id = w.id
        JOIN exercises e ON we.exercise_id = e.id
        WHERE w.started_at >= ?
        GROUP BY e.primary_muscle;
        `,
        [since]
    ) as MuscleVolume[];
}

/**
 * Calculates the current workout streak (consecutive days with at least one completed workout).
 * Allows for a 1-day gap (i.e., if you worked out yesterday, your streak is still alive).
 */
/**
 * Calculates the current workout streak (consecutive days with at least one completed workout).
 * Uses Local Time for date boundaries.
 */
export function getWorkoutStreak(): number {
    // Fetch raw timestamps needed for checking (limit 1000 to be safe)
    const history = db.getAllSync(`
    SELECT started_at
    FROM workouts
    WHERE ended_at IS NOT NULL
    ORDER BY started_at DESC
    LIMIT 1000; 
  `) as { started_at: number }[];

    if (history.length === 0) return 0;

    // Normalize to Midnight timestamp (Local) and deduplicate
    const uniqueDayTimestamps = Array.from(new Set(
        history.map(h => {
            const d = new Date(h.started_at);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
        })
    )).sort((a, b) => b - a); // DESC

    if (uniqueDayTimestamps.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    const oneDay = 86400000;

    // Check if streak is alive (Last workout was Today or Yesterday)
    const lastWorkoutDay = uniqueDayTimestamps[0];

    // If last workout was before yesterday (more than 1 day gap), streak is 0
    // Note: Math.round avoids DST drift issues for small gaps
    const gap = Math.round((todayTime - lastWorkoutDay) / oneDay);
    if (gap > 1) {
        return 0;
    }

    // Count streak
    let streak = 1;
    let current = uniqueDayTimestamps[0];

    for (let i = 1; i < uniqueDayTimestamps.length; i++) {
        const prev = uniqueDayTimestamps[i];

        const dCurr = new Date(current);
        const dPrev = new Date(prev);

        const diffTime = dCurr.getTime() - dPrev.getTime();
        const diffDays = Math.round(diffTime / oneDay);

        if (diffDays === 1) {
            streak++;
            current = prev;
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Returns activity data for the last 7 days (Today inclusive).
 * Returns array of { date: Date, hasWorkout: boolean }.
 */
export function getWeeklyConsistency(): { date: Date; hasWorkout: boolean }[] {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Return Left->Right: [Today-6, Today-5, ..., Today]
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days.push(d);
    }

    // Start of the window (Local midnight of 6 days ago)
    const startTimestamp = days[0].getTime();

    // Get all workouts in this range
    const workouts = db.getAllSync(`
       SELECT started_at
       FROM workouts
       WHERE ended_at IS NOT NULL AND started_at >= ?
    `, [startTimestamp]) as { started_at: number }[];

    // Helper: Check if any workout matches the specific date (Local)
    const hasWorkoutOnDate = (targetDate: Date) => {
        return workouts.some(w => {
            const wDate = new Date(w.started_at);
            return wDate.getDate() === targetDate.getDate() &&
                wDate.getMonth() === targetDate.getMonth() &&
                wDate.getFullYear() === targetDate.getFullYear();
        });
    };

    return days.map(day => ({
        date: day,
        hasWorkout: hasWorkoutOnDate(day)
    }));
}

export type LifetimeStats = {
    totalWorkouts: number;
    totalVolume: number; // kg/lbs
    totalDurationMs: number;
    currentStreak: number;
};

export function getLifetimeStats(): LifetimeStats {
    // 1. Get Workout Level Stats (Count & Duration)
    const workoutStats = db.getFirstSync<{ cnt: number; dur: number }>(`
        SELECT 
            COUNT(id) as cnt, 
            COALESCE(SUM(duration), 0) as dur
        FROM workouts
        WHERE ended_at IS NOT NULL
    `);

    // 2. Get Volume Stats (Set Level)
    const volumeStats = db.getFirstSync<{ vol: number }>(`
        SELECT 
            COALESCE(SUM(ws.weight * ws.reps), 0) as vol
        FROM workout_sets ws
        JOIN workout_exercises we ON ws.workout_exercise_id = we.id
        JOIN workouts w ON we.workout_id = w.id
        WHERE w.ended_at IS NOT NULL
    `);

    const streak = getWorkoutStreak();

    return {
        totalWorkouts: workoutStats?.cnt ?? 0,
        totalVolume: volumeStats?.vol ?? 0, // kg/lbs
        totalDurationMs: workoutStats?.dur ?? 0,
        currentStreak: streak
    };
}
