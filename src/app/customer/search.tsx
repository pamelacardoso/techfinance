import Header from '@/components/header'
import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

interface Cliente {
    id_cliente: number;
    razao_cliente: string;
    nome_fantasia: string;
    cidade: string;
    uf: string;
    id_grupo: string;
    descricao_grupo: string;
}

export default function CustomerSearch() {
    const params = useLocalSearchParams()
    const username = params.usuario || 'User'

    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<Cliente[]>([])

    const searchProducts = useCallback((query: string) => {
        const mockResults: Cliente[] = [
            { id_cliente: 1, razao_cliente: 'Empresa A', nome_fantasia: 'Empresa A', cidade: 'Cidade A', uf: 'UF A', id_grupo: 'EL', descricao_grupo: 'Eletrônicos' },
            { id_cliente: 2, razao_cliente: 'Empresa B', nome_fantasia: 'Empresa B', cidade: 'Cidade B', uf: 'UF B', id_grupo: 'EL', descricao_grupo: 'Eletrônicos' },
            { id_cliente: 3, razao_cliente: 'Empresa C', nome_fantasia: 'Empresa C', cidade: 'Cidade C', uf: 'UF C', id_grupo: 'VS', descricao_grupo: 'Vestuário' },
        ].filter(product =>
            product.razao_cliente.toLowerCase().includes(query.toLowerCase()) ||
            product.id_cliente.toString().includes(query)
        )
        setSearchResults(mockResults)
    }, [])

    const handleSearch = useCallback(() => {
        searchProducts(searchQuery)
    }, [searchQuery, searchProducts])

    const renderProductItem = useCallback(({ item, index }: { item: Cliente, index: number }) => (
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
                keyExtractor={(item) => item.id_cliente.toString()}
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
                    <Text className="text-center text-gray-500 mt-4">
                        Nenhum resultado encontrado. Tente uma nova busca.
                    </Text>
                }
            />
        </View>
    )
}
