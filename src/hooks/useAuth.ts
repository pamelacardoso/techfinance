import { env } from '@/config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
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
                    // Testa acesso ao servidor antes de autenticar
                    try {
                        await axios.get(env.API_BASE_URL, { timeout: 5000 });
                    } catch (e) {
                        // Falha de conexão
                        return false;
                    }
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
