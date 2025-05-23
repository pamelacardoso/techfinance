import Constants from 'expo-constants';
import { z } from 'zod';

export const envSchema = z.object({
    OPENAI_API_KEY: z.string(),
    API_BASE_URL: z.string().default('https://techfinance-api.fly.dev/'),
    API_TOKEN: z.string().default('ronaldo'),
});

export type Env = z.infer<typeof envSchema>;
export const env = envSchema.parse(Constants.expoConfig?.extra);
