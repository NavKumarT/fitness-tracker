
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UIState = {
    isMinimalistMode: boolean;
    toggleMinimalistMode: () => void;
    setMinimalistMode: (value: boolean) => void;
};

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            isMinimalistMode: false, // Default to false (Premium) per user request
            toggleMinimalistMode: () => set((state) => ({ isMinimalistMode: !state.isMinimalistMode })),
            setMinimalistMode: (value) => set({ isMinimalistMode: value }),
        }),
        {
            name: 'ui-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
