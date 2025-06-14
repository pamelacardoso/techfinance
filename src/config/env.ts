import Constants from 'expo-constants';
import { z } from 'zod';

export const envSchema = z.object({
    OPENAI_API_KEY: z.string().default(''),
    API_BASE_URL: z.string().default('https://techfinance-api.fly.dev/'),
    API_TOKEN: z.string().default(''),
});

export type Env = z.infer<typeof envSchema>;
export const env = envSchema.parse(Constants.expoConfig?.extra);

console.log(env.API_BASE_URL);
