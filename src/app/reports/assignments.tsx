import Header from '@/components/header'
import MCPContextManager from '@/components/MCPContextManager'
import { useMCP } from '@/hooks/useMCP'
import { api } from '@/lib/api'
import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
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
  const [showMCPManager, setShowMCPManager] = useState(false)
  const [currentContextId, setCurrentContextId] = useState<string | null>(null)

  // Hook MCP
  const {
    analyzeReceivables,
    createRenegotiationContext,
    getRenegotiationPrompt,
    isLoading: mcpLoading,
    error: mcpError
  } = useMCP()

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

  // Funções MCP
  const analyzeWithMCP = useCallback(async () => {
    if (!apiResponse?.renegotiated_titles || apiResponse.renegotiated_titles.length === 0) {
      Alert.alert('Aviso', 'Execute uma análise primeiro para usar as funcionalidades inteligentes');
      return;
    }

    try {
      // Converter dados para formato MCP
      const mcpData = apiResponse.renegotiated_titles.map(title => ({
        id: title.title,
        amount: parseValueSafely(title.value),
        due_date: title.original_due_date,
        renegotiation_date: title.renegotiation_date,
        new_due_date: title.new_due_date,
        status: 'renegotiated'
      }));

      // Executar análise MCP
      const analysis = await analyzeReceivables(mcpData);

      if (analysis) {
        Alert.alert(
          'Análise Inteligente Concluída',
          `Tipo: ${analysis.analysis_type}\n` +
          `Total: R$ ${analysis.total_receivables?.toLocaleString('pt-BR')}\n` +
          `Em atraso: ${analysis.overdue_count} títulos\n` +
          `% Inadimplência: ${analysis.overdue_percentage?.toFixed(2)}%`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao executar análise inteligente');
    }
  }, [apiResponse, analyzeReceivables]);

  const createMCPContext = useCallback(async () => {
    if (!apiResponse?.renegotiated_titles || apiResponse.renegotiated_titles.length === 0) {
      Alert.alert('Aviso', 'Execute uma análise primeiro para criar uma análise salva');
      return;
    }

    try {
      const criteria = {
        maxRenegotiationDays: parseInt(assignment) || 1,
        priorityByAmount: true,
        baseDate: new Date().toISOString()
      };

      const context = await createRenegotiationContext(apiResponse.renegotiated_titles, criteria);

      if (context) {
        setCurrentContextId(context.id);
        Alert.alert('Sucesso', `Análise salva: ${context.name}`);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar análise');
    }
  }, [apiResponse, assignment, createRenegotiationContext]);

  const generateMCPPrompt = useCallback(async () => {
    if (!apiResponse?.renegotiated_titles || apiResponse.renegotiated_titles.length === 0) {
      Alert.alert('Aviso', 'Execute uma análise primeiro para gerar um prompt');
      return;
    }

    try {
      const criteria = {
        maxRenegotiationDays: parseInt(assignment) || 1,
        priorityByAmount: true
      };

      const prompt = await getRenegotiationPrompt(
        apiResponse.renegotiated_titles,
        criteria,
        new Date().toISOString()
      );

      if (prompt) {
        Alert.alert(
          'Prompt Inteligente Gerado',
          prompt.substring(0, 200) + '...',
          [
            { text: 'Fechar' },
            { text: 'Copiar', onPress: () => {
              // Em uma implementação real, você copiaria para o clipboard
              Alert.alert('Info', 'Prompt copiado (funcionalidade mock)');
            }}
          ]
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao gerar prompt inteligente');
    }
  }, [apiResponse, assignment, getRenegotiationPrompt]);

  const handleContextSelected = useCallback((contextId: string) => {
    setCurrentContextId(contextId);
    Alert.alert('Sucesso', 'Análise selecionada para esta renegociação');
  }, []);

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
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-3xl font-bold text-gray-800">Renegociação de Títulos</Text>
              <Text className="text-lg text-gray-600 mt-2">
                Visualize e simule renegociações.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowMCPManager(true)}
              className="p-3 bg-purple-600 rounded-lg"
            >
              <MaterialIcons name="settings" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {currentContextId && (
            <View className="bg-purple-100 border border-purple-200 rounded-lg p-3 mt-4">
              <Text className="text-purple-800 font-medium">
                📊 Contexto MCP ativo: {currentContextId.slice(0, 8)}...
              </Text>
            </View>
          )}
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

        {/* MCP Actions Section */}
        {apiResponse && (
          <Animated.View
            entering={FadeIn.delay(300).springify()}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-sm p-4 mb-6"
          >
            <Text className="text-lg font-bold text-white mb-3">🤖 Análises Inteligentes (MCP)</Text>
            <View className="space-y-3">
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={analyzeWithMCP}
                  disabled={mcpLoading}
                  className="flex-1 bg-white/20 backdrop-blur rounded-lg p-3 flex-row items-center justify-center"
                >
                  {mcpLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <MaterialIcons name="analytics" size={20} color="white" />
                      <Text className="text-white font-medium ml-2">Analisar com IA</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={createMCPContext}
                  disabled={mcpLoading}
                  className="flex-1 bg-white/20 backdrop-blur rounded-lg p-3 flex-row items-center justify-center"
                >
                  {mcpLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <MaterialIcons name="folder" size={20} color="white" />
                      <Text className="text-white font-medium ml-2">Salvar Análise</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={generateMCPPrompt}
                disabled={mcpLoading}
                className="bg-white/20 backdrop-blur rounded-lg p-3 flex-row items-center justify-center"
              >
                {mcpLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="chat" size={20} color="white" />
                    <Text className="text-white font-medium ml-2">Gerar Prompt Inteligente</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {mcpError && (
              <View className="mt-3 bg-red-500/20 border border-red-300/30 rounded-lg p-3">
                <Text className="text-red-100 text-sm">{mcpError}</Text>
              </View>
            )}
          </Animated.View>
        )}
      </Animated.ScrollView>

      {showMCPManager && (
        <MCPContextManager
          visible={showMCPManager}
          onClose={() => setShowMCPManager(false)}
          onContextSelected={handleContextSelected}
        />
      )}
    </View>
  )
}
