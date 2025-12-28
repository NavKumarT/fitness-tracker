import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = {
    id: string;
    email?: string; // Optional for Guest
    name: string;
    photoUrl?: string;
    isGuest: boolean;
    provider: 'local' | 'google';
};

type AuthState = {
    user: User | null;
    signIn: (user: User) => void;
    signOut: () => void;
    updateUser: (updates: Partial<User>) => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            signIn: (user) => set({ user }),
            signOut: () => set({ user: null }),
            updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
