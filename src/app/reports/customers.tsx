import Header from '@/components/header'
import { CompanyParticipation, SalesRepository } from '@/repositories/sales.repository'
import { GeminiService } from '@/services/gemini.service'
import { convertStringToDecimal } from '@/utils/numbers'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

const salesRepository = new SalesRepository()
const geminiService = new GeminiService()

export default function CustomerReports() {
  const params = useLocalSearchParams()
  const username = params.usuario || 'Admin'

  const [companyParticipation, setCompanyParticipation] = useState<CompanyParticipation[]>([])
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState('')

  const fetchCompanyParticipation = useCallback(async () => {
    setLoading(true)
    try {
      const data = await salesRepository.getCompanySalesParticipation({})
      setCompanyParticipation(data)
    } catch (error) {
      console.error('Erro ao buscar participação das empresas:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompanyParticipation()
  }, [fetchCompanyParticipation])

  const getInsights = useCallback(async () => {
    try {
      const prompt = `Forneça insights sobre a participação das seguintes empresas nas vendas: ${companyParticipation.map(company => `${company.nome_fantasia}: ${Number(company.percentual)?.toFixed(2) ?? 0}%`).join(', ')}. Limite a resposta a 260 caracteres.`
      await geminiService.sendMessage(prompt)
      const response = geminiService.messages[geminiService.messages.length - 1]?.message || 'Sem insights disponíveis.'
      setInsights(response)
    } catch (error) {
      console.error('Erro ao obter insights:', error)
      setInsights('Não foi possível obter insights no momento.')
    }
  }, [companyParticipation])

  const renderCompanyItem = useCallback(({ item, index }: { item: CompanyParticipation; index: number }) => (
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
          <Text className="text-lg font-bold text-gray-800" numberOfLines={2}>{item.nome_fantasia}</Text>
          <Text className="text-sm text-gray-500 mt-1">Quantidade: {item.quantidade_total}</Text>
        </View>
        <View className="items-end">
          <Text className="text-2xl font-bold text-blue-600">{convertStringToDecimal(item.percentual) ?? 0}%</Text>
          <Text className="text-xs text-blue-500">Participação</Text>
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
          <Text className="text-3xl font-bold text-gray-800">Relatório de Clientes</Text>
          <Text className="text-lg text-gray-600 mt-1">Participação das empresas nas vendas</Text>

          <View className="mt-6 space-y-4">
            <View className="bg-white rounded-2xl shadow-lg shadow-blue-500/10 p-4">
              <Text className="text-lg font-semibold text-gray-700 mb-2">Resumo</Text>
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-sm text-gray-500">Total de Empresas</Text>
                  <Text className="text-2xl font-bold text-blue-600 mt-1">{companyParticipation.length}</Text>
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
          <Text className="text-xl font-bold text-gray-800 mb-4">Participação por Empresa</Text>
          {loading ? (
            <View className="flex-1 justify-center items-center py-12">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-500 mt-4">Carregando dados...</Text>
            </View>
          ) : (
            <FlatList
              data={companyParticipation}
              renderItem={renderCompanyItem}
              keyExtractor={(item, index) => `${item.nome_fantasia}-${index}`}
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center py-12">
                  <MaterialIcons name="business" size={48} color="#D1D5DB" />
                  <Text className="text-gray-500 text-center mt-4">Nenhuma empresa encontrada.</Text>
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
