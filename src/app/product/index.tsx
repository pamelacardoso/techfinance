import Header from '@/components/header';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

interface GridItemProps {
    title: string;
    icon: any;
    onPress: () => void;
}

function ProdutoScreen() {
    const router = useRouter();

    const params = useLocalSearchParams();
    const username = params.usuario || 'User';

    const renderGridItem = ({ title, icon, onPress }: GridItemProps) => (
        <TouchableOpacity onPress={onPress} className="flex-1 m-2">
            <View className="bg-blue-500 rounded-lg p-6 items-center justify-center">
                <MaterialIcons name={icon} size={40} color="white" />
                <Text className="text-white text-lg font-bold mt-2">{title}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1">
            <Header username={username} />
            <View className="flex-1 p-4">
                <FlatList
                    data={[
                        { title: 'Consultar Produto', icon: 'search', onPress: () => router.push('/product/search') },
                        { title: 'Adicionar Produto', icon: 'add', onPress: () => {} },
                    ]}
                    renderItem={({ item }) => renderGridItem(item)}
                    keyExtractor={(item) => item.title}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    contentContainerStyle={{ paddingBottom: 16 }}
                />
            </View>
        </View>
    );
};

export default ProdutoScreen;
