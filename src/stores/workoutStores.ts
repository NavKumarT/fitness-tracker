import { create } from 'zustand';
import { getIncompleteWorkout } from '../db/workouts';


type WorkoutStore = {
  activeWorkoutId: string | null;

  setActiveWorkout: (id: string) => void;
  endWorkout: () => void;

  hydrate: () => void;
};

export const useWorkoutStore = create<WorkoutStore>((set) => ({
  activeWorkoutId: null,

  setActiveWorkout: (id) => {
    set({ activeWorkoutId: id });
  },

  endWorkout: () => {
    set({ activeWorkoutId: null });
  },

  hydrate: () => {
  const id = getIncompleteWorkout();
  if (id) {
    set({ activeWorkoutId: id });
  }
},
}));
