import Constants from 'expo-constants';
import { z } from 'zod';

export const envSchema = z.object({
    OPENAI_API_KEY: z.string().default('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'),
    API_BASE_URL: z.string().default('https://techfinance-api.fly.dev/'),
    API_TOKEN: z.string().default('ronaldo'),
});

export type Env = z.infer<typeof envSchema>;
export const env = envSchema.parse(Constants.expoConfig?.extra);
