import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
    isAuthenticated: boolean;
    user: {
        email: string;
        name: string;
    } | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            user: null,
            login: async (email: string, password: string) => {
                if (email === 'admin' && password === 'admin') {
                    set({
                        isAuthenticated: true,
                        user: {
                            email,
                            name: 'Admin'
                        }
                    });
                    return true;
                }
                return false;
            },
            logout: async () => {
                set({
                    isAuthenticated: false,
                    user: null
                });
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
