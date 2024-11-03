import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import Constants from 'expo-constants';

import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export enum WhoEnum {
    me = 'me',
    bot = 'bot',
}

export interface MessageModel {
    message: string;
    who: WhoEnum;
}

export class GeminiController {
    private model: GenerativeModel;
    private visionModel: GenerativeModel;
    private chat: any;
    public messages: MessageModel[] = [];

    constructor() {
        const genAI = new GoogleGenerativeAI(Constants.expoConfig?.extra?.geminiApiKey || '');
        this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        this.visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        this.startChat();
    }

    startChat() {
        this.chat = this.model.startChat();
    }

    async sendMessage(prompt: string, addToUI: boolean = true): Promise<void> {
        if (addToUI) {
            this.messages.push({ message: prompt, who: WhoEnum.me });
        }

        try {
            const result = await this.chat.sendMessage(prompt);
            const response = await result.response;
            const text = response.text();

            if (text) {
                this.messages.push({
                    message: text,
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
            // Convert image to base64
            const base64Image = await this.getImageBase64(imageUri);

            if (!base64Image) {
                throw new Error('Failed to load image');
            }

            const result = await this.visionModel.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: 'image/jpeg',
                    },
                },
            ]);

            const response = await result.response;
            const text = response.text();

            if (text) {
                this.messages.push({
                    message: text,
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
