import Header from '@/components/header';
import MCPAnalysisCard from '@/components/MCPAnalysisCard';
import MCPContextManager from '@/components/MCPContextManager';
import { useMCP } from '@/hooks/useMCP';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function MCPDashboard() {
    const params = useLocalSearchParams();
    const username = Array.isArray(params.usuario)
        ? params.usuario[0] || 'Admin'
        : params.usuario || 'Admin';
    const [showContextManager, setShowContextManager] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [sampleData, setSampleData] = useState<{
        receivables: any[];
        cashFlow: any[];
        sales: any[];
    }>({
        receivables: [],
        cashFlow: [],
        sales: []
    });

    const {
        contexts,
        loadContexts,
        generateReport,
        isLoading,
        error,
        clearError
    } = useMCP();

    useEffect(() => {
        loadContexts();
        loadSampleData();
    }, []);

    const loadSampleData = () => {
        setSampleData({
            receivables: [
                { id: 'T001', amount: 5000, due_date: '2024-11-01', status: 'overdue' },
                { id: 'T002', amount: 3000, due_date: '2024-12-15', status: 'pending' },
                { id: 'T003', amount: 2500, due_date: '2024-10-20', status: 'overdue' },
            ],
            cashFlow: [
                { date: '2024-12-01', inflow: 10000, outflow: 8000 },
                { date: '2024-12-02', inflow: 12000, outflow: 9000 },
                { date: '2024-12-03', inflow: 8000, outflow: 7500 },
            ],
            sales: [
                { id: 1, amount: 1500, date: '2024-12-01', customer: 'Cliente A' },
                { id: 2, amount: 2000, date: '2024-12-02', customer: 'Cliente B' },
                { id: 3, amount: 1200, date: '2024-12-03', customer: 'Cliente C' },
            ]
        });
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadContexts();
        loadSampleData();
        setRefreshing(false);
    };

    const handleAnalysisComplete = (result: any) => {
        console.log('Análise completa:', result);
    };

    const generateFullReport = async () => {
        try {
            const report = await generateReport('financial_summary', 'json');
            if (report) {
                Alert.alert(
                    'Relatório Gerado',
                    'Relatório financeiro completo gerado com sucesso',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            Alert.alert('Erro', 'Falha ao gerar relatório');
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <Header username={username} />
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <Animated.View
                    entering={FadeIn.delay(200).springify()}
                    className="bg-primary-600 p-6"
                    style={{ backgroundColor: '#2563eb' }}
                >
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-3xl font-bold text-white">Análises Inteligentes</Text>
                            <Text className="text-primary-100 mt-1" style={{ color: '#dbeafe' }}>
                                Análises Financeiras com Inteligência Artificial
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setShowContextManager(true)}
                            className="bg-white rounded-lg p-3"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                        >
                            <MaterialIcons name="settings" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View className="mt-4 flex-row justify-between">
                        <View
                            className="rounded-lg p-3 flex-1 mr-2"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                        >
                            <Text className="text-white text-lg font-bold">{contexts.length}</Text>
                            <Text className="text-sm" style={{ color: '#dbeafe' }}>Análises Salvas</Text>
                        </View>
                        <View
                            className="rounded-lg p-3 flex-1 ml-2"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                        >
                            <Text className="text-white text-lg font-bold">
                                {sampleData.receivables.length + sampleData.sales.length}
                            </Text>
                            <Text className="text-sm" style={{ color: '#dbeafe' }}>Registros</Text>
                        </View>
                    </View>
                </Animated.View>

                <View className="p-4">
                    {/* Error Display */}
                    {error && (
                        <Animated.View
                            entering={FadeIn.springify()}
                            className="bg-red-100 border border-red-400 rounded-lg p-4 mb-4"
                        >
                            <View className="flex-row justify-between items-center">
                                <Text className="text-red-700 flex-1">{error}</Text>
                                <TouchableOpacity onPress={clearError}>
                                    <MaterialIcons name="close" size={20} color="#DC2626" />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    )}

                    {/* Quick Actions */}
                    <Animated.View
                        entering={FadeInDown.delay(300).springify()}
                        className="bg-white rounded-xl shadow-sm p-4 mb-6"
                    >
                        <Text className="text-lg font-bold text-gray-800 mb-4">Ações Rápidas</Text>
                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                onPress={() => setShowContextManager(true)}
                                className="flex-1 bg-blue-600 rounded-lg p-3 flex-row items-center justify-center"
                            >
                                <MaterialIcons name="folder" size={20} color="white" />
                                <Text className="text-white font-medium ml-2">Análises Salvas</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={generateFullReport}
                                disabled={isLoading}
                                className="flex-1 bg-green-600 rounded-lg p-3 flex-row items-center justify-center"
                            >
                                <MaterialIcons name="assessment" size={20} color="white" />
                                <Text className="text-white font-medium ml-2">Gerar Relatório</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                    {/* Analysis Cards */}
                    <Animated.View entering={FadeInDown.delay(400).springify()}>
                        <Text className="text-xl font-bold text-gray-800 mb-4">Análises Inteligentes Disponíveis</Text>

                        <MCPAnalysisCard
                            data={sampleData.receivables}
                            analysisType="receivables"
                            title="📊 Contas a Receber"
                            onAnalysisComplete={handleAnalysisComplete}
                        />

                        <MCPAnalysisCard
                            data={sampleData.cashFlow}
                            analysisType="cash_flow"
                            title="💰 Fluxo de Caixa"
                            onAnalysisComplete={handleAnalysisComplete}
                        />

                        <MCPAnalysisCard
                            data={sampleData.sales}
                            analysisType="sales"
                            title="🛒 Vendas"
                            onAnalysisComplete={handleAnalysisComplete}
                        />
                    </Animated.View>
                    {/* Active Contexts */}
                    {contexts.length > 0 && (
                        <Animated.View
                            entering={FadeInDown.delay(500).springify()}
                            className="bg-white rounded-xl shadow-sm p-4 mb-6"
                        >
                            <Text className="text-lg font-bold text-gray-800 mb-4">Análises Recentes</Text>
                            {contexts.slice(0, 3).map((context, index) => (
                                <View
                                    key={context.id}
                                    className="border-l-4 border-purple-500 bg-purple-50 rounded-r-lg p-3 mb-3"
                                >
                                    <Text className="font-medium text-gray-800">{context.name}</Text>
                                    <Text className="text-sm text-gray-600 mt-1">{context.description}</Text>
                                    <Text className="text-xs text-purple-600 mt-2">
                                        {new Date(context.createdAt).toLocaleDateString('pt-BR')}
                                    </Text>
                                </View>
                            ))}
                        </Animated.View>
                    )}
                    {/* Info Section */}
                    <Animated.View
                        entering={FadeInDown.delay(600).springify()}
                        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
                    >
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons name="info" size={20} color="#3B82F6" />
                            <Text className="text-blue-800 font-medium ml-2">Sobre as Análises Inteligentes</Text>
                        </View>
                        <Text className="text-blue-700 text-sm">
                            Nossa tecnologia de Inteligência Artificial permite análises avançadas e contextualização
                            de dados financeiros. Use as análises salvas para manter histórico entre consultas e
                            obter insights mais precisos sobre seu negócio.
                        </Text>
                    </Animated.View>
                </View>
            </ScrollView>

            {/* Context Manager Modal */}
            <MCPContextManager
                visible={showContextManager}
                onClose={() => setShowContextManager(false)}
                onContextSelected={(contextId) => {
                    console.log('Contexto selecionado:', contextId);
                    setShowContextManager(false);
                }}
            />
        </View>
    );
}
