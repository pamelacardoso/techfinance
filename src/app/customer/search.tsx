import Header from '@/components/header'
import { Customer } from '@/models/customer'
import { CustomerRepository } from '@/repositories/customer.repository'
import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'


export default function CustomerSearch() {
    const params = useLocalSearchParams()
    const username = params.usuario || 'User'

    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<Customer[]>([])
    const [loading, setLoading] = useState(false);

    const customerRepository = new CustomerRepository();

    const searchProducts = useCallback(async (query: string) => {
        setLoading(true);
        try {
            const results = await customerRepository.search({ nome: query, limite: 10 });
            setSearchResults(results);
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
        } finally {
            setLoading(false);
        }
    }, [])

    const handleSearch = useCallback(() => {
        searchProducts(searchQuery)
    }, [searchQuery, searchProducts])

    const renderProductItem = useCallback(({ item, index }: { item: Customer, index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100)}
            className="bg-white rounded-lg shadow-md shadow-blue-500/10 mb-4 p-4"
        >
            <Text className="text-lg font-bold text-gray-800">{item.razao_cliente}</Text>
            <Text className="text-sm text-gray-600">Código: {item.id_cliente}</Text>
            <Text className="text-sm text-gray-600">Grupo: {item.descricao_grupo}</Text>
        </Animated.View>
    ), [])

    return (
        <View className="flex-1 bg-gray-50">
            <Header username={username} />
            <FlatList
                data={searchResults}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.id_cliente?.toString() || ''}
                contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16, paddingTop: 16 }}
                ListHeaderComponent={
                    <>
                        <Text className="text-2xl font-bold text-gray-800 mb-4">Buscar Clientes</Text>

                        <View className="flex-row items-center bg-white rounded-full shadow-md shadow-blue-500/20 mb-6">
                            <TextInput
                                className="flex-1 py-3 px-4 text-gray-700 rounded-lg border border-gray-300/60"
                                placeholder="Digite o nome ou código do cliente"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                onSubmitEditing={handleSearch}
                                accessibilityLabel="Campo de busca de clientes"
                            />
                            <TouchableOpacity
                                onPress={handleSearch}
                                className="bg-blue-500 rounded-lg p-3 m-1"
                                accessibilityLabel="Botão de busca"
                            >
                                <MaterialIcons name="search" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </>
                }
                ListEmptyComponent={
                    loading ? (
                        <>
                            <View className="flex-1 items-center justify-center">
                                <ActivityIndicator size="large" color="#0000ff" />
                            </View>
                            <Text className="text-center text-gray-500 mt-4">
                                Carregando...
                            </Text>
                        </>
                    ) : (
                        <Text className="text-center text-gray-500 mt-4">
                            Nenhum resultado encontrado. Tente uma nova busca.
                        </Text>
                    )
                }
            />
        </View>
    )
}
