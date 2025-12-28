export type TrainingUnit = {
  id: string;
  schedule_id: string;
  order_index: number;
  label: string | null;
  is_rest: number; // 0 or 1 (SQLite)
};

export type TrainingSchedule = {
  id: string;
  name: string;
  type: 'cycle' | 'weekly';
  current_index: number;
  is_active: number; // 0 | 1
  created_at: number;
};

export type WorkoutSet = {
  id: string;
  workout_exercise_id: string;
  set_index: number;
  weight: number | null;
  reps: number | null;
  created_at: number;
};
