import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, THEME_PRESETS, ThemeAccent } from '../theme/tokens';

type ThemeMode = 'light' | 'dark';

type ThemeStore = {
    mode: ThemeMode;
    accentColor: ThemeAccent;
    colors: typeof darkColors; // Helper to get current colors
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
    setAccentColor: (accent: ThemeAccent) => void;
};

// Helper to generate colors
const getThemeColors = (mode: ThemeMode, accent: ThemeAccent) => {
    const base = mode === 'dark' ? darkColors : lightColors;
    const accentColors = THEME_PRESETS[accent];

    return {
        ...base,
        accent: {
            ...base.accent,
            primary: accentColors.primary,
            secondary: accentColors.secondary,
        },
        semantic: {
            ...base.semantic,
            success: accentColors.primary, // Often success is linked to primary in fitness apps
        }
    };
};

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set, get) => ({
            mode: 'dark', // Default
            accentColor: 'emerald', // Default
            colors: getThemeColors('dark', 'emerald'),

            toggleTheme: () => {
                const newMode = get().mode === 'dark' ? 'light' : 'dark';
                set({
                    mode: newMode,
                    colors: getThemeColors(newMode, get().accentColor),
                });
            },

            setTheme: (mode) => {
                set({
                    mode,
                    colors: getThemeColors(mode, get().accentColor),
                });
            },

            setAccentColor: (accent) => {
                set({
                    accentColor: accent,
                    colors: getThemeColors(get().mode, accent),
                });
            }
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => AsyncStorage),
            // Rehydrate colors based on persisted accent and mode
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.colors = getThemeColors(state.mode, state.accentColor);
                }
            },
            partialize: (state) => ({ mode: state.mode, accentColor: state.accentColor }), // Persist mode and accent
        }
    )
);
