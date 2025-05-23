import { env } from '@/config/env';
import { MessageModel, WhoEnum } from '@/types/message';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export class OpenAIService {
    private apiKey: string;
    public messages: MessageModel[] = [];

    constructor() {
        this.apiKey = env.OPENAI_API_KEY;
    }

    async sendMessage(prompt: string, addToUI: boolean = true): Promise<void> {
        if (addToUI) {
            this.messages.push({ message: prompt, who: WhoEnum.me });
        }

        const messagesPayload = [
            ...this.messages
                .filter((msg) => msg.who !== WhoEnum.bot) // Optional: enviar só os prompts do usuário
                .map((msg) => ({ role: 'user', content: msg.message })),
            { role: 'user', content: prompt },
        ];

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: messagesPayload,
                }),
            });

            const data = await response.json();

            const text = data?.choices?.[0]?.message?.content;

            if (text) {
                this.messages.push({
                    message: text.trim(),
                    who: WhoEnum.bot,
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    async sendImageMessage(prompt: string, imageUri: string): Promise<void> {
        this.messages.push({ message: prompt, who: WhoEnum.me });

        try {
            const base64Image = await this.getImageBase64(imageUri);

            if (!base64Image) throw new Error('Failed to convert image.');

            const payload = {
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`,
                                },
                            },
                        ],
                    },
                ],
            };

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            const text = data?.choices?.[0]?.message?.content;

            if (text) {
                this.messages.push({
                    message: text.trim(),
                    who: WhoEnum.bot,
                });
            }
        } catch (error) {
            console.error('Error sending image message:', error);
        }
    }

    private async getImageBase64(uri: string): Promise<string | null> {
        try {
            if (Platform.OS === 'web') {
                const response = await fetch(uri);
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64data = reader.result as string;
                        resolve(base64data.split(',')[1]);
                    };
                    reader.readAsDataURL(blob);
                });
            } else {
                const base64 = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                return base64;
            }
        } catch (error) {
            console.error('Error converting image to base64:', error);
            return null;
        }
    }
}
