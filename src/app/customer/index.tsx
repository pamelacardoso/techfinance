import { useEffect, useCallback, useState } from 'react'
import Header from '@/components/header'
import { Customer } from '@/models/customer'
import { CustomerRepository } from '@/repositories/customer.repository'
import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

export default function CustomerSearch() {
  const params = useLocalSearchParams()
  const username = params.usuario || 'User'

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null) // Estado do cliente selecionado
  const [isModalVisible, setModalVisible] = useState(false) // Controle do modal

  const customerRepository = new CustomerRepository()

  // Função para buscar clientes
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

  // Chamada inicial para buscar clientes automaticamente
  useEffect(() => {
    searchCustomers('')
  }, [searchCustomers])

  const handleSearch = useCallback(() => {
    searchCustomers(searchQuery)
  }, [searchQuery, searchCustomers])

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setModalVisible(true)
  }

  const closeModal = () => {
    setSelectedCustomer(null)
    setModalVisible(false)
  }

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
          onPress={() => handleCustomerClick(item)}
        >
          <MaterialIcons name="chevron-right" size={20} className="text-blue-500" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  ), [])

  return (
    <View className="flex-1 bg-gray-50">
      <Animated.View entering={FadeIn} className="flex-1">
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
              <Text className="text-2xl font-bold text-gray-800">Buscar Clientes</Text>
              <Text className="text-gray-500 mt-1">
                Digite o nome ou código do cliente para começar
              </Text>

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

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-4/5">
            {selectedCustomer && (
              <>
                <Text className="text-lg font-bold">{selectedCustomer.razao_cliente}</Text>
                <Text className="text-gray-600">Código: {selectedCustomer.id_cliente}</Text>
                <Text className="text-gray-600">Grupo: {selectedCustomer.descricao_grupo}</Text>
              </>
            )}
            <TouchableOpacity
              className="bg-blue-500 rounded-lg mt-4 p-3"
              onPress={closeModal}
            >
              <Text className="text-white text-center">Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}
