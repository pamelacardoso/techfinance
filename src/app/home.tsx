// app/index.tsx
import Header from '@/components/header';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface MenuItem {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route?: string;
}

interface GridItemProps {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
}

export default function HomeScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const params = useLocalSearchParams();
  const username = params.usuario || 'User';

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Não foi possível acessar a galeria de imagens, tente novamente mais tarde.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const menuItems: MenuItem[] = [
    { title: 'Produtos', icon: 'shopping-bag', route: '/product' },
    { title: 'Vendas', icon: 'attach-money' },
    { title: 'Clientes', icon: 'people' },
    { title: 'Títulos', icon: 'assignment' },
    { title: 'Relatórios', icon: 'bar-chart' },
    { title: 'Configurações', icon: 'settings' },
    { title: 'Dinho Bot', icon: 'chat', route: '/chat' },
  ];

  const GridItem: React.FC<GridItemProps> = ({ title, icon, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      className="bg-blue-500 rounded-2xl flex-1 aspect-square justify-center items-center m-2"
    >
      <MaterialIcons name={icon} size={40} color="white" />
      <Text className="text-white text-lg font-bold mt-2">{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <Header username={username} imageUri={imageUri} setImageUri={setImageUri} pickImage={pickImage} />

      <ScrollView className="flex-1 p-4">
        <View className="flex-1 flex-row flex-wrap">
          {menuItems.map((item, index) => (
            <View key={index} className="w-1/2">
              <GridItem
                title={item.title}
                icon={item.icon}
                onPress={item.route ? () => router.push(item.route!) : undefined}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
