import { useEffect, useCallback, useState } from 'react';
import Header from '@/components/header';
import { CustomerRepository } from '@/repositories/customer.repository';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// Tipos das respostas da API
interface ResumoTitulo {
  nome_fantasia: string;
  data_vencimento: string;
  dias_vencidos: number;
}

interface ResumoFinanceiro {
  total_recebido: string;
  saldo: string;
  parcelas: string[];
}

interface ApiResponse {
  clientesVencidos: ResumoTitulo[];
  resumoTitulos: ResumoFinanceiro;
}

const customerRepository = new CustomerRepository();  // Instanciando o repositório

export default function TituloScreen() {
  const params = useLocalSearchParams();
  const username = params.usuario || 'Admin';

  const [clientesVencidos, setClientesVencidos] = useState<ResumoTitulo[]>([]);
  const [resumoTitulos, setResumoTitulos] = useState<ResumoFinanceiro | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Função para buscar os dados
  const fetchResumo = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await customerRepository.fetchResumo();

      console.log(response)
      
      if (response) {
        setClientesVencidos(response.clientesVencidos || []);
        setResumoTitulos(response.resumoTitulos || null);
      } else {
        throw new Error('Dados não encontrados');
      }
    } catch (err) {
      setError('Ocorreu um erro ao buscar os dados. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumo();
  }, []);

  // Função para renderizar cada item da lista de clientes vencidos
  const renderClienteVencido = ({ item, index }: { item: ResumoTitulo; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()} className="bg-white rounded-lg shadow-sm p-4 mb-3">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-bold text-gray-800">{item.nome_fantasia}</Text>
        <Text className="text-base font-semibold text-blue-600">{item.dias_vencidos} dias</Text>
      </View>
      <View className="flex-row justify-between">
        <View>
          <Text className="text-sm text-gray-600">Data de Vencimento:</Text>
          <Text className="text-sm font-medium text-gray-800">{item.data_vencimento}</Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <Header username={username} />
      <Animated.ScrollView entering={FadeIn.delay(200).springify()} className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          <Text className="text-3xl font-bold text-gray-800">Resumo dos Títulos</Text>
          <Text className="text-lg text-gray-600 mt-2">Visualize os títulos vencidos e os resumos financeiros.</Text>
        </View>

        <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : error ? (
            <View className="bg-red-100 border border-red-400 rounded-lg p-4 mb-6">
              <Text className="text-red-700">{error}</Text>
            </View>
          ) : (
            <>
              {/* Exibição dos clientes vencidos */}
              <View className="mb-6">
                <Text className="text-xl font-bold text-gray-800 mb-4">Clientes Vencidos</Text>
                <FlatList
                  data={clientesVencidos}
                  renderItem={renderClienteVencido}
                  keyExtractor={(item) => `${item.nome_fantasia}-${item.data_vencimento}`}
                  scrollEnabled={false}
                />
              </View>

              {/* Exibição do resumo financeiro */}
              {resumoTitulos && (
                <View className="mb-6">
                  <Text className="text-xl font-bold text-gray-800 mb-4">Resumo Financeiro</Text>
                  <View className="bg-white rounded-lg shadow-sm p-4 mb-3">
                    <Text className="text-lg font-semibold text-gray-800">Total Recebido: R$ {resumoTitulos.total_recebido}</Text>
                    <Text className="text-lg font-semibold text-gray-800">Saldo: R$ {resumoTitulos.saldo}</Text>
                    <Text className="text-lg font-semibold text-gray-800">Parcelas:</Text>
                    {resumoTitulos.parcelas.map((parcela, index) => (
                      <Text key={index} className="text-base text-gray-600">{parcela}</Text>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}
