import Header from '@/components/header'
import { Product } from '@/models/product'
import { ProductRepository } from '@/repositories/product.repository'
import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

export default function ProductSearch() {
  const params = useLocalSearchParams()
  const username = Array.isArray(params.usuario) ? params.usuario[0] : params.usuario || 'User'

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalVisible, setModalVisible] = useState(false)

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
    searchProducts('')
  }, [searchProducts])

  const renderProductItem = useCallback(({ item, index }: { item: Product; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 mb-4 sm:mb-6 mx-1 sm:mx-2 shadow-sm web:shadow-md web:hover:shadow-lg web:transition-all web:duration-200 web:hover:scale-[1.02] border border-gray-100 web:border-gray-200"
    >
      <TouchableOpacity
        onPress={() => handleProductClick(item)}
        className="web:cursor-pointer"
        accessibilityLabel="Ver detalhes do produto"
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-3 sm:mr-4">
            <Text className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3 web:font-semibold" numberOfLines={2}>
              {item.descricao_produto}
            </Text>
            <View className="flex-row items-center mt-2 flex-wrap gap-2 sm:gap-4">
              <View className="flex-row items-center bg-gray-50 web:bg-gray-100 px-3 py-1.5 rounded-full">
                <MaterialIcons name="qr-code" size={16} color="#6B7280" className="sm:text-lg" />
                <Text className="text-xs sm:text-sm md:text-base text-gray-600 ml-2 font-medium">
                  {item.codigo}
                </Text>
              </View>
              <View className="flex-row items-center bg-blue-50 web:bg-blue-100 px-3 py-1.5 rounded-full">
                <MaterialIcons name="category" size={16} color="#3B82F6" className="sm:text-lg" />
                <Text className="text-xs sm:text-sm md:text-base text-blue-700 ml-2 font-medium" numberOfLines={1}>
                  {item.descricao_grupo}
                </Text>
              </View>
            </View>
          </View>
          <View className="bg-blue-50 web:bg-blue-100 p-3 sm:p-4 rounded-full web:hover:bg-blue-200 web:transition-colors">
            <MaterialIcons name="chevron-right" size={20} color="#3B82F6" className="sm:text-2xl" />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  ), [])

  return (
    <View className="flex-1 bg-gray-50 web:bg-gray-100 web:min-h-screen">
      <Header username={username} />

      {/* Main Container with responsive max-width */}
      <View className="flex-1 web:max-w-7xl web:mx-auto web:w-full">
        <Animated.View
          entering={FadeIn}
          className="flex-1"
        >
          <FlatList
            data={searchResults}
            renderItem={renderProductItem}
            keyExtractor={(item, index) => item.codigo ? String(item.codigo) : `produto-${index}`}
            numColumns={Platform.OS === 'web' ? 2 : 1}
            key={Platform.OS === 'web' ? 'web-grid' : 'mobile-list'}
            columnWrapperStyle={Platform.OS === 'web' ? { justifyContent: 'space-between', paddingHorizontal: 8 } : undefined}
            contentContainerStyle={{
              paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
              paddingTop: Platform.OS === 'web' ? 32 : 16,
              paddingBottom: Platform.OS === 'web' ? 40 : 20
            }}
            showsVerticalScrollIndicator={Platform.OS !== 'web'}
            ListHeaderComponent={
              <View className="mb-6 sm:mb-8 md:mb-12 web:max-w-4xl web:mx-auto web:w-full">
                {/* Header Section */}
                <View className="text-center mb-6 sm:mb-8 md:mb-10">
                  <Text className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2 sm:mb-4">
                    Buscar Produtos
                  </Text>
                  <Text className="text-gray-500 text-base sm:text-lg md:text-xl web:text-gray-600">
                    Digite o nome ou código do produto para começar
                  </Text>
                </View>

                {/* Enhanced Search Bar */}
                <View className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 web:border-gray-300 shadow-sm web:shadow-lg p-2 sm:p-3 web:p-4">
                  <View className="flex-row items-center">
                    <View className="flex-1 flex-row items-center">
                      <View className="p-3 sm:p-4">
                        <MaterialIcons name="search" size={24} color="#9CA3AF" className="sm:text-3xl" />
                      </View>
                      <TextInput
                        className="flex-1 py-4 sm:py-5 md:py-6 px-2 sm:px-4 text-base sm:text-lg md:text-xl text-gray-700 web:text-gray-800 web:placeholder:text-gray-500"
                        placeholder="Digite o nome ou código do produto"
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                        accessibilityLabel="Campo de busca de produtos"
                        style={{
                          fontSize: Platform.OS === 'web' ? 18 : undefined
                        }}
                      />
                    </View>

                    <View className="flex-row items-center space-x-2 sm:space-x-3">
                      {searchQuery.length > 0 && (
                        <TouchableOpacity
                          onPress={() => setSearchQuery('')}
                          className="p-3 sm:p-4 rounded-full web:hover:bg-gray-100 web:transition-colors"
                          accessibilityLabel="Limpar busca"
                        >
                          <MaterialIcons name="close" size={20} color="#9CA3AF" className="sm:text-2xl" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={handleSearch}
                        className="bg-blue-500 web:bg-blue-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 web:hover:bg-blue-700 active:bg-blue-600 web:transition-colors web:shadow-md"
                        accessibilityLabel="Botão de busca"
                      >
                        <MaterialIcons name="search" size={24} color="white" className="sm:text-3xl" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            }
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-12 sm:py-16 md:py-20 px-4 web:max-w-2xl web:mx-auto">
                {loading ? (
                  <View className="items-center">
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text className="text-gray-500 mt-6 text-base sm:text-lg md:text-xl web:text-gray-600">
                      Buscando produtos...
                    </Text>
                  </View>
                ) : (
                  <View className="items-center">
                    <View className="bg-gray-100 web:bg-gray-200 p-6 sm:p-8 rounded-full mb-6">
                      <MaterialIcons name="search-off" size={48} color="#D1D5DB" className="sm:text-6xl" />
                    </View>
                    <Text className="text-gray-500 web:text-gray-600 text-center text-lg sm:text-xl md:text-2xl font-medium mb-2">
                      Nenhum produto encontrado
                    </Text>
                    <Text className="text-gray-400 web:text-gray-500 text-center text-base sm:text-lg">
                      Tente uma nova busca com termos diferentes
                    </Text>
                  </View>
                )}
              </View>
            }
          />
        </Animated.View>
      </View>

      {/* Enhanced Modal for Web */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center items-center bg-black/50 web:bg-black/60 p-4 sm:p-6 md:p-8">
          <View className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 w-full max-w-md sm:max-w-lg md:max-w-2xl web:max-w-3xl shadow-xl web:shadow-2xl">
            {selectedProduct && (
              <>
                <View className="mb-6 sm:mb-8">
                  <Text className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 web:font-semibold">
                    {selectedProduct.descricao_produto}
                  </Text>
                  <View className="space-y-4 sm:space-y-6">
                    <View className="bg-gray-50 web:bg-gray-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                      <View className="flex-row items-center mb-3">
                        <MaterialIcons name="qr-code" size={24} color="#6B7280" className="sm:text-3xl mr-3" />
                        <Text className="text-base sm:text-lg md:text-xl text-gray-600 web:text-gray-700 font-medium">
                          Código do Produto
                        </Text>
                      </View>
                      <Text className="text-lg sm:text-xl md:text-2xl text-gray-800 font-bold ml-9">
                        {selectedProduct.codigo}
                      </Text>
                    </View>
                    <View className="bg-blue-50 web:bg-blue-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                      <View className="flex-row items-center mb-3">
                        <MaterialIcons name="category" size={24} color="#3B82F6" className="sm:text-3xl mr-3" />
                        <Text className="text-base sm:text-lg md:text-xl text-blue-700 font-medium">
                          Grupo do Produto
                        </Text>
                      </View>
                      <Text className="text-lg sm:text-xl md:text-2xl text-blue-800 font-bold ml-9">
                        {selectedProduct.descricao_grupo}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  className="bg-blue-500 web:bg-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 web:hover:bg-blue-700 active:bg-blue-600 web:transition-colors web:shadow-md"
                  onPress={closeModal}
                  accessibilityLabel="Fechar detalhes"
                >
                  <Text className="text-white text-center text-base sm:text-lg md:text-xl font-semibold">
                    Fechar
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}
