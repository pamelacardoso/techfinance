import Header from '@/components/header'
import { Sales } from '@/models/sales'
import { SalesQuerySchema, SalesRepository } from '@/repositories/sales.repository'
import { GeminiService } from '@/services/gemini.service'
import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

const salesRepository = new SalesRepository()
const geminiService = new GeminiService()

export default function SalesReport() {
  const params = useLocalSearchParams()
  const username = params.usuario || 'Admin'

  const [sales, setSales] = useState<Sales[]>([])
  const [loading, setLoading] = useState(false)
  const [totalSales, setTotalSales] = useState(0)
  const [totalValue, setTotalValue] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [insights, setInsights] = useState('')

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true)
      try {
        const query: SalesQuerySchema = {
          dataEmissao: startDate,
        }

        const salesData = await salesRepository.getSales(query)
        setSales(salesData)

        const totalSalesCount = salesData.length
        const totalSalesValue = salesData.reduce((acc, sale) => acc + parseFloat(sale.total || '0'), 0)

        setTotalSales(totalSalesCount)
        setTotalValue(totalSalesValue)
      } catch (error) {
        console.error('Erro ao buscar dados de vendas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [startDate])

  const getInsights = async () => {
    try {
      const prompt = `Forneça insights sobre as seguintes vendas: Total de Vendas: ${totalSales}, Valor Total: R$ ${totalValue.toFixed(
        2
      )} em até 255 caracteres.`
      await geminiService.sendMessage(prompt)
      const response = geminiService.messages[geminiService.messages.length - 1].message
      setInsights(response)
    } catch (error) {
      console.error('Erro ao obter insights do Gemini:', error)
    }
  }

  const renderSalesItem = useCallback(({ item, index }: { item: Sales; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      className="bg-white rounded-2xl shadow-lg shadow-blue-500/10 p-6 mb-4"
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">{item.descricaoProduto}</Text>
          <Text className="text-sm text-gray-600 mt-1">{item.nomeFantasia}</Text>
        </View>
        <View className="bg-blue-50 px-3 py-1 rounded-full">
          <Text className="text-blue-600 font-medium">R$ {item.total}</Text>
        </View>
      </View>

      <View className="space-y-2">
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
  ), [])

  return (
    <View className="flex-1 bg-gray-50">
      <Header username={username} />
      <View className="flex-1">
        <Animated.View
          entering={FadeIn}
          className="px-4 pt-4 pb-2 bg-white shadow-sm"
        >
          <Text className="text-2xl font-bold text-gray-800">Relatório de Vendas</Text>
          <Text className="text-gray-500 mt-1">Veja abaixo as vendas realizadas</Text>

          <View className="flex-row justify-between items-center mt-6 bg-blue-50 p-4 rounded-2xl">
            <View>
              <Text className="text-sm text-blue-600 font-medium">Total de Vendas</Text>
              <Text className="text-2xl font-bold text-gray-800 mt-1">{totalSales}</Text>
            </View>
            <View>
              <Text className="text-sm text-blue-600 font-medium">Valor Total</Text>
              <Text className="text-2xl font-bold text-gray-800 mt-1">
                R$ {totalValue.toFixed(2)}
              </Text>
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

          <View className="mt-6">
            <Text className="text-base font-semibold text-gray-800 mb-2">Filtrar por Data</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200">
              <MaterialIcons name="calendar-today" size={20} className="text-gray-400 ml-4" />
              <TextInput
                className="flex-1 px-4 py-3 text-gray-700"
                placeholder="Data de Emissão (YYYY-MM-DD)"
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>
          </View>
        </Animated.View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" className="text-blue-600" />
          </View>
        ) : (
          <FlatList
            data={sales}
            renderItem={renderSalesItem}
            keyExtractor={(item) => item.idVenda.toString()}
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
