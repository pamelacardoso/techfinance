import Header from '@/components/header';
import { Product } from '@/models/product';
import { ProductQuerySchema, ProductRepository } from '@/repositories/product.repository';
import { GeminiService } from '@/services/gemini.service';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const productRepository = new ProductRepository();
const geminiService = new GeminiService();

export default function ProductReport() {
  const params = useLocalSearchParams();
  const username = params.usuario || 'Admin';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [insights, setInsights] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query: ProductQuerySchema = {
        nome: '',
        categoria: '',
        limite: 50, // Definindo um limite inicial
      };

      const productData = await productRepository.search(query);
      setProducts(productData);

      const totalCount = productData.length;
      setTotalProducts(totalCount);
    } catch (error) {
      console.error('Erro ao buscar dados de produtos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados de produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getInsights = async () => {
    try {
      const prompt = `Forneça insights sobre os seguintes produtos: Total de Produtos: ${totalProducts} em até 255 caracteres.`;
      await geminiService.sendMessage(prompt);
      const response = geminiService.messages[geminiService.messages.length - 1]?.message || 'Sem resposta';
      setInsights(response);
    } catch (error) {
      console.error('Erro ao obter insights do Gemini:', error);
      Alert.alert('Erro', 'Não foi possível obter insights.');
    }
  };

  const renderProductItem = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 100)}
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{item.nome_porduto}</Text>
            <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{item.descricao_grupo}</Text>
          </View>
          <View
            style={{
              backgroundColor: '#E3F2FD',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 16,
            }}
          >
            <Text style={{ color: '#2196F3', fontWeight: 'bold' }}>{item.codigo}</Text>
          </View>
        </View>

        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 12, color: '#555' }}>
            <MaterialIcons name="inventory" size={16} color="#2196F3" /> ID Produto: {item.id_produto}
          </Text>
          <Text style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
            <MaterialIcons name="category" size={16} color="#2196F3" /> ID Grupo: {item.id_grupo}
          </Text>
        </View>
      </Animated.View>
    ),
    []
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <Header username={username} />
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <Animated.View
          entering={FadeIn}
          style={{
            paddingVertical: 16,
            backgroundColor: 'white',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            borderRadius: 16,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>Relatório de Produtos</Text>
          <Text style={{ color: '#888', marginTop: 4 }}>Veja abaixo os produtos cadastrados</Text>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
              backgroundColor: '#E3F2FD',
              padding: 16,
              borderRadius: 16,
            }}
          >
            <View>
              <Text style={{ fontSize: 14, color: '#2196F3', fontWeight: 'bold' }}>
                <MaterialIcons name="inventory" size={16} color="#2196F3" /> Total de Produtos
              </Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 4 }}>{totalProducts}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={getInsights}
            style={{
              backgroundColor: '#2196F3',
              borderRadius: 16,
              padding: 12,
              marginTop: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons name="insights" size={20} color="white" />
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }}>Obter Insights do Dinho</Text>
          </TouchableOpacity>

          {insights ? (
            <Animated.View
              entering={FadeInDown}
              style={{
                marginTop: 16,
                padding: 16,
                backgroundColor: '#F8F9FA',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#E0E0E0',
              }}
            >
              <Text style={{ color: '#333', fontSize: 14 }}>{insights}</Text>
            </Animated.View>
          ) : null}
        </Animated.View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2196F3" />
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item, index) => `${item.id_produto}-${index}`}  // Modificado para garantir chave única
            contentContainerStyle={{ paddingVertical: 8 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 32 }}>
                <MaterialIcons name="inventory" size={48} color="#E0E0E0" />
                <Text style={{ color: '#888', marginTop: 16 }}>Nenhum produto encontrado.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}
