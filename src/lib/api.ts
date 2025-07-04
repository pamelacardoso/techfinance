import { env } from "@/config/env";
import axios from "axios";

export const api = axios.create({
    baseURL: env.API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${env.API_TOKEN}`
    },
});


export const apiForecast = axios.create({
    baseURL: env.API_FORECAST_URL,
    headers: {
        'Authorization': `Bearer ${env.API_TOKEN}`
    },
});
