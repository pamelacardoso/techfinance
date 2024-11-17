import Header from '@/components/header'
import { Customer } from '@/models/customer'
import { CustomerRepository } from '@/repositories/customer.repository'
import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

export default function CustomerSearch() {
  const params = useLocalSearchParams()
  const username = params.usuario || 'User'

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)

  const customerRepository = new CustomerRepository()

  const searchCustomers = useCallback(async (query: string) => {
    setLoading(true)
    try {
      const results = await customerRepository.search({ nome: query, limite: 10 })
      setSearchResults(results)
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = useCallback(() => {
    searchCustomers(searchQuery)
  }, [searchQuery, searchCustomers])

  const renderCustomerItem = useCallback(({ item, index }: { item: Customer; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      className="bg-white rounded-2xl shadow-lg shadow-blue-500/10 p-4 mb-3"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">{item.razao_cliente}</Text>
          <View className="flex-row items-center mt-2">
            <MaterialIcons name="person" size={16} className="text-gray-400" />
            <Text className="text-sm text-gray-600 ml-1">Código: {item.id_cliente}</Text>
          </View>
          <View className="flex-row items-center mt-1">
            <MaterialIcons name="group" size={16} className="text-gray-400" />
            <Text className="text-sm text-gray-600 ml-1">Grupo: {item.descricao_grupo}</Text>
          </View>
        </View>
        <TouchableOpacity
          className="bg-blue-50 p-2 rounded-full"
          onPress={() => {/* Implement customer details navigation */}}
        >
          <MaterialIcons name="chevron-right" size={20} className="text-blue-500" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  ), [])

  return (
    <View className="flex-1 bg-gray-50">
      <Header username={username} />
      <Animated.View
        entering={FadeIn}
        className="flex-1"
      >
        <FlatList
          data={searchResults}
          renderItem={renderCustomerItem}
          keyExtractor={(item) => item.id_cliente?.toString() || ''}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 20
          }}
          ListHeaderComponent={
            <View className="space-y-4 mb-6">
              <View>
                <Text className="text-2xl font-bold text-gray-800">Buscar Clientes</Text>
                <Text className="text-gray-500 mt-1">
                  Digite o nome ou código do cliente para começar
                </Text>
              </View>

              <View className="flex-row items-center bg-white rounded-2xl shadow-sm border border-gray-100">
                <View className="flex-1 flex-row items-center">
                  <MaterialIcons name="search" size={20} className="text-gray-400 ml-4" />
                  <TextInput
                    className="flex-1 py-3 px-3 text-gray-700"
                    placeholder="Digite o nome ou código do cliente"
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                    accessibilityLabel="Campo de busca de clientes"
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
                <TouchableOpacity
                  onPress={handleSearch}
                  className="bg-blue-500 rounded-xl p-3 m-1 active:bg-blue-600"
                  accessibilityLabel="Botão de busca"
                >
                  <MaterialIcons name="search" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-12">
              {loading ? (
                <>
                  <ActivityIndicator size="large" className="text-blue-500" />
                  <Text className="text-gray-500 mt-4">Buscando clientes...</Text>
                </>
              ) : searchQuery.length > 0 ? (
                <>
                  <MaterialIcons name="person-search" size={48} className="text-gray-300 mb-4" />
                  <Text className="text-gray-500 text-center">
                    Nenhum cliente encontrado para "{searchQuery}"
                  </Text>
                  <Text className="text-gray-400 text-center mt-1">
                    Tente uma nova busca com termos diferentes
                  </Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="people" size={48} className="text-gray-300 mb-4" />
                  <Text className="text-gray-500 text-center">
                    Digite algo para começar a busca
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
