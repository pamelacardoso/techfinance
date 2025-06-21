import { useAuth } from '@/hooks/useAuth';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import '@/styles/global.css';

export default function Layout() {
  const segments = useSegments();
  const router = useRouter();
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redireciona para a tela de login se não estiver autenticado
      router.replace('/');
    } else if (isAuthenticated && inAuthGroup) {
      // Redireciona para a home se estiver autenticado e tentar acessar a tela de login
      router.replace('/home');
    }
  }, [isAuthenticated, segments]);

  return (
    <>
      <StatusBar style='light' backgroundColor='#2563eb' />
      <SafeAreaView className='flex-1'>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="chat/index" options={{
            headerShown: false, title: 'Dinho Bot',
            headerStyle: { backgroundColor: '#000' }, headerTintColor: 'white'
          }} />
          <Stack.Screen name="product/index" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="product/productdetails" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="customer/index" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="sales/index" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="reports/index" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="reports/sales" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="reports/sales-by-qtd" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="reports/sales-min-max" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="reports/products" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="reports/customers" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="reports/customers-by-value" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="reports/assignments" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="reports/sales-forecast" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="mcp/index" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="title/index" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaView>
    </>
  );
}
