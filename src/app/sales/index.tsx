import Header from '@/components/header'
import { Sales } from '@/models/sales'
import { SalesRepository } from '@/repositories/sales.repository'
import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

const salesRepository = new SalesRepository()

export default function SalesScreen() {
  const params = useLocalSearchParams()
  const username = params.usuario || 'User'

  const [sales, setSales] = useState<Sales[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const loadSales = useCallback(async () => {
    try {
      setLoading(true)
      const salesData = await salesRepository.getSales({})
      setSales(salesData)
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSales()
  }, [loadSales])

  const filteredSales = sales.filter(
    (sale) =>
      sale.descricaoProduto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.nomeFantasia?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderSaleItem = useCallback(({ item, index }: { item: Sales; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      className="bg-white rounded-2xl shadow-lg shadow-blue-500/10 p-4 mb-3"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">{item.descricaoProduto}</Text>
          <Text className="text-sm text-gray-600">{item.nomeFantasia}</Text>
        </View>
        <View className="bg-blue-50 px-3 py-1 rounded-full">
          <Text className="text-blue-600 font-medium">R$ {item.total}</Text>
        </View>
      </View>
      <View className="space-y-1">
        {/* ID da Venda */}
        <View className="flex-row items-center">
          <MaterialIcons name="tag" size={16} className="text-gray-400 mr-2" />
          <Text className="text-sm text-gray-600">ID Venda: {item.idVenda}</Text>
        </View>

        <View className="flex-row items-center">
          <MaterialIcons name="business" size={16} className="text-gray-400 mr-2" />
          <Text className="text-sm text-gray-600">{item.razaoCliente}</Text>
        </View>
        <View className="flex-row items-center">
          <MaterialIcons name="location-on" size={16} className="text-gray-400 mr-2" />
          <Text className="text-sm text-gray-600">{item.cidade}, {item.uf}</Text>
        </View>
        <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-100">
          <View className="flex-row items-center">
            <MaterialIcons name="shopping-cart" size={16} className="text-gray-400 mr-2" />
            <Text className="text-sm text-gray-600">Qtde: {item.qtde}</Text>
          </View>
          <Text className="text-sm text-gray-600">Valor Unit.: R$ {item.valorUnitario}</Text>
        </View>
      </View>
    </Animated.View>
  ), []);

  return (
    <View className="flex-1 bg-gray-50">
      <Header username={username?.toString()} />
      <Animated.View
        entering={FadeIn}
        className="flex-1 px-4"
      >
        <View className="py-4">
          <Text className="text-2xl font-bold text-gray-800">Gerenciamento de Vendas</Text>
          <Text className="text-gray-500 mt-1">Visualize e busque vendas realizadas</Text>
        </View>

        <View className="flex-row items-center bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <View className="flex-1 flex-row items-center">
            <MaterialIcons name="search" size={20} className="text-gray-400 ml-4" />
            <TextInput
              className="flex-1 py-3 px-3 text-gray-700"
              placeholder="Buscar cliente ou produto"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Campo de busca de vendas"
            />
          </View>
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              className="p-2 mr-1"
              accessibilityLabel="Limpar busca"
            >
              <MaterialIcons name="close" size={20} className="text-gray-400" />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={searchQuery ? filteredSales : sales}
          keyExtractor={(item) => item.idVenda.toString()}
          renderItem={renderSaleItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-12">
              {loading ? (
                <>
                  <ActivityIndicator size="large" className="text-blue-500" />
                  <Text className="text-gray-500 mt-4">Carregando vendas...</Text>
                </>
              ) : searchQuery ? (
                <>
                  <MaterialIcons name="search-off" size={48} className="text-gray-300 mb-4" />
                  <Text className="text-gray-500 text-center">
                    Nenhuma venda encontrada para "{searchQuery}"
                  </Text>
                  <Text className="text-gray-400 text-center mt-1">
                    Tente uma nova busca com termos diferentes
                  </Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="receipt" size={48} className="text-gray-300 mb-4" />
                  <Text className="text-gray-500 text-center">
                    Nenhuma venda registrada
                  </Text>
                </>
              )}
            </View>
          }
        />
      </Animated.View>
    </View>
  )
}
