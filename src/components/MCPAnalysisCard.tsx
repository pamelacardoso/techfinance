import { useMCP } from '@/hooks/useMCP';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface MCPAnalysisCardProps {
  data: any[];
  analysisType: 'receivables' | 'cash_flow' | 'sales';
  title?: string;
  onAnalysisComplete?: (result: any) => void;
}

export default function MCPAnalysisCard({
  data,
  analysisType,
  title = 'Análise Inteligente com IA',
  onAnalysisComplete
}: MCPAnalysisCardProps) {
  const {
    analyzeReceivables,
    analyzeCashFlow,
    analyzeSales,
    isLoading,
    error
  } = useMCP();

  const getAnalysisFunction = () => {
    switch (analysisType) {
      case 'receivables':
        return analyzeReceivables;
      case 'cash_flow':
        return analyzeCashFlow;
      case 'sales':
        return analyzeSales;
      default:
        return analyzeReceivables;
    }
  };

  const getAnalysisIcon = () => {
    switch (analysisType) {
      case 'receivables':
        return 'account-balance';
      case 'cash_flow':
        return 'trending-up';
      case 'sales':
        return 'shopping-cart';
      default:
        return 'analytics';
    }
  };

  const getAnalysisDescription = () => {
    switch (analysisType) {
      case 'receivables':
        return 'Análise de contas a receber e inadimplência';
      case 'cash_flow':
        return 'Análise de fluxo de caixa e liquidez';
      case 'sales':
        return 'Análise de vendas e performance';
      default:
        return 'Análise inteligente dos dados';
    }
  };

  const handleAnalysis = async () => {
    if (!data || data.length === 0) {
      Alert.alert('Aviso', 'Nenhum dado disponível para análise');
      return;
    }

    try {
      const analysisFunction = getAnalysisFunction();
      const result = await analysisFunction(data);

      if (result) {
        const message = formatAnalysisResult(result);
        const buttons = [
          { text: 'OK' },
          ...(onAnalysisComplete
            ? [{
                text: 'Ver Detalhes',
                onPress: () => onAnalysisComplete(result)
              }]
            : [])
        ];
        // Garante que todos os textos dos botões são strings simples
        Alert.alert('Análise Inteligente Concluída', message, buttons.map(btn => ({ ...btn, text: String(btn.text) })));
      }    } catch (error) {
      Alert.alert('Erro', 'Falha ao executar análise inteligente');
    }
  };

  const formatAnalysisResult = (result: any) => {
    let message = `Tipo: ${result.analysis_type}\n`;

    switch (analysisType) {
      case 'receivables':
        message += `Total: R$ ${result.total_receivables?.toLocaleString('pt-BR') || 0}\n`;
        message += `Em atraso: ${result.overdue_count || 0} títulos\n`;
        message += `% Inadimplência: ${result.overdue_percentage?.toFixed(2) || 0}%`;
        if (result.recommendations?.length > 0) {
          message += `\n\nRecomendações:\n• ${result.recommendations.slice(0, 2).join('\n• ')}`;
        }
        break;
      case 'cash_flow':
        message += `Entrada: R$ ${result.total_inflow?.toLocaleString('pt-BR') || 0}\n`;
        message += `Saída: R$ ${result.total_outflow?.toLocaleString('pt-BR') || 0}\n`;
        message += `Saldo: R$ ${result.net_flow?.toLocaleString('pt-BR') || 0}\n`;
        message += `Status: ${result.balance_status === 'positive' ? '✅ Positivo' : '❌ Negativo'}`;
        break;
      case 'sales':
        message += `Total: R$ ${result.total_sales?.toLocaleString('pt-BR') || 0}\n`;
        message += `Transações: ${result.total_transactions || 0}\n`;
        message += `Ticket médio: R$ ${result.average_sale?.toLocaleString('pt-BR') || 0}\n`;
        message += `Tendência: ${result.growth_trend || 'N/A'}`;
        break;
    }

    return message;
  };
  return (
    <Animated.View
      entering={FadeIn.springify()}
      className="rounded-xl shadow-lg p-4 mb-4"
      style={{ backgroundColor: '#3b82f6' }}
    >
      <View className="flex-row items-center mb-3">
        <MaterialIcons name={getAnalysisIcon() as any} size={24} color="white" />
        <Text className="text-lg font-bold text-white ml-2">{title}</Text>
      </View>

      <Text className="text-sm mb-4" style={{ color: '#dbeafe' }}>
        {getAnalysisDescription()}
      </Text>

      <TouchableOpacity
        onPress={handleAnalysis}
        disabled={isLoading}
        className="rounded-lg p-3 flex-row items-center justify-center"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />) : (
          <>
            <MaterialIcons name="psychology" size={20} color="white" />
            <Text className="text-white font-medium ml-2">Analisar com IA</Text>
          </>
        )}
      </TouchableOpacity>

      {error && (
        <View
          className="mt-3 border rounded-lg p-3"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderColor: 'rgba(248, 113, 113, 0.3)'
          }}
        >
          <Text style={{ color: '#fecaca' }} className="text-sm">{error}</Text>
        </View>
      )}

      <View className="mt-3 flex-row items-center">
        <MaterialIcons name="info" size={16} color="rgba(255,255,255,0.7)" />
        <Text className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {data?.length || 0} registros disponíveis
        </Text>
      </View>
    </Animated.View>
  );
}
