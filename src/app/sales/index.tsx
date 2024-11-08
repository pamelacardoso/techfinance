import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '@/components/header';

interface Produto {
  id_produto: string;
  nome_produto: string;
}

interface Cliente {
  id_cliente: string;
  nome_cliente: string;
  razao_cliente: string;
  cidade: string;
  uf: string;
}

interface Venda {
  id_cliente: string;
  razao_cliente: string;
  cidade: string;
  uf: string;
  codigo_produto: string;
  id_grupo_produto: string;
  qtde: number;
  total: number;
  nome_produto: string;
}

export default function VendasScreen() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [viewByClient, setViewByClient] = useState(false); // Estado para alternar visualização por cliente
  const [viewByProduct, setViewByProduct] = useState(false); // Estado para alternar visualização por produto
  const [searchQuery, setSearchQuery] = useState(''); // Filtro de busca
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null); // Cliente selecionado
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null); // Produto selecionado

  const router = useRouter();

  // Mock de dados (substitua com os dados reais do banco)
  const mockClientes: Cliente[] = [
    { id_cliente: 'C001', nome_cliente: 'Cliente A', razao_cliente: 'Razão A', cidade: 'São Paulo', uf: 'SP' },
    { id_cliente: 'C002', nome_cliente: 'Cliente B', razao_cliente: 'Razão B', cidade: 'Rio de Janeiro', uf: 'RJ' },
    { id_cliente: 'C003', nome_cliente: 'Cliente C', razao_cliente: 'Razão C', cidade: 'Belo Horizonte', uf: 'MG' },
  ];

  const mockProdutos: Produto[] = [
    { id_produto: 'P001', nome_produto: 'Smartphone XYZ' },
    { id_produto: 'P002', nome_produto: 'Notebook ABC' },
    { id_produto: 'P003', nome_produto: 'Camisa Polo' },
  ];

  const mockVendas: Venda[] = [
    { id_cliente: 'C001', razao_cliente: 'Razão A', cidade: 'São Paulo', uf: 'SP', codigo_produto: 'P001', id_grupo_produto: 'EL', qtde: 5, total: 5000, nome_produto: 'Smartphone XYZ' },
    { id_cliente: 'C002', razao_cliente: 'Razão B', cidade: 'Rio de Janeiro', uf: 'RJ', codigo_produto: 'P002', id_grupo_produto: 'EL', qtde: 3, total: 12000, nome_produto: 'Notebook ABC' },
    { id_cliente: 'C003', razao_cliente: 'Razão C', cidade: 'Belo Horizonte', uf: 'MG', codigo_produto: 'P003', id_grupo_produto: 'VS', qtde: 2, total: 200, nome_produto: 'Camisa Polo' },
  ];

  useEffect(() => {
    setClientes(mockClientes);
    setProdutos(mockProdutos);
    setVendas(mockVendas);
  }, []);

  // Filtro de produtos
  const filteredProdutos = produtos.filter(
    (produto) =>
      produto.nome_produto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      produto.id_produto.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtro de clientes
  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nome_cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente.id_cliente.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProdutoItem = ({ item }: { item: Produto }) => (
    <TouchableOpacity
      onPress={() => router.push(`/vendas/produto/${item.id_produto}`)} // Navegação para os detalhes do produto
      className="p-4 mb-2 bg-blue-500 rounded-lg shadow-md"
    >
      <Text className="text-white text-lg font-bold">{item.nome_produto}</Text>
      <Text className="text-white">{item.id_produto}</Text>
    </TouchableOpacity>
  );

  const renderClienteItem = ({ item }: { item: Cliente }) => (
    <TouchableOpacity
      onPress={() => router.push(`/vendas/cliente/${item.id_cliente}`)} // Navegação para os detalhes do cliente
      className="p-4 mb-2 bg-blue-500 rounded-lg shadow-md"
    >
      <Text className="text-white text-lg font-bold">{item.nome_cliente}</Text>
      <Text className="text-white">{item.id_cliente}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <Header username="User" />

      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800">Vendas</Text>
        <Text className="text-gray-500 mt-1">
          {viewByClient
            ? 'Vendas por Cliente'
            : viewByProduct
            ? 'Vendas por Produto'
            : 'Selecione uma visualização'}
        </Text>
      </View>

      <View className="flex-row justify-between p-4">
        <TouchableOpacity
          onPress={() => setViewByProduct(true)}
          className={`px-4 py-2 rounded-lg ${viewByProduct ? 'bg-blue-500' : 'bg-gray-300'}`}
        >
          <Text className={`text-white ${viewByProduct ? 'font-bold' : ''}`}>Por Produto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setViewByClient(true)}
          className={`px-4 py-2 rounded-lg ${viewByClient ? 'bg-blue-500' : 'bg-gray-300'}`}
        >
          <Text className={`text-white ${viewByClient ? 'font-bold' : ''}`}>Por Cliente</Text>
        </TouchableOpacity>
      </View>

      {viewByProduct && (
        <View className="p-4">
          <TextInput
            className="py-3 px-4 rounded-lg border border-gray-300/60 mb-4"
            placeholder="Digite o nome ou ID do produto"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FlatList
            data={filteredProdutos}
            renderItem={renderProdutoItem}
            keyExtractor={(item) => item.id_produto}
          />
        </View>
      )}

      {viewByClient && (
        <View className="p-4">
          <TextInput
            className="py-3 px-4 rounded-lg border border-gray-300/60 mb-4"
            placeholder="Digite o nome ou ID do cliente"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FlatList
            data={filteredClientes}
            renderItem={renderClienteItem}
            keyExtractor={(item) => item.id_cliente}
          />
        </View>
      )}
    </View>
  );
}
