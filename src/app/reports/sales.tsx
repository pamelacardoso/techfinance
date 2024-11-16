import Header from '@/components/header';
import { Sales } from '@/models/sales';
import { SalesQuerySchema, SalesRepository } from '@/repositories/sales.repository';
import { GeminiService } from '@/services/gemini.service';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';

const salesRepository = new SalesRepository();
const geminiService = new GeminiService();

export default function SalesReport() {
    const params = useLocalSearchParams();
    const username = params.usuario || 'Admin';

    const [sales, setSales] = useState<Sales[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalSales, setTotalSales] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [startDate, setStartDate] = useState('');
    const [insights, setInsights] = useState('');

    useEffect(() => {
        const fetchSales = async () => {
            setLoading(true);
            try {
                const query: SalesQuerySchema = {
                    dataEmissao: startDate,
                };

                const salesData = await salesRepository.getSales(query);
                setSales(salesData);

                // Cálculo do total de vendas e valores
                const totalSalesCount = salesData.length;
                const totalSalesValue = salesData.reduce((acc, sale) => acc + parseFloat(sale.total || '0'), 0);

                setTotalSales(totalSalesCount);
                setTotalValue(totalSalesValue);
            } catch (error) {
                console.error('Erro ao buscar dados de vendas:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSales();
    }, [startDate]);

    const renderSalesItem = ({ item }: { item: Sales }) => (
        <View className="bg-white rounded-lg shadow-md p-4 mb-4">
            <Text className="font-bold text-gray-800">{item.descricaoProduto}</Text>
            <Text className="text-sm text-gray-600">{item.nomeFantasia}</Text>
            <Text className="text-sm text-gray-600">{item.razaoCliente}</Text>
            <Text className="text-sm text-gray-600">{item.cidade}, {item.uf}</Text>
            <Text className="text-sm text-gray-600">Quantidade: {item.qtde}</Text>
            <Text className="text-sm text-gray-600">Valor Unitário: R$ {item.valorUnitario}</Text>
            <Text className="text-sm text-gray-600">Total: R$ {item.total}</Text>
        </View>
    );

    const getInsights = async () => {
        try {
            const prompt = `Forneça insights sobre as seguintes vendas: Total de Vendas: ${totalSales}, Valor Total: R$ ${totalValue.toFixed(2)} em até 255 caracteres.`;
            await geminiService.sendMessage(prompt);
            const response = geminiService.messages[geminiService.messages.length - 1].message;
            setInsights(response);
        } catch (error) {
            console.error('Erro ao obter insights do Gemini:', error);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <Header username={username} />
            <View className="flex-1 px-2">
                <View className="p-4">
                    <Text className="text-2xl font-bold text-gray-800">Relatório de Vendas</Text>
                    <Text className="text-gray-500 mt-1">Veja abaixo as vendas realizadas</Text>
                    <View className="mt-4">
                        <Text className="text-lg font-bold text-gray-800">Visão Geral</Text>
                        <Text className="text-sm text-gray-600">Total de Vendas: {totalSales}</Text>
                        <Text className="text-sm text-gray-600">Valor Total: R$ {totalValue.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={getInsights}
                        className="bg-blue-600 rounded-lg p-3 mt-4 flex-row items-center justify-center"
                    >
                        <Text className="text-white text-center ml-2">Obter Insights do Gemini</Text>
                    </TouchableOpacity>
                    {insights ? (
                        <View className="mt-4 p-4 bg-gray-100 rounded-lg">
                            <Text className="text-gray-800">{insights}</Text>
                        </View>
                    ) : null}
                </View>
                <View className="px-4 py-2">
                    <Text className="text-lg font-bold text-gray-800 mb-2">Filtrar por Data</Text>
                    <View className="flex-row space-x-4">
                        <TextInput
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-white"
                            placeholder="Data de Emissão (YYYY-MM-DD)"
                            value={startDate}
                            onChangeText={setStartDate}
                        />
                    </View>
                </View>
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <FlatList
                        data={sales}
                        renderItem={renderSalesItem}
                        keyExtractor={(item) => item.idVenda.toString()}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={
                            <Text className="text-center text-gray-500 mt-4">Nenhuma venda encontrada.</Text>
                        }
                    />
                )}
            </View>
        </View>
    );
}
