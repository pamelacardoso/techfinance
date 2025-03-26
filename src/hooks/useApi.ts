import { api } from '@/lib/api';
import { AxiosRequestConfig } from 'axios';
import { useCache } from './useCache';
import { useConnection } from './useConnection';

export function useApi() {
    const { isOnline, setOnline, setLastSync } = useConnection();
    const cache = useCache();

    const fetchWithCache = async <T>(
        endpoint: string,
        options: AxiosRequestConfig = {}
    ): Promise<T> => {
        try {
            const response = await api(endpoint, options);

            setOnline(true);
            setLastSync(new Date().toISOString());

            switch (endpoint) {
                case '/products':
                    cache.setProducts(response.data);
                    break;
                case '/customers':
                    cache.setCustomers(response.data);
                    break;
                case '/sales':
                    cache.setSales(response.data);
                    break;
                case '/titles':
                    cache.setTitles(response.data);
                    break;
            }

            return response.data;
        } catch (error) {
            setOnline(false);

            switch (endpoint) {
                case '/products':
                    return cache.products as T;
                case '/customers':
                    return cache.customers as T;
                case '/sales':
                    return cache.sales as T;
                case '/titles':
                    return cache.titles as T;
                default:
                    throw error;
            }
        }
    };

    return {
        fetchWithCache,
        isOnline,
        lastSync: useConnection((state) => state.lastSync),
    };
}
