import { z } from 'zod';

const envSchema = z.object({
    OPENAI_API_KEY: z.string().default(''),
    API_BASE_URL: z.string().default('https://techfinance-api.fly.dev/'),
    API_FORECAST_URL: z.string().default('https://techfinance-previsao.fly.dev/'),
    API_TOKEN: z.string().default('ronaldo'),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse({
    OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    API_BASE_URL: process.env.EXPO_PUBLIC_API_URL,
    API_TOKEN: process.env.EXPO_PUBLIC_API_TOKEN,
    API_FORECAST_URL: process.env.EXPO_PUBLIC_API_FORECAST_URL,
});
