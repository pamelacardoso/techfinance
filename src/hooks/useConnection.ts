import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ConnectionState {
    isOnline: boolean;
    lastSync: string | null;
    setOnline: (status: boolean) => void;
    setLastSync: (date: string) => void;
}

export const useConnection = create<ConnectionState>()(
    persist(
        (set) => ({
            isOnline: true,
            lastSync: null,
            setOnline: (status) => set({ isOnline: status }),
            setLastSync: (date) => set({ lastSync: date }),
        }),
        {
            name: 'connection-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
