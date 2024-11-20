import Header from "@/components/header"
import { SalesQuerySchema, SalesRepository, TopProducts } from "@/repositories/sales.repository"
import { GeminiService } from "@/services/gemini.service"
import { MaterialIcons } from "@expo/vector-icons"
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native"
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

const salesRepository = new SalesRepository()
const geminiService = new GeminiService()

export default function SalesByMinMax() {
  const params = useLocalSearchParams()
  const username = params.usuario || 'Admin'

  const [sales, setSales] = useState<TopProducts[]>([])
  const [loading, setLoading] = useState(false)
  const [totalSales, setTotalSales] = useState(0)
  const [insights, setInsights] = useState('')

  const fetchSales = useCallback(async () => {
    setLoading(true)
    try {
      const query: SalesQuerySchema = {}
      const salesData = await salesRepository.getPriceVariationByProduct(query)
      setSales(salesData)
      setTotalSales(salesData.length)
    } catch (error) {
      console.error('Erro ao buscar dados de vendas:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const getInsights = async () => {
    try {
      const prompt = `Forneça insights sobre as seguintes vendas: Total de Vendas: ${totalSales}, ${sales.map((s) => `Produto: ${s.codigo_produto} ${s.descricao_produto}\nValor Mínimo ${s.valor_minimo}, Valor Máximo ${s.valor_maximo}, Diferença Percentual ${s.percentual_diferenca}\n`).join('\n')}`
      await geminiService.sendMessage(prompt)
      const response = geminiService.messages[geminiService.messages.length - 1].message
      setInsights(response)
    } catch (error) {
      console.error('Erro ao obter insights do Gemini:', error)
    }
  }

  const renderSalesItem = useCallback(({ item, index }: { item: TopProducts; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      className="bg-white rounded-2xl shadow-lg shadow-blue-500/10 p-4 mb-3"
    >
      <LinearGradient
        colors={['#4F46E5', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
      />
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-4">
          <Text className="text-lg font-bold text-gray-800" numberOfLines={2}>{item.descricao_produto}</Text>
          <Text className="text-sm text-gray-500 mt-1">Código: {item.codigo_produto}</Text>
          <View className="flex-row justify-between mt-2">
            <View>
              <Text className="text-xs text-gray-500">Mínimo</Text>
              <Text className="text-sm font-semibold text-green-600">R$ {Number(item.valor_minimo).toFixed(2)}</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-500">Máximo</Text>
              <Text className="text-sm font-semibold text-red-600">R$ {Number(item.valor_maximo).toFixed(2)}</Text>
            </View>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-2xl font-bold text-blue-600">{Number(item.percentual_diferenca).toFixed(2)}%</Text>
          <Text className="text-xs text-blue-500">Variação</Text>
        </View>
      </View>
    </Animated.View>
  ), [])

  return (
    <View className="flex-1 bg-gray-50">
      <Header username={username} />
      <Animated.ScrollView
        entering={FadeIn.delay(300).springify()}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-6 pb-4">
          <Text className="text-3xl font-bold text-gray-800">Variação de Preços</Text>
          <Text className="text-lg text-gray-600 mt-1">Top 10 produtos com maior variação</Text>

          <View className="mt-6 space-y-4">
            <View className="bg-white rounded-2xl shadow-lg shadow-blue-500/10 p-4">
              <Text className="text-lg font-semibold text-gray-700 mb-2">Resumo</Text>
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-sm text-gray-500">Total de Produtos</Text>
                  <Text className="text-2xl font-bold text-blue-600 mt-1">{totalSales}</Text>
                </View>
                <TouchableOpacity
                  onPress={getInsights}
                  className="bg-blue-600 rounded-xl px-4 py-2 flex-row items-center justify-center active:bg-blue-700"
                  accessibilityLabel="Obter insights do Dinho"
                >
                  <MaterialIcons name="insights" size={20} color="white" />
                  <Text className="text-white font-medium text-base ml-2">Insights do Dinho</Text>
                </TouchableOpacity>
              </View>
            </View>

            {insights ? (
              <Animated.View
                entering={FadeInDown.springify()}
                className="bg-white rounded-2xl shadow-lg shadow-blue-500/10 p-4"
              >
                <Text className="text-gray-700 leading-relaxed">{insights}</Text>
              </Animated.View>
            ) : null}
          </View>
        </View>

        <View className="px-4 mt-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">Detalhes dos Produtos</Text>
          {loading ? (
            <View className="flex-1 justify-center items-center py-12">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-500 mt-4">Carregando dados...</Text>
            </View>
          ) : (
            <FlatList
              data={sales}
              renderItem={renderSalesItem}
              keyExtractor={(item) => item.codigo_produto.toString()}
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center py-12">
                  <MaterialIcons name="bar-chart" size={48} color="#D1D5DB" />
                  <Text className="text-gray-500 text-center mt-4">Nenhum produto encontrado.</Text>
                </View>
              }
              scrollEnabled={false}
            />
          )}
        </View>
      </Animated.ScrollView>
    </View>
  )
}
