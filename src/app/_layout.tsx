import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import '@/styles/global.css';

export default function Layout() {
  return (
    <>
      <StatusBar style='light' backgroundColor='#2563eb' />
      <SafeAreaView className='flex-1'>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="chat/index" options={{
            headerShown: true, title: 'Dinho Bot',
            headerStyle: { backgroundColor: '#000' }, headerTintColor: 'white'
          }} />
          <Stack.Screen name="product/index" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="product/search" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="customer/index" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="customer/search" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="sales/index" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="reports/index" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="reports/sales" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="reports/sales-by-qtd" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="reports/sales-min-max" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="reports/products" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="reports/customers" options={{ headerShown: false }} initialParams={{ usuario: 'Admin' }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaView>
    </>
  );
}
