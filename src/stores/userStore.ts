import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeightUnit } from '../utils/units';

interface UserState {
    weightUnit: WeightUnit;
    toggleWeightUnit: () => void;
    setWeightUnit: (unit: WeightUnit) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            weightUnit: 'kg', // Default to KG
            toggleWeightUnit: () =>
                set((state) => ({
                    weightUnit: state.weightUnit === 'kg' ? 'lbs' : 'kg',
                })),
            setWeightUnit: (unit) => set({ weightUnit: unit }),
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
