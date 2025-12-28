import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../theme/tokens';

type ThemeMode = 'light' | 'dark';

type ThemeStore = {
    mode: ThemeMode;
    colors: typeof darkColors; // Helper to get current colors
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
};

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set, get) => ({
            mode: 'dark', // Default
            colors: darkColors,

            toggleTheme: () => {
                const newMode = get().mode === 'dark' ? 'light' : 'dark';
                set({
                    mode: newMode,
                    colors: newMode === 'dark' ? darkColors : lightColors,
                });
            },

            setTheme: (mode) => {
                set({
                    mode,
                    colors: mode === 'dark' ? darkColors : lightColors,
                });
            },
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => AsyncStorage),
            // We persist 'mode' only, but we need to re-hydrate 'colors' based on mode
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.colors = state.mode === 'dark' ? darkColors : lightColors;
                }
            },
            partialize: (state) => ({ mode: state.mode }), // Only save mode to disk
        }
    )
);
