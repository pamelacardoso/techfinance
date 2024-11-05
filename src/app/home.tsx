// app/index.tsx
import Header from '@/components/header';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

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
  const params = useLocalSearchParams();
  const username = params.usuario || 'User';

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
      <Header username={username} />

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
