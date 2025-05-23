import { OpenAIService } from '@/services/openai.service';
import { WhoEnum } from '@/types/message';
import { useConnection } from './useConnection';

export function useOpenAI() {
    const { isOnline, setOnline, setLastSync } = useConnection();
    const openaiService = new OpenAIService();

    const generateWithCache = async (
        prompt: string,
        imageUri?: string
    ): Promise<void> => {
        try {
            if (imageUri) {
                await openaiService.sendImageMessage(prompt, imageUri);
            } else {
                await openaiService.sendMessage(prompt);
            }

            setOnline(true);
            setLastSync(new Date().toISOString());
        } catch (error) {
            console.error(error);
            setOnline(false);

            openaiService.messages.push({
                message: 'Desculpe, estou temporariamente offline. Por favor, tente novamente mais tarde.',
                who: WhoEnum.bot,
            });
        }
    };

    return {
        generateWithCache,
        messages: openaiService.messages,
        isOnline,
        lastSync: useConnection((state) => state.lastSync),
    };
}
