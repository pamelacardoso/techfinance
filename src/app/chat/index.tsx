import { GeminiService, MessageModel, WhoEnum } from '@/services/gemini.service';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';

export default function GeminiScreen() {
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const geminiServiceRef = useRef<GeminiService | null>(null);

  useEffect(() => {
    geminiServiceRef.current = new GeminiService();
    sendInitialMessage();
  }, []);

  const sendInitialMessage = async () => {
    if (geminiServiceRef.current) {
      await geminiServiceRef.current.sendMessage(
        "Olá! Eu sou o Dinho Bot, seu assistente virtual. Como posso ajudar você hoje?",
        false
      );
      setMessages([...geminiServiceRef.current.messages]);
    }
  };

  const onSendMessage = async () => {
    if (inputText.trim() && geminiServiceRef.current) {
      setIsLoading(true);
      await geminiServiceRef.current.sendMessage(inputText.trim());
      setMessages([...geminiServiceRef.current.messages]);
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

      if (!result.canceled && result.assets[0] && geminiServiceRef.current) {
        setIsLoading(true);
        await geminiServiceRef.current.sendImageMessage(
          inputText.trim() || 'Analise da imagem',
          result.assets[0].uri
        );
        setMessages([...geminiServiceRef.current.messages]);
        setInputText('');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
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
        className=""
        onContentSizeChange={scrollToBottom}
      >
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        {isLoading && <LoadingIndicator />}
      </ScrollView>

      <InputArea
        inputText={inputText}
        setInputText={setInputText}
        onSendMessage={onSendMessage}
        onSendImageMessage={onSendImageMessage}
      />
    </View>
  );
}

const MessageBubble = ({ message }: { message: MessageModel }) => (
  <View
    className={`flex-row ${message.who === WhoEnum.me ? 'justify-end' : 'justify-start'}`}
  >
    <View
      className={`
        w-3/4 m-4 p-2 rounded-lg
        ${message.who === WhoEnum.bot ? 'bg-gray-600' : 'bg-green-900'}
      `}
    >
      <Markdown
        markdownit={MarkdownIt({ typographer: true })}
        style={{ body: { color: 'white', fontSize: 16 } }}
      >
        {message.message}
      </Markdown>
    </View>
  </View>
);

const LoadingIndicator = () => (
  <View className="items-center py-3">
    <View className="h-8 w-8 items-center justify-center">
      <MaterialIcons name="sync" size={24} color="white" className="animate-spin" />
    </View>
  </View>
);

interface InputAreaProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  onSendImageMessage: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({ inputText, setInputText, onSendMessage, onSendImageMessage }) => (
  <View className="p-2 flex flex-row items-center">
    <TextInput
      className="flex-1 border border-gray-500 rounded-lg px-4 py-2 text-white text-base mr-2"
      value={inputText}
      onChangeText={setInputText}
      placeholder="Digite uma mensagem ..."
      placeholderTextColor="gray"
    />
    <TouchableOpacity onPress={onSendMessage} className="p-2">
      <MaterialIcons name="send" size={24} color="white" />
    </TouchableOpacity>
    <TouchableOpacity onPress={onSendImageMessage} className="p-2">
      <MaterialIcons name="image" size={24} color="white" />
    </TouchableOpacity>
  </View>
);

