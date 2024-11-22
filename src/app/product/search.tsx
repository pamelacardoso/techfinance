import Header from '@/components/header'
import { Product } from '@/models/product'
import { ProductRepository } from '@/repositories/product.repository'
import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

export default function ProductSearch() {
  const params = useLocalSearchParams()
  const username = params.usuario || 'User'

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null) // Estado do produto selecionado
  const [isModalVisible, setModalVisible] = useState(false) // Controle do modal

  const productRepository = new ProductRepository()

  const searchProducts = useCallback(async (query: string) => {
    setLoading(true)
    try {
      const results = await productRepository.search({ nome: query, limite: 10 })
      setSearchResults(results)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = useCallback(() => {
    searchProducts(searchQuery)
  }, [searchQuery, searchProducts])

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setModalVisible(true)
  }

  const closeModal = () => {
    setSelectedProduct(null)
    setModalVisible(false)
  }

  const renderProductItem = useCallback(({ item, index }: { item: Product; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      className="bg-white rounded-2xl shadow-lg shadow-blue-500/10 p-4 mb-3"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">{item.descricao_produto}</Text>
          <View className="flex-row items-center mt-2">
            <MaterialIcons name="qr-code" size={16} className="text-gray-400" />
            <Text className="text-sm text-gray-600 ml-1">Código: {item.codigo}</Text>
          </View>
          <View className="flex-row items-center mt-1">
            <MaterialIcons name="category" size={16} className="text-gray-400" />
            <Text className="text-sm text-gray-600 ml-1">Grupo: {item.descricao_grupo}</Text>
          </View>
        </View>
        <TouchableOpacity
          className="bg-blue-50 p-2 rounded-full"
          onPress={() => handleProductClick(item)}
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
          renderItem={renderProductItem}
          keyExtractor={(item) => item.codigo}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 20
          }}
          ListHeaderComponent={
            <View className="space-y-4 mb-6">
              <View>
                <Text className="text-2xl font-bold text-gray-800">Buscar Produtos</Text>
                <Text className="text-gray-500 my-2">
                  Digite o nome ou código do produto para começar
                </Text>
              </View>

              <View className="flex-row items-center bg-white rounded-2xl shadow-sm border border-gray-100">
                <View className="flex-1 flex-row items-center">
                  <MaterialIcons name="search" size={20} className="text-gray-400 ml-4" />
                  <TextInput
                    className="flex-1 py-3 px-3 text-gray-700"
                    placeholder="Digite o nome ou código do produto"
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                    accessibilityLabel="Campo de busca de produtos"
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
                  <Text className="text-gray-500 mt-4">Buscando produtos...</Text>
                </>
              ) : searchQuery.length > 0 ? (
                <>
                  <MaterialIcons name="search-off" size={48} className="text-gray-300 mb-4" />
                  <Text className="text-gray-500 text-center">
                    Nenhum produto encontrado para "{searchQuery}"
                  </Text>
                  <Text className="text-gray-400 text-center mt-1">
                    Tente uma nova busca com termos diferentes
                  </Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="search" size={48} className="text-gray-300 mb-4" />
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
            {selectedProduct && (
              <>
                <Text className="text-lg font-bold">{selectedProduct.descricao_produto}</Text>
                <Text className="text-gray-600">Código: {selectedProduct.codigo}</Text>
                <Text className="text-gray-600">Grupo: {selectedProduct.descricao_grupo}</Text>
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
