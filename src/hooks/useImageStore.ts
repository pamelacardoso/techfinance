import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ImageStore {
    imageUri: string | null;
    setImageUri: (uri: string | null) => void;
}

export const useImageStore = create<ImageStore>()(
    persist(
        (set) => ({
            imageUri: null,
            setImageUri: (uri) => set({ imageUri: uri }),
        }),
        {
            name: 'image-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
