import Header from '@/components/header';
import { Customer } from '@/models/customer';
import { CustomerRepository } from '@/repositories/customer.repository';
import { MaterialIcons } from '@expo/vector-icons'; // Adicionando Material Icons
import { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CustomerReports() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const customerRepository = new CustomerRepository();

  const fetchCustomerReports = useCallback(async () => {
    try {
      setLoading(true);
      const results = await customerRepository.search({ limite: 50 }); // Ajuste o limite conforme necessário
      setCustomers(results);
    } catch (error) {
      console.error('Erro ao buscar relatórios de clientes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomerReports();
  }, [fetchCustomerReports]);

  const renderCustomerItem = useCallback(
    ({ item, index }: { item: Customer; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 50)}
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
            <MaterialIcons name="business" size={20} color="#2196F3" /> {item.razao_cliente}
          </Text>
          <Text style={{ marginTop: 4, fontSize: 14, color: '#555' }}>
            <MaterialIcons name="business-center" size={16} color="#2196F3" /> Nome Fantasia: {item.nome_fantasia}
          </Text>
          <Text style={{ fontSize: 14, color: '#555' }}>
            <MaterialIcons name="location-on" size={16} color="#2196F3" /> Localização: {item.cidade}, {item.uf}
          </Text>
        </View>
      </Animated.View>
    ),
    []
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <Header username="Admin" />
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 16 }}>
          Relatórios de Clientes
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="#2196F3" />
        ) : (
          <FlatList
            data={customers}
            renderItem={renderCustomerItem}
            keyExtractor={(item) => item.id_cliente.toString()}
            contentContainerStyle={{ paddingBottom: 16 }}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', color: '#666', marginTop: 32 }}>
                Nenhum cliente encontrado.
              </Text>
            }
          />
        )}
      </View>
    </View>
  );
}
