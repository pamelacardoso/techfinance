import Header from '@/components/header'
import { SalesQuerySchema, SalesRepository, TopProducts } from '@/repositories/sales.repository'
import { GeminiService } from '@/services/gemini.service'
import { convertStringToCurrency, convertStringToDecimal } from '@/utils/numbers'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

const salesRepository = new SalesRepository()
const geminiService = new GeminiService()

export default function SalesReport() {
  const params = useLocalSearchParams()
  const username = params.usuario || 'Admin'

  const [sales, setSales] = useState<TopProducts[]>([])
  const [loading, setLoading] = useState(false)
  const [totalSales, setTotalSales] = useState(0)
  const [totalValue, setTotalValue] = useState(0)
  const [insights, setInsights] = useState('')

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true)
      try {
        const query: SalesQuerySchema = {}
        const salesData = await salesRepository.getTopProductsByValue(query)
        setSales(salesData)

        const totalSalesCount = Number(salesData[0]?.qtde) ?? 0;
        let totalSalesValue = 0;

        for (const sale of salesData) {
          totalSalesValue += Number(sale.valor_total) ?? 0;
        }

        console.log(totalSalesValue)

        setTotalSales(totalSalesCount)
        setTotalValue(totalSalesValue)
      } catch (error) {
        console.error('Erro ao buscar dados de vendas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [])

  const getInsights = async () => {
    try {
      const prompt = `Forneça insights sobre as seguintes vendas: Total de Vendas: ${totalSales}, Valor Total: ${totalValue.toFixed(2)} em até 260 caracteres. ${sales.map((s) => `Produto: ${s.codigo_produto} ${s.descricao_produto}\nValor Total de Vendas:${s.valor_total}\n`).join('\n')}`;
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
      <View className="flex-row justify-between items-center">
        <View className="flex-1 pr-4">
          <Text className="text-lg font-bold text-gray-800" numberOfLines={2}>{item.descricao_produto}</Text>
          <Text className="text-sm text-gray-500 mt-1">Código: {item.codigo_produto}</Text>
        </View>
        <View className="items-end">
          <Text className="text-blue-600 font-medium">{convertStringToCurrency(item.valor_total ?? '0')}</Text>
        </View>
      </View>
    </Animated.View>
  ), [])

  return (
    <View className="flex-1 bg-gray-50">
      <Header username={username} />
      <View className="flex-1">
        <Animated.View
          entering={FadeIn}
          className="px-4 pt-4 pb-2 bg-white shadow-sm"
        >
          <Text className="text-2xl font-bold text-gray-800">Top 10 Vendas - Insights em $</Text>
          <Text className="text-gray-500 mt-1">Veja abaixo as vendas realizadas</Text>

            <View className="bg-white rounded-2xl shadow-lg shadow-blue-500/10 p-4">
              <Text className="text-lg font-semibold text-gray-700 mb-2">Resumo de Vendas</Text>
              <View className="flex-row justify-between items-center mt-6 bg-blue-50 p-4 rounded-2xl">
                <View>
                  <Text className="text-sm text-blue-600 font-medium">Total de Vendas</Text>
                  <Text className="text-2xl font-bold text-gray-800 mt-1">{totalSales.toLocaleString('pt-br', { style: 'decimal' })}</Text>
                </View>
                <View>
                  <Text className="text-sm text-blue-600 font-medium">Valor Total Histórico</Text>
                  <Text className="text-2xl font-bold text-gray-800 mt-1">
                    {sales?.length > 0 ? convertStringToDecimal(sales[0].total_historico ?? '0') : 'N/A'}
                  </Text>
                  <Text className="mt-2 text-sm text-blue-600 font-medium">Valor Total Top 10</Text>
                  <Text className="text-2xl font-bold text-gray-800 mt-1">
                    {totalValue.toLocaleString('pt-br', { currency: 'BRL' })}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={getInsights}
              className="bg-blue-600 rounded-xl p-4 mt-4 flex-row items-center justify-center active:bg-blue-700"
            >
              <MaterialIcons name="insights" size={20} color="white" />
              <Text className="text-white font-medium text-base ml-2">Obter Insights do Dinho</Text>
            </TouchableOpacity>

            {insights ? (
              <Animated.View
                entering={FadeInDown}
                className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
              >
                <Text className="text-gray-800 leading-relaxed">{insights}</Text>
              </Animated.View>
            ) : null}
        </Animated.View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" className="text-blue-600" />
          </View>
        ) : (
          <FlatList
            data={sales}
            renderItem={renderSalesItem}
            keyExtractor={(item) => item.codigo_produto.toString()}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-8">
                <MaterialIcons name="receipt-long" size={48} className="text-gray-300 mb-4" />
                <Text className="text-gray-500 text-center">Nenhuma venda encontrada.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  )
}
