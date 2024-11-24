import Header from '@/components/header'
import { api } from '@/lib/api'
import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

interface RenegotiatedTitle {
  title: string
  value: string
  renegotiation_date: string
  original_due_date: string
  new_due_date: string
}

interface CashFlowSummary {
  month_year: string
  total_renegotiated: string
}

interface ApiResponse {
  renegotiated_titles: RenegotiatedTitle[]
  cash_flow_summary: CashFlowSummary[]
  notes: string
}

export default function Assignments() {
  const params = useLocalSearchParams()
  const username = params.usuario || 'Admin'

  const [assignment, setAssignment] = useState('')
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const onReportSubmit = useCallback(async () => {
    setIsLoading(true)
    setError('')
    const assignmentCount = Number(assignment)

    try {
      const response = await api.get<ApiResponse>('/contas_receber/ai', {
        params: {
          prompt: `Realize a renegociação de todos os títulos vencidos, considere a renegociação de ${assignmentCount} título${assignmentCount > 1 ? 's' : ''} por dia, somente os títulos vencidos e o inicio da renegociação a data de hoje. Considerar que a nova data de vencimento será de 20 dias a contar da data de cada renegociação. Crie uma tabela e projete um fluxo de caixa com base nas novas datas de vencimento, exibir as seguintes colunas: título, valor, dt de renegociação, dt original vencto, nova dt vencto. Exiba também o novo fluxo de caixa resumido por mês. Apresente apenas a tabela de título de renegociação e o fluxo de caixa.`,
        },
      })

      if (response.status === 200) {
        setApiResponse(response.data)
      } else {
        throw new Error('Failed to fetch data')
      }
    } catch (err) {
      setError('Ocorreu um erro ao buscar os dados. Por favor, tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }, [assignment])

  const renderRenegotiatedTitle = useCallback(({ item, index }: { item: RenegotiatedTitle; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      className="bg-white rounded-lg shadow-sm p-4 mb-3"
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-bold text-gray-800">Título: {item.title}</Text>
        <Text className="text-base font-semibold text-blue-600">R$ {item.value}</Text>
      </View>
      <View className="flex-row justify-between">
        <View>
          <Text className="text-sm text-gray-600">Data de Renegociação:</Text>
          <Text className="text-sm font-medium text-gray-800">{item.renegotiation_date}</Text>
        </View>
        <View>
          <Text className="text-sm text-gray-600">Vencimento Original:</Text>
          <Text className="text-sm font-medium text-gray-800">{item.original_due_date}</Text>
        </View>
        <View>
          <Text className="text-sm text-gray-600">Novo Vencimento:</Text>
          <Text className="text-sm font-medium text-gray-800">{item.new_due_date}</Text>
        </View>
      </View>
    </Animated.View>
  ), [])

  return (
    <View className="flex-1 bg-gray-50">
      <Header username={username} />
      <Animated.ScrollView
        entering={FadeIn.delay(200).springify()}
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="py-6">
          <Text className="text-3xl font-bold text-gray-800">Renegociação de Títulos</Text>
          <Text className="text-lg text-gray-600 mt-2">
            Visualize e gerencie todas as suas renegociações.
          </Text>
        </View>

        <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <Text className="text-base font-semibold text-gray-700 mb-2">
            Número de renegociações por dia
          </Text>
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 p-3 text-base text-gray-700 bg-gray-100 rounded-l-lg"
              placeholder="Digite o número"
              keyboardType="numeric"
              onChangeText={setAssignment}
              value={assignment}
            />
            <TouchableOpacity
              onPress={onReportSubmit}
              disabled={isLoading || !assignment}
              className={`p-3 rounded-r-lg ${isLoading || !assignment ? 'bg-blue-300' : 'bg-blue-600'}`}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <MaterialIcons name="search" size={24} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <View className="bg-red-100 border border-red-400 rounded-lg p-4 mb-6">
            <Text className="text-red-700">{error}</Text>
          </View>
        ) : null}

        {!apiResponse && (
            <View className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <Text className="text-base text-gray-700">Nenhum dado disponível. Por favor, realize uma busca.</Text>
            </View>
        )}

        {apiResponse && (
          <>
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-800 mb-4">Títulos Renegociados</Text>
              <FlatList
                data={apiResponse.renegotiated_titles}
                renderItem={renderRenegotiatedTitle}
                keyExtractor={(item) => `${item.title}-${item.renegotiation_date}`}
                scrollEnabled={false}
              />
            </View>

            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-800 mb-4">Resumo do Fluxo de Caixa</Text>
              {apiResponse.cash_flow_summary && apiResponse.cash_flow_summary.map((summary, index) => (
                <View key={index} className="bg-white rounded-lg shadow-sm p-4 mb-3">
                  <Text className="text-lg font-semibold text-gray-800">{summary.month_year}</Text>
                  <Text className="text-base text-blue-600 mt-1">
                    Total Renegociado: R$ {summary.total_renegotiated}
                  </Text>
                </View>
              ))}
            </View>

            {apiResponse.notes && (
              <View className="mb-6">
                <Text className="text-xl font-bold text-gray-800 mb-2">Observações</Text>
                <Text className="text-base text-gray-700">{apiResponse.notes}</Text>
              </View>
            )}
          </>
        )}
      </Animated.ScrollView>
    </View>
  )
}
