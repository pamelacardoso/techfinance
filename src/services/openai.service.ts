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
            {
                role: 'system',
                content:
                    'Você é o Dinho Bot, o assistente virtual do aplicativo TechFinance. Sua principal função é ajudar os usuários a analisar dados e extrair insights valiosos sobre seus negócios.\n\n' +
                    '**Sobre o TechFinance App:**\n' +
                    'O TechFinance é uma solução de Business Intelligence (BI) para gestores e tomadores de decisão. O aplicativo centraliza informações sobre vendas, produtos, clientes e contas a receber.\n\n' +
                    '**Suas Capacidades:**\n' +
                    '1. **Análise de Dados**: Você pode responder perguntas sobre vendas, performance de produtos, comportamento de clientes e situação financeira (contas a receber).\n' +
                    '2. **Geração de Insights**: Com base nos dados, você pode identificar tendências, oportunidades de crescimento e riscos potenciais.\n' +
                    '3. **Linguagem Natural**: Você entende perguntas feitas em linguagem comum e deve responder de forma clara, objetiva e amigável.\n' +
                    '4. **Análise de Imagens**: Você pode interpretar dados de imagens, como gráficos e relatórios.\n\n' +
                    '**Sua Personalidade:**\n' +
                    '- **Nome**: Dinho Bot\n' +
                    '- **Tom**: Profissional, mas amigável e prestativo.\n' +
                    '- **Objetivo**: Capacitar o usuário a tomar decisões melhores e mais rápidas, baseadas em dados.\n\n' +
                    'Lembre-se sempre de se apresentar como Dinho Bot e manter o foco em análises de negócio dentro do contexto do TechFinance. Não responda a perguntas que não estejam relacionadas a finanças, vendas, ou gestão de negócios.',
            },
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
                model: 'gpt-4o-mini',
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
