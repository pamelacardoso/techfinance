import { OpenAIService } from '@/services/openai.service';
import { MessageModel, WhoEnum } from '@/types/message';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';

export default function OpenAIScreen() {
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const aiServiceRef = useRef<OpenAIService | null>(null);

  useEffect(() => {
    aiServiceRef.current = new OpenAIService();
    sendInitialMessage();
  }, []);

  const sendInitialMessage = async () => {
    if (aiServiceRef.current) {
      setIsLoading(true);
      await aiServiceRef.current.sendMessage(
        "Olá! Eu sou o Dinho Bot, seu assistente virtual. Como posso ajudar você hoje?",
        false
      );
      setMessages([...aiServiceRef.current.messages]);
      setIsLoading(false);
    }
  };

  const onSendMessage = async () => {
    if (inputText.trim() && aiServiceRef.current) {
      setIsLoading(true);
      await aiServiceRef.current.sendMessage(inputText.trim());
      setMessages([...aiServiceRef.current.messages]);
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

      if (!result.canceled && result.assets[0] && aiServiceRef.current) {
        setIsLoading(true);
        await aiServiceRef.current.sendImageMessage(
          inputText.trim() || 'Analise da imagem',
          result.assets[0].uri
        );
        setMessages([...aiServiceRef.current.messages]);
        setInputText('');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-900"
    >
      <View className="flex-1">
        <View className="h-[83%]">
          <View className="bg-gray-900 px-6 flex-row items-center justify-center">
            <Image
              source={require('@assets/images/logo.png')}
              className="w-32 h-32"
              resizeMode="contain"
            />
          </View>

          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-4"
            contentContainerStyle={{ paddingVertical: 16 }}
            onContentSizeChange={scrollToBottom}
          >
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
            {isLoading && <LoadingIndicator />}
          </ScrollView>
        </View>

        <InputArea
          inputText={inputText}
          setInputText={setInputText}
          onSendMessage={onSendMessage}
          onSendImageMessage={onSendImageMessage}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const MessageBubble = ({ message }: { message: MessageModel }) => (
  <View
    className={`flex-row ${message.who === WhoEnum.me ? 'justify-end' : 'justify-start'} mb-4`}
  >
    <View
      className={`
        max-w-[80%] p-3 rounded-2xl
        ${message.who === WhoEnum.bot ? 'bg-blue-600' : 'bg-green-600'}
      `}
    >
      <Markdown
        markdownit={MarkdownIt({ typographer: true })}
        style={{
          body: { color: 'white', fontSize: 16 },
          link: { color: '#E0E0E0', textDecorationLine: 'underline' },
          blockquote: { borderLeftColor: '#A0AEC0', backgroundColor: 'rgba(0,0,0,0.1)' },
          code_inline: { backgroundColor: 'rgba(0,0,0,0.1)', color: '#E0E0E0' },
        }}
      >
        {message.message}
      </Markdown>
    </View>
  </View>
);

const LoadingIndicator = () => (
  <View className="items-center py-3">
    <Text className="text-white text-base">Pensando...</Text>
  </View>
);

interface InputAreaProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  onSendImageMessage: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({
  inputText,
  setInputText,
  onSendMessage,
  onSendImageMessage,
}) => (
  <View className="p-4 bg-gray-800 flex-row items-center">
    <TextInput
      className="flex-1 bg-gray-700 rounded-full px-4 py-2 text-white text-base mr-3"
      value={inputText}
      onChangeText={setInputText}
      placeholder="Digite uma mensagem..."
      placeholderTextColor="#9CA3AF"
    />
    <TouchableOpacity onPress={onSendImageMessage} className="mr-3">
      <MaterialIcons name="image" size={24} color="#60A5FA" />
    </TouchableOpacity>
    <TouchableOpacity
      onPress={onSendMessage}
      className="bg-blue-600 rounded-full p-2"
      disabled={!inputText.trim()}
    >
      <MaterialIcons name="send" size={24} color="white" />
    </TouchableOpacity>
  </View>
);
