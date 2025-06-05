import Header from '@/components/header'
import { Customer } from '@/models/customer'
import { CustomerRepository } from '@/repositories/customer.repository'
import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

export default function CustomerSearch() {
  const params = useLocalSearchParams()
  const username = Array.isArray(params.usuario) ? params.usuario[0] : params.usuario || 'User'

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
      className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 mb-3 mx-1"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <Text className="text-base sm:text-lg lg:text-xl font-bold text-gray-800" numberOfLines={2}>
            {item.razao_cliente}
          </Text>
          <View className="flex-row items-center mt-2 flex-wrap">
            <View className="flex-row items-center mr-4 mb-1">
              <MaterialIcons name="person" size={14} color="#6B7280" className="sm:text-base" />
              <Text className="text-xs sm:text-sm text-gray-600 ml-1">Código: {item.id_cliente}</Text>
            </View>
            <View className="flex-row items-center mb-1">
              <MaterialIcons name="group" size={14} color="#6B7280" className="sm:text-base" />
              <Text className="text-xs sm:text-sm text-gray-600 ml-1" numberOfLines={1}>
                Grupo: {item.descricao_grupo}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          className="bg-blue-50 p-2 sm:p-3 rounded-full active:bg-blue-100"
          onPress={() => handleCustomerClick(item)}
          accessibilityLabel="Ver detalhes do cliente"
        >
          <MaterialIcons name="chevron-right" size={18} color="#3B82F6" className="sm:text-xl" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  ), [])

  return (
    <View className="flex-1 bg-gray-50">
      <Header username={username} />
      <Animated.View entering={FadeIn} className="flex-1">
        <FlatList
          data={searchResults}
          renderItem={renderCustomerItem}
          keyExtractor={(item) => item.id_cliente?.toString() || ''}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingTop: 16,
            paddingBottom: 20
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="space-y-3 sm:space-y-4 lg:space-y-6 mb-4 sm:mb-6 px-1">
              <Text className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                Buscar Clientes
              </Text>
              <Text className="text-gray-500 text-sm sm:text-base">
                Digite o nome ou código do cliente para começar
              </Text>

              <View className="flex-row items-center bg-white rounded-xl sm:rounded-2xl border border-gray-100">
                <View className="flex-1 flex-row items-center">
                  <MaterialIcons name="search" size={18} color="#9CA3AF" className="ml-3 sm:ml-4 sm:text-xl" />
                  <TextInput
                    className="flex-1 py-3 sm:py-4 px-2 sm:px-3 text-sm sm:text-base text-gray-700"
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
                    className="p-2 sm:p-3 mr-1"
                    accessibilityLabel="Limpar busca"
                  >
                    <MaterialIcons name="close" size={18} color="#9CA3AF" className="sm:text-xl" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleSearch}
                  className="bg-blue-500 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 m-1 active:bg-blue-600"
                  accessibilityLabel="Botão de busca"
                >
                  <MaterialIcons name="search" size={18} color="white" className="sm:text-xl" />
                </TouchableOpacity>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-8 sm:py-12 px-4">
              {loading ? (
                <>
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text className="text-gray-500 mt-4 text-sm sm:text-base">Buscando clientes...</Text>
                </>
              ) : searchQuery.length > 0 ? (
                <>
                  <MaterialIcons name="person-search" size={40} color="#D1D5DB" className="sm:text-5xl mb-4" />
                  <Text className="text-gray-500 text-center text-sm sm:text-base">
                    Nenhum cliente encontrado para "{searchQuery}"
                  </Text>
                  <Text className="text-gray-400 text-center mt-1 text-xs sm:text-sm">
                    Tente uma nova busca com termos diferentes
                  </Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="people" size={40} color="#D1D5DB" className="sm:text-5xl mb-4" />
                  <Text className="text-gray-500 text-center text-sm sm:text-base">
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
        <View className="flex-1 justify-center items-center bg-black/50 p-4">
          <View className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md sm:max-w-lg">
            {selectedCustomer && (
              <>
                <View className="mb-4 sm:mb-6">
                  <Text className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2">
                    {selectedCustomer.razao_cliente}
                  </Text>
                  <View className="space-y-2">
                    <View className="flex-row items-center">
                      <MaterialIcons name="badge" size={16} color="#6B7280" className="sm:text-lg mr-2" />
                      <Text className="text-sm sm:text-base text-gray-600">
                        Código: {selectedCustomer.id_cliente}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <MaterialIcons name="group" size={16} color="#6B7280" className="sm:text-lg mr-2" />
                      <Text className="text-sm sm:text-base text-gray-600">
                        Grupo: {selectedCustomer.descricao_grupo}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
            <TouchableOpacity
              className="bg-blue-500 rounded-lg sm:rounded-xl mt-2 p-3 sm:p-4 active:bg-blue-600"
              onPress={closeModal}
              accessibilityLabel="Fechar detalhes"
            >
              <Text className="text-white text-center text-sm sm:text-base font-medium">Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}
