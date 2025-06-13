import Header from '@/components/header'
import { Product } from '@/models/product'
import { ProductRepository } from '@/repositories/product.repository'
import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

export default function ProductSearch() {
  const params = useLocalSearchParams()
  const username = Array.isArray(params.usuario) ? params.usuario[0] : params.usuario || 'User'

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null) // Estado do produto selecionado
  const [isModalVisible, setModalVisible] = useState(false) // Controle do modal

  const productRepository = new ProductRepository()

  const searchProducts = useCallback(async (query: string) => {
    setLoading(true)
    try {
      let searchParams: { nome?: string; codigo?: string; limite?: number } = { limite: 10 };
      if (!query) {
        searchParams = { limite: 10 };
      } else if (/^\d+$/.test(query.trim())) {
        searchParams.codigo = query.trim();
      } else {
        searchParams.nome = query.trim();
      }
      const results = await productRepository.search(searchParams);
      setSearchResults(results);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
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

  useEffect(() => {
    // Busca inicial automática
    searchProducts('')
  }, [searchProducts])

  const renderProductItem = useCallback(({ item, index }: { item: Product; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 mb-3 mx-1"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <Text className="text-base sm:text-lg lg:text-xl font-bold text-gray-800" numberOfLines={2}>
            {item.descricao_produto}
          </Text>
          <View className="flex-row items-center mt-2 flex-wrap">
            <View className="flex-row items-center mr-4 mb-1">
              <MaterialIcons name="qr-code" size={14} color="#6B7280" className="sm:text-base" />
              <Text className="text-xs sm:text-sm text-gray-600 ml-1">Código: {item.codigo}</Text>
            </View>
            <View className="flex-row items-center mb-1">
              <MaterialIcons name="category" size={14} color="#6B7280" className="sm:text-base" />
              <Text className="text-xs sm:text-sm text-gray-600 ml-1" numberOfLines={1}>
                Grupo: {item.descricao_grupo}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          className="bg-blue-50 p-2 sm:p-3 rounded-full active:bg-blue-100"
          onPress={() => handleProductClick(item)}
          accessibilityLabel="Ver detalhes do produto"
        >
          <MaterialIcons name="chevron-right" size={18} color="#3B82F6" className="sm:text-xl" />
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
          keyExtractor={(item, index) => item.codigo ? String(item.codigo) : `produto-${index}`}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingTop: 16,
            paddingBottom: 20
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="space-y-3 sm:space-y-4 lg:space-y-6 mb-4 sm:mb-6 px-1">
              <Text className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                Buscar Produtos
              </Text>
              <Text className="text-gray-500 text-sm sm:text-base">
                Digite o nome ou código do produto para começar
              </Text>

              <View className="flex-row items-center bg-white rounded-xl sm:rounded-2xl border border-gray-100">
                <View className="flex-1 flex-row items-center">
                  <MaterialIcons name="search" size={18} color="#9CA3AF" className="ml-3 sm:ml-4 sm:text-xl" />
                  <TextInput
                    className="flex-1 py-3 sm:py-4 px-2 sm:px-3 text-sm sm:text-base text-gray-700"
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
                  <Text className="text-gray-500 mt-4 text-sm sm:text-base">Buscando produtos...</Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="search-off" size={40} color="#D1D5DB" className="sm:text-5xl mb-4" />
                  <Text className="text-gray-500 text-center text-sm sm:text-base">
                    Nenhum produto encontrado
                  </Text>
                  <Text className="text-gray-400 text-center mt-1 text-xs sm:text-sm">
                    Tente uma nova busca
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
            {selectedProduct && (
              <>
                <View className="mb-4 sm:mb-6">
                  <Text className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2">
                    {selectedProduct.descricao_produto}
                  </Text>
                  <View className="space-y-2">
                    <View className="flex-row items-center">
                      <MaterialIcons name="qr-code" size={16} color="#6B7280" className="sm:text-lg mr-2" />
                      <Text className="text-sm sm:text-base text-gray-600">
                        Código: {selectedProduct.codigo}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <MaterialIcons name="category" size={16} color="#6B7280" className="sm:text-lg mr-2" />
                      <Text className="text-sm sm:text-base text-gray-600">
                        Grupo: {selectedProduct.descricao_grupo}
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
