import { GeminiController, MessageModel, WhoEnum } from '@/controllers/gemini.controller';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function GeminiScreen() {
    const [messages, setMessages] = useState<MessageModel[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const controllerRef = useRef<GeminiController | null>(null);

    useEffect(() => {
        controllerRef.current = new GeminiController();

        // Send initial message
        const sendInitialMessage = async () => {
            if (controllerRef.current) {
                await controllerRef.current.sendMessage(
                    "Olá! Eu sou o Dinho Bot, seu assistente virtual. Como posso ajudar você hoje?",
                    false
                );

                setMessages([...controllerRef.current.messages]);
            }
        };

        sendInitialMessage();
    }, []);

    const onSendMessage = async () => {
        if (inputText.trim() && controllerRef.current) {
            setIsLoading(true);
            await controllerRef.current.sendMessage(inputText.trim());
            setMessages([...controllerRef.current.messages]);
            setInputText('');
            setIsLoading(false);
        }
    };

    const onSendImageMessage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                base64: true,
                quality: 1,
            });

            if (!result.canceled && result.assets[0] && controllerRef.current) {
                setIsLoading(true);
                await controllerRef.current.sendImageMessage(
                    inputText.trim() || 'Analise da imagem',
                    result.assets[0].uri
                );
                setMessages([...controllerRef.current.messages]);
                setInputText('');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    return (
        <View className="flex-1 bg-black">
            <Image
                source={require('@assets/images/logo.png')}
                className="w-52 h-20 self-center"
                resizeMode="contain"
            />

            <ScrollView
                ref={scrollViewRef}
                className="flex-1"
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map((message, index) => (
                    <View
                        key={index}
                        className={`flex-row ${message.who === WhoEnum.me ? 'justify-end' : 'justify-start'}`}
                    >
                        <View
                            className={`
                  w-3/4 m-4 p-2 rounded-lg
                  ${message.who === WhoEnum.bot ? 'bg-gray-600' : 'bg-green-900'}
                `}
                        >
                            <Text className="text-white text-base">
                                {message.message}
                            </Text>
                        </View>
                    </View>
                ))}
                {isLoading && (
                    <View className="items-center py-3">
                        <View className="h-8 w-8 items-center justify-center">
                            {/* You might want to use a custom loading animation here */}
                            <MaterialIcons name="sync" size={24} color="white" className="animate-spin" />
                        </View>
                    </View>
                )}
            </ScrollView>

            <View className="p-2 flex-row items-center">
                <TextInput
                    className="flex-1 border border-gray-500 rounded-lg px-4 py-2 text-white text-base mr-2"
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Digite uma mensagem ..."
                    placeholderTextColor="gray"
                />
                <TouchableOpacity
                    onPress={onSendMessage}
                    className="p-2"
                >
                    <MaterialIcons name="send" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onSendImageMessage}
                    className="p-2"
                >
                    <MaterialIcons name="image" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
}
