import Header from "@/components/header";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

function Search() {
    const params = useLocalSearchParams();
    const username = params.usuario || 'User';

    return (
        <View className="flex-1 bg-white">
            <Header username={username} />
            <ScrollView className='flex-1 p-4'>
                <Text className='text-2xl font-bold'>Buscar Produtos</Text>
            </ScrollView>
        </View>
    )
}

export default Search;
