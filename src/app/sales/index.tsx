import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';

import Header from '@/components/header';
import { Sales } from '@/models/sales';
import { SalesRepository } from '@/repositories/sales.repository';

const salesRepository = new SalesRepository();

function SalesScreen() {
    const params = useLocalSearchParams();
    const username = params.usuario || 'User';

    const [sales, setSales] = useState<Sales[]>([]);
    const [loading, setLoadingSales] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingSales(true);
                const clientesData = await salesRepository.getSales({});
                setSales(clientesData);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            } finally {
                setLoadingSales(false);
            }
        };

        loadData();
    }, [searchQuery]);


    const filteredSales = sales.filter(
        (sale) =>
            sale.descricaoProduto.toLowerCase().includes(searchQuery.toLowerCase())
            || sale.nomeFantasia.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View className="flex-1 bg-gray-50">
            <Header username={username} />
            <View className="flex-1 px-2">
                <View className="p-4">
                    <Text className="text-2xl font-bold text-gray-800">Gerenciamento de Vendas</Text>
                    <Text className="text-gray-500 mt-1">Escolha uma opção para começar</Text>
                </View>

                {/* Barra de pesquisa */}
                <View className="flex-row items-center bg-white rounded-full shadow-md shadow-blue-500/20 mb-6">
                    <TextInput
                        className="flex-1 py-3 px-4 text-gray-700 rounded-lg border border-gray-300/60"
                        placeholder="Buscar cliente ou produto"
                        value={searchQuery}
                        onChangeText={(text: string) => setSearchQuery(text)}
                    />
                    <TouchableOpacity onPress={() => {}} className="bg-blue-500 rounded-lg p-3 m-1">
                        <MaterialIcons name="search" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={searchQuery ? filteredSales : []}
                    keyExtractor={(item) => item.idVenda.toString()}
                    renderItem={({ item }) => (
                        <View className="bg-white rounded-lg shadow-md p-4 mb-4">
                            <Text className="font-bold text-gray-800">{item.descricaoProduto}</Text>
                            <Text className="text-sm text-gray-600">{item.nomeFantasia}</Text>
                            <Text className="text-sm text-gray-600">{item.razaoCliente}</Text>
                            <Text className="text-sm text-gray-600">{item.cidade}, {item.uf}</Text>
                            <Text className="text-sm text-gray-600">Quantidade: {item.qtde}</Text>
                            <Text className="text-sm text-gray-600">Valor Unitário: R$ {item.valorUnitario}</Text>
                            <Text className="text-sm text-gray-600">Total: R$ {item.total}</Text>
                        </View>
                    )}
                    ListEmptyComponent={loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <Text className="text-center text-gray-500 mt-4">Nenhum cliente encontrado.</Text>
                    )}
                />
            </View>
        </View>
    );
}

export default SalesScreen;
