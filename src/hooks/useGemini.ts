import { GeminiService, WhoEnum } from '@/services/gemini.service';
import { useConnection } from './useConnection';

export function useGemini() {
    const { isOnline, setOnline, setLastSync } = useConnection();
    const geminiService = new GeminiService();

    const generateWithCache = async (
        prompt: string,
        imageUri?: string
    ): Promise<void> => {
        try {
            if (imageUri) {
                await geminiService.sendImageMessage(prompt, imageUri);
            } else {
                await geminiService.sendMessage(prompt);
            }

            setOnline(true);
            setLastSync(new Date().toISOString());
        } catch (error) {
            setOnline(false);

            geminiService.messages.push({
                message: "Desculpe, estou temporariamente offline. Por favor, tente novamente mais tarde.",
                who: WhoEnum.bot
            });
        }
    };

    return {
        generateWithCache,
        messages: geminiService.messages,
        isOnline,
        lastSync: useConnection((state) => state.lastSync),
    };
}
