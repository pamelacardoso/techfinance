import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View, Modal, Button } from 'react-native';
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
  total: number;
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
  const [viewByClient, setViewByClient] = useState(false);
  const [viewByProduct, setViewByProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<Produto | Cliente | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const mockClientes: Cliente[] = [
    { id_cliente: 'C001', nome_cliente: 'Cliente A', razao_cliente: 'Razão A', cidade: 'São Paulo', uf: 'SP', total: 2582 },
    { id_cliente: 'C002', nome_cliente: 'Cliente B', razao_cliente: 'Razão B', cidade: 'Rio de Janeiro', uf: 'RJ', total: 2250 },
    { id_cliente: 'C003', nome_cliente: 'Cliente C', razao_cliente: 'Razão C', cidade: 'Belo Horizonte', uf: 'MG', total: 1201 },
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

  const filteredProdutos = produtos.filter(
    (produto) =>
      produto.nome_produto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      produto.id_produto.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nome_cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente.id_cliente.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (item: Produto | Cliente) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalVisible(false);
  };

  const getVendasByProduto = (produto: Produto) => {
    return vendas.filter((venda) => venda.codigo_produto === produto.id_produto);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Header username="User" />

      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800">Vendas</Text>
        <Text className="text-gray-500 mt-1">
          {viewByClient ? 'Vendas por Cliente' : viewByProduct ? 'Vendas por Produto' : 'Selecione uma visualização'}
        </Text>
      </View>

      <View className="flex-row justify-between p-4">
        <TouchableOpacity
          onPress={() => {
            setViewByProduct(true);
            setViewByClient(false);
          }}
          className={`px-4 py-2 rounded-lg ${viewByProduct ? 'bg-blue-500' : 'bg-gray-300'}`}
        >
          <Text className={`text-white ${viewByProduct ? 'font-bold' : ''}`}>Por Produto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setViewByClient(true);
            setViewByProduct(false);
          }}
          className={`px-4 py-2 rounded-lg ${viewByClient ? 'bg-blue-500' : 'bg-gray-300'}`}
        >
          <Text className={`text-white ${viewByClient ? 'font-bold' : ''}`}>Por Cliente</Text>
        </TouchableOpacity>
      </View>

      {viewByProduct && (
        <View className="p-4">
          <View className="flex-row items-center mb-4">
            <TextInput
              className="flex-1 py-3 px-4 rounded-lg border border-gray-300/60"
              placeholder="Digite o nome ou ID do produto"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={() => {}} className="bg-blue-500 p-3 rounded-lg ml-2">
              <MaterialIcons name="search" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredProdutos}
            renderItem={({ item }) => (
              <TouchableOpacity className="p-4 mb-2 bg-blue-500 rounded-lg shadow-md" onPress={() => openModal(item)}>
                <Text className="text-white text-lg font-bold">{item.nome_produto}</Text>
                <Text className="text-white">{item.id_produto}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id_produto}
            ListEmptyComponent={<Text className="text-gray-500 text-center mt-4">Produto não encontrado.</Text>}
          />
        </View>
      )}

      {viewByClient && (
        <View className="p-4">
          <View className="flex-row items-center mb-4">
            <TextInput
              className="flex-1 py-3 px-4 rounded-lg border border-gray-300/60"
              placeholder="Digite o nome ou ID do cliente"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={() => {}} className="bg-blue-500 p-3 rounded-lg ml-2">
              <MaterialIcons name="search" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredClientes}
            renderItem={({ item }) => (
              <TouchableOpacity className="p-4 mb-2 bg-blue-500 rounded-lg shadow-md" onPress={() => openModal(item)}>
                <Text className="text-white text-lg font-bold">{item.nome_cliente}</Text>
                <Text className="text-white">{item.id_cliente}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id_cliente}
            ListEmptyComponent={<Text className="text-gray-500 text-center mt-4">Cliente não encontrado.</Text>}
          />
        </View>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-3/4">
            {selectedItem && (
              <>
                <Text className="text-lg font-bold mb-2">
                  {viewByProduct ? (selectedItem as Produto).nome_produto : (selectedItem as Cliente).nome_cliente}
                </Text>
                {viewByProduct ? (
                  <>
                    <Text>ID Produto: {(selectedItem as Produto).id_produto}</Text>
                    {getVendasByProduto(selectedItem as Produto).map((venda, index) => (
                      <View key={index} className="mt-2">
                        <Text>Quantidade: {venda.qtde}</Text>
                        <Text>Total em vendas: {venda.total}</Text>
                        <Text>Código do Produto: {venda.codigo_produto}</Text>
                      </View>
                    ))}
                  </>
                ) : (
                  <>
                    <Text>ID Cliente: {(selectedItem as Cliente).id_cliente}</Text>
                    <Text>Razão Social: {(selectedItem as Cliente).razao_cliente}</Text>
                    <Text>Cidade: {(selectedItem as Cliente).cidade}</Text>
                    <Text>UF: {(selectedItem as Cliente).uf}</Text>
                    <Text>Total em vendas: {(selectedItem as Cliente).total}</Text>
                  </>
                )}
              </>
            )}
            <Button title="Fechar" onPress={closeModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
