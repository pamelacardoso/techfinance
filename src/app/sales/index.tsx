import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { CustomerRepository } from '@/repositories/customer.repository'; 
import { ProductRepository } from '@/repositories/product.repository';
import { Customer } from '@/models/customer';  // Interface de Customer
import { Product } from '@/models/product';    // Interface de Product
import Header from '@/components/header';      // Aparentemente o Header é um componente utilizado na página

const customerRepository = new CustomerRepository();
const productRepository = new ProductRepository();

function SalesScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const username = params.usuario || 'User';

    const [clientes, setClientes] = useState<Customer[]>([]);   // Usando a interface Customer
    const [produtos, setProdutos] = useState<Product[]>([]);     // Usando a interface Product
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingClientes, setLoadingClientes] = useState(true);
    const [loadingProdutos, setLoadingProdutos] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingClientes(true);
                setLoadingProdutos(true);

                const clientesData = await customerRepository.search({ nome: searchQuery });

                setClientes(clientesData);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            } finally {
                setLoadingClientes(false);
                setLoadingProdutos(false);
            }
        };

        loadData();
    }, [searchQuery]);

    const renderGridItem = ({ title, icon, onPress }: { title: string; icon: string; onPress: () => void }) => (
        <TouchableOpacity onPress={onPress} className="flex-1 m-2">
            <View className="bg-blue-500 rounded-lg p-6 items-center justify-center">
                <Text className="text-white text-lg font-bold mt-2">{title}</Text>
            </View>
        </TouchableOpacity>
    );

    const filteredClientes = clientes.filter(
        (cliente) =>
            cliente.nome_fantasia.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cliente.id_cliente.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredProdutos = produtos.filter(
        (produto) =>
            produto.nome_porduto.toLowerCase().includes(searchQuery.toLowerCase()) || // Nome correto da propriedade
            produto.id_produto.toLowerCase().includes(searchQuery.toLowerCase())
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

                {/* Exibindo as opções para consultar cliente e produto */}
                <FlatList
                    data={[
                        { title: 'Consultar Cliente', icon: 'search', onPress: () => router.push('/vendas/consultar_cliente') },
                        { title: 'Consultar Produto', icon: 'search', onPress: () => router.push('/vendas/consultar_produto') }
                    ]}
                    renderItem={({ item }) => renderGridItem(item)}
                    keyExtractor={(item) => item.title}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    contentContainerStyle={{ paddingBottom: 16 }}
                />

                {/* Exibindo os resultados filtrados de clientes */}
                <FlatList
                    data={searchQuery ? filteredClientes : []}
                    keyExtractor={(item) => item.id_cliente.toString()}
                    renderItem={({ item }) => (
                        <View className="bg-white rounded-lg shadow-md p-4 mb-4">
                            <Text className="font-bold text-gray-800">{item.nome_fantasia}</Text>
                            <Text className="text-sm text-gray-600">ID: {item.id_cliente}</Text>
                        </View>
                    )}
                    ListEmptyComponent={loadingClientes ? (
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
