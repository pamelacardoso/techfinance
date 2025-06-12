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
  const username = Array.isArray(params.usuario)
    ? params.usuario[0] || 'Admin'
    : params.usuario || 'Admin'

  const [assignment, setAssignment] = useState('')
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  function parseValueSafely(valueStr: string | number): number {
    if (!valueStr && valueStr !== 0) return 0;

    // Se já é um número, retorna diretamente
    if (typeof valueStr === 'number') {
      return isNaN(valueStr) ? 0 : valueStr;
    }

    // Converte para string se necessário
    const str = String(valueStr);

    // Remove todos os caracteres não numéricos exceto . e ,
    const cleanValue = str.replace(/[^\d.,\-]/g, '');

    // Se não tem nenhum dígito, retorna 0
    if (!/\d/.test(cleanValue)) return 0;

    // Se tem vírgula e ponto, assume formato BR (1.234,56)
    if (cleanValue.includes(',') && cleanValue.includes('.')) {
      return parseFloat(cleanValue.replace(/\./g, '').replace(',', '.')) || 0;
    }

    // Se só tem vírgula, pode ser decimal BR (123,45) ou milhares US (1,234)
    if (cleanValue.includes(',') && !cleanValue.includes('.')) {
      const parts = cleanValue.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        // Provavelmente decimal BR
        return parseFloat(cleanValue.replace(',', '.')) || 0;
      } else {
        // Provavelmente milhares US
        return parseFloat(cleanValue.replace(/,/g, '')) || 0;
      }
    }

    // Fallback para parseFloat normal
    return parseFloat(cleanValue) || 0;
  }

  function handleCashFlow(titles: RenegotiatedTitle[]) {
    const result: Record<string, number> = {};

    for (const title of titles) {
      const date = new Date(title.renegotiation_date);
      const monthYear = date.toLocaleDateString('pt-br', {
        month: '2-digit',
        year: 'numeric',
      });

      const value = parseValueSafely(title.value);

      result[monthYear] = (result[monthYear] || 0) + value;
    }

    return Object.entries(result).map(([monthYear, total]) => ({
      monthYear,
      total,
    }));
  }

  const validateAssignmentInput = (value: string): boolean => {
    const num = parseInt(value);
    return !isNaN(num) && num > 0 && num <= 100 && Number.isInteger(parseFloat(value));
  };

  const handleAssignmentChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setAssignment(numericValue);
  };

  const onReportSubmit = useCallback(async () => {
    if (!assignment || !validateAssignmentInput(assignment)) {
      setError('Por favor, insira um número válido entre 1 e 100.');
      return;
    }

    setIsLoading(true)
    setError('')
    const assignmentCount = Number(assignment)

    try {
      const response = await api.get<ApiResponse>('/contas_receber/ai', {
        params: {
          prompt: `Realize a renegociação de todos os títulos vencidos, considere a renegociação de ${assignmentCount} título${assignmentCount > 1 ? 's' : ''} por dia, somente os títulos vencidos e o inicio da renegociação a data de hoje. Considerar que a nova data de vencimento será de 20 dias a contar da data de cada renegociação. Crie uma tabela e projete um fluxo de caixa com base nas novas datas de vencimento, exibir as seguintes colunas: título, valor, dt de renegociação, dt original vencto, nova dt vencto. Exiba também o novo fluxo de caixa resumido por mês. Apresente apenas a tabela de título de renegociação e o fluxo de caixa.`,
        },
      });

      // Verificar se a resposta é válida
      if (response.status === 200) {
        const data = response.data;

        // Verificar se os dados esperados existem
        if (data && typeof data === 'object') {
          // Garantir que a estrutura está correta
          const apiResponse: ApiResponse = {
            renegotiated_titles: Array.isArray(data.renegotiated_titles) ? data.renegotiated_titles : [],
            cash_flow_summary: Array.isArray(data.cash_flow_summary) ? data.cash_flow_summary : [],
            notes: typeof data.notes === 'string' ? data.notes : 'Processamento concluído.'
          };

          setApiResponse(apiResponse);
        } else {
          throw new Error('Dados inválidos recebidos da API');
        }
      } else {
        throw new Error(`Erro na resposta da API: ${response.status}`);
      }
    } catch (err: any) {
      console.error('Erro ao buscar dados:', err);

      // Tratamento de erros mais específico
      if (err.response) {
        setError(`Erro do servidor: ${err.response.status}. Por favor, tente novamente.`);
      } else if (err.request) {
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        setError(err.message || 'Ocorreu um erro inesperado. Por favor, tente novamente.');
      }
    } finally {
      setIsLoading(false)
    }
  }, [assignment])

  const renderRenegotiatedTitle = useCallback(({ item, index }: { item: RenegotiatedTitle; index: number }) => {
    if (!item || !item.title || !item.value) {
      return null; // Não renderiza se item inválido
    }

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).springify()}
        className="bg-white rounded-lg shadow-sm p-4 mb-3"
      >
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-bold text-gray-800">Título: {item.title || 'N/A'}</Text>
          <Text className="text-base font-semibold text-blue-600">R$ {item.value || '0,00'}</Text>
        </View>
        <View className="flex-row justify-between">
          <View>
            <Text className="text-sm text-gray-600">Data de Renegociação:</Text>
            <Text className="text-sm font-medium text-gray-800">{item.renegotiation_date || 'N/A'}</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-600">Vencimento Original:</Text>
            <Text className="text-sm font-medium text-gray-800">{item.original_due_date || 'N/A'}</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-600">Novo Vencimento:</Text>
            <Text className="text-sm font-medium text-gray-800">{item.new_due_date || 'N/A'}</Text>
          </View>
        </View>
      </Animated.View>
    );
  }, [])

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
            Visualize e simule renegociações.
          </Text>
        </View>

        <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <Text className="text-base font-semibold text-gray-700 mb-2">
            Número de renegociações por dia
          </Text>
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 p-3 text-base text-gray-700 bg-gray-100 rounded-l-lg"
              placeholder="Digite o número (1-100)"
              keyboardType="numeric"
              onChangeText={handleAssignmentChange}
              value={assignment}
              maxLength={3}
            />
            <TouchableOpacity
              onPress={onReportSubmit}
              disabled={isLoading || !assignment || !validateAssignmentInput(assignment)}
              className={`p-3 rounded-r-lg ${isLoading || !assignment || !validateAssignmentInput(assignment) ? 'bg-blue-300' : 'bg-blue-600'}`}
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
                data={apiResponse.renegotiated_titles || []}
                renderItem={renderRenegotiatedTitle}
                keyExtractor={(item, index) => item?.title ? `${item.title}-${item.renegotiation_date}` : `empty-${index}`}
                scrollEnabled={false}
              />
            </View>

            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-800 mb-4">Resumo do Fluxo de Caixa</Text>

              {handleCashFlow(apiResponse.renegotiated_titles).map((summary, index) => (
                <View key={index} className="bg-white rounded-lg shadow-sm p-4 mb-3">
                  <Text className="text-lg font-semibold text-gray-800">{summary.monthYear}</Text>
                  <Text className="text-base text-blue-600 mt-1">
                    Total Renegociado: {summary.total.toLocaleString('pt-br', {
                      currency: 'BRL',
                      style: 'currency',
                    })}
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
