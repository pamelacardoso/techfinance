import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CacheState {
    products: any[];
    customers: any[];
    sales: any[];
    titles: any[];
    setProducts: (products: any[]) => void;
    setCustomers: (customers: any[]) => void;
    setSales: (sales: any[]) => void;
    setTitles: (titles: any[]) => void;
    clearCache: () => void;
}

export const useCache = create<CacheState>()(
    persist(
        (set) => ({
            products: [],
            customers: [],
            sales: [],
            titles: [],
            setProducts: (products) => set({ products }),
            setCustomers: (customers) => set({ customers }),
            setSales: (sales) => set({ sales }),
            setTitles: (titles) => set({ titles }),
            clearCache: () => set({ products: [], customers: [], sales: [], titles: [] }),
        }),
        {
            name: 'cache-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
