
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TipsState = {
    hasDismissedRenameTip: boolean;
    dismissRenameTip: () => void;
    // We can add more tips here
};

export const useTipsStore = create<TipsState>()(
    persist(
        (set) => ({
            hasDismissedRenameTip: false,
            dismissRenameTip: () => set({ hasDismissedRenameTip: true }),
        }),
        {
            name: 'tips-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
