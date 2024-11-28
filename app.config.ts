import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: "techfinance",
    slug: "techfinance",
    scheme: "techfinance",
    version: "1.0.0",
    orientation: "portrait",
    owner: "techfinance",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
    },
    ios: {
        supportsTablet: true,
        bundleIdentifier: "com.techfinance.app"
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#ffffff"
        },
        package: "br.com.techfinance.app"
    },
    web: {
        favicon: "./assets/favicon.png"
    },
    plugins: [
        "expo-router"
    ],
    extra: {
        geminiApiKey: process.env.GEMINI_API_KEY,
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_ANON_KEY,
        eas: {
            projectId: "b482baa0-eb1e-4501-a7b0-9878a9beb8fa",
        }
    },
});
