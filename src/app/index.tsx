import { useAuth } from '@/hooks/useAuth';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuth((state) => state.login);

  const handleLogin = async () => {
    const success = await login(email, password);
    if (success) {
      router.replace('/home');
    } else {
      // Verifica se o erro foi de conexão ou de credencial
      // (login retorna false para ambos, mas podemos customizar a mensagem)
      // Exibe mensagem genérica de erro de acesso
      Alert.alert('Erro', 'Não foi possível acessar o servidor ou as credenciais estão incorretas. Verifique sua conexão e tente novamente.');
    }
  };

  return (
    <>
      <Image
        source={require('@assets/images/blue-gradient.jpg')}
        style={{ width: '100%', height: '100%', position: 'absolute', }}
        contentFit="cover"
      />
      <>
        <ScrollView className="flex-1" contentContainerClassName="grow justify-center items-center py-5">
          <Image
            source={require('@assets/images/logo-outline.png')}
            style={{ width: 200, height: 200 }}
            contentFit="contain"
          />

          <View className="flex-1 w-full bg-white rounded-t-3xl px-8 pt-8 shadow-lg">
            <Text className="text-2xl font-medium mb-5 text-center text-gray-800">
              Bem-vindo
            </Text>

            <View>
              {/* Email Input */}
              <View className='my-2'>
                <Text className="text-sm font-medium text-gray-700">E-mail</Text>
                <TextInput
                  className="w-full border-b border-gray-300 py-2 px-4 text-gray-900"
                  placeholder="Digite seu e-mail"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Password Input */}
              <View className="my-2">
                <Text className="text-sm font-medium text-gray-700">Senha</Text>
                <TextInput
                  className="w-full border-b border-gray-300 py-2 px-4 text-gray-900"
                  placeholder="Digite sua senha"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="my-4">
              <Text className="text-center text-blue-600 font-medium" onPress={() => {
                setEmail('admin');
                setPassword('admin');
              }}>
                Esqueceu a senha?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              className="bg-blue-600 rounded-xl py-4 px-6 mt-4 shadow-sm"
            >
              <Text className="text-white text-center font-semibold text-lg">
                Entrar
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-600">Não possui uma conta?{' '}</Text>
              <TouchableOpacity>
                <Text className="text-blue-600 font-medium">Cadastrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </>
    </>
  );
}
