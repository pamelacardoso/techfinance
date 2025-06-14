import { OpenAIService } from '@/services/openai.service';
import { MessageModel, WhoEnum } from '@/types/message';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
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
    <View className="flex-1 bg-gray-900 web:min-h-screen">
      {/* Main Container with responsive max-width */}
      <View className="flex-1 web:max-w-6xl web:mx-auto web:w-full">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Back Button */}
          <View className="absolute left-4 top-6 z-10">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 rounded-full bg-gray-800/50"
              accessibilityLabel="Voltar"
            >
              <MaterialIcons name="arrow-back" size={32} color="white" />
            </TouchableOpacity>
          </View>

          {/* Header Section */}
          <View className="bg-gray-900 border-b border-gray-700 web:border-b-2">
            <View className="px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8 flex-row items-center justify-center">
              <Image
                source={require('@assets/images/logo.png')}
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32"
                resizeMode="contain"
              />
              <View className="ml-4 web:ml-6">
                <Text className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                  Dinho Bot
                </Text>
                <Text className="text-gray-400 text-sm sm:text-base md:text-lg">
                  Seu assistente financeiro
                </Text>
              </View>
            </View>
          </View>

          {/* Chat Messages Area */}
          <View className="flex-1 web:flex-1">
            <ScrollView
              ref={scrollViewRef}
              className="flex-1"
              contentContainerStyle={{
                paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
                paddingVertical: Platform.OS === 'web' ? 32 : 16,
                minHeight: Platform.OS === 'web' ? '100%' : undefined
              }}
              onContentSizeChange={scrollToBottom}
              showsVerticalScrollIndicator={Platform.OS !== 'web'}
            >
              <View className="web:max-w-4xl web:mx-auto web:w-full">
                {messages.map((message, index) => (
                  <MessageBubble key={index} message={message} />
                ))}
                {isLoading && <LoadingIndicator />}
              </View>
            </ScrollView>
          </View>

          {/* Input Area */}
          <View className="border-t border-gray-700 web:border-t-2">
            <View className="web:max-w-4xl web:mx-auto web:w-full">
              <InputArea
                inputText={inputText}
                setInputText={setInputText}
                onSendMessage={onSendMessage}
                onSendImageMessage={onSendImageMessage}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const MessageBubble = ({ message }: { message: MessageModel }) => (
  <View
    className={`flex-row ${
      message.who === WhoEnum.me ? 'justify-end' : 'justify-start'
    } mb-4 sm:mb-6 md:mb-8`}
  >
    <View
      className={`
        max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] xl:max-w-[65%]
        p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl
        ${message.who === WhoEnum.bot
          ? 'bg-blue-600 web:bg-blue-500 web:hover:bg-blue-600 transition-colors'
          : 'bg-green-600 web:bg-green-500 web:hover:bg-green-600 transition-colors'
        }
      `}
    >
      <Markdown
        markdownit={MarkdownIt({ typographer: true })}
        style={{
          body: {
            color: 'white',
            fontSize: Platform.OS === 'web' ? 16 : 14,
            lineHeight: Platform.OS === 'web' ? 24 : 20,
            fontFamily: Platform.OS === 'web' ? 'system-ui, -apple-system, sans-serif' : undefined
          },
          link: {
            color: '#E0E0E0',
            textDecorationLine: 'underline',
            fontSize: Platform.OS === 'web' ? 16 : 14
          },
          blockquote: {
            borderLeftColor: '#A0AEC0',
            backgroundColor: 'rgba(0,0,0,0.1)',
            paddingLeft: 12,
            marginLeft: 8
          },
          code_inline: {
            backgroundColor: 'rgba(0,0,0,0.2)',
            color: '#E0E0E0',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
            fontSize: Platform.OS === 'web' ? 14 : 12
          },
        }}
      >
        {message.message}
      </Markdown>
    </View>
  </View>
);

const LoadingIndicator = () => (
  <View className="items-center py-6 sm:py-8">
    <View className="bg-gray-800 rounded-full px-6 py-3 sm:px-8 sm:py-4">
      <Text className="text-white text-sm sm:text-base md:text-lg font-medium">
        Pensando...
      </Text>
    </View>
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
  <View className="p-4 sm:p-6 md:p-8 bg-gray-800">
    <View className="flex-row items-end space-x-3 sm:space-x-4">
      <View className="flex-1">
        <TextInput
          className="bg-gray-700 web:bg-gray-600 rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 sm:py-4 md:py-5 text-white text-base sm:text-lg web:text-lg web:leading-6 web:min-h-[56px] web:max-h-[120px]"
          value={inputText}
          onChangeText={setInputText}
          placeholder="Digite uma mensagem..."
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={500}
          style={{
            maxHeight: Platform.OS === 'web' ? 120 : 100,
            textAlignVertical: 'top'
          }}
        />
      </View>

      <View className="flex-row space-x-2 sm:space-x-3">
        <TouchableOpacity
          onPress={onSendImageMessage}
          className="p-3 sm:p-4 rounded-full bg-gray-700 web:bg-gray-600 web:hover:bg-gray-500 active:bg-gray-600 web:transition-colors"
          accessibilityLabel="Enviar imagem"
        >
          <MaterialIcons
            name="image"
            size={Platform.OS === 'web' ? 24 : 20}
            color="#60A5FA"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSendMessage}
          className={`p-3 sm:p-4 rounded-full web:transition-colors ${
            inputText.trim()
              ? 'bg-blue-600 web:bg-blue-500 web:hover:bg-blue-600 active:bg-blue-700'
              : 'bg-gray-600 web:bg-gray-500'
          }`}
          disabled={!inputText.trim()}
          accessibilityLabel="Enviar mensagem"
        >
          <MaterialIcons
            name="send"
            size={Platform.OS === 'web' ? 24 : 20}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);
