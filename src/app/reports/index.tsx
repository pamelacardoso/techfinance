import Header from '@/components/header';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

interface ReportItemProps {
    title: string;
    icon: string;
    onPress: () => void;
}

const ReportItem: React.FC<ReportItemProps> = ({ title, icon, onPress }) => (
    <TouchableOpacity onPress={onPress} className="flex-1 m-2">
        <View className="bg-blue-500 rounded-lg p-6 items-center justify-center">
            <MaterialIcons name={icon as keyof typeof MaterialIcons.glyphMap} size={40} color="white" />
            <Text className="text-white text-lg font-bold mt-2">{title}</Text>
        </View>
    </TouchableOpacity>
);

export default function ReportsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const username = params.usuario || 'User';

    const reports = [
        { title: 'Top 10 Vendas \n Insights em $', icon: 'bar-chart', onPress: () => router.push('/reports/sales') },
        { title: 'Top 10 Vendas \n Insights em Qtd.', icon: 'bar-chart', onPress: () => router.push('/reports/sales-by-qtd') },
        { title: 'Preço min-max \n    variação', icon: 'auto-graph', onPress: () => router.push('/reports/sales-min-max') },
        { title: 'Participação de Clientes - Qtde.', icon: 'people', onPress: () => router.push('/reports/customers') },
        { title: 'Participação de Clientes - $', icon: 'shopping-bag', onPress: () => router.push('/reports/customers-by-value') },
        { title: 'Renegociação de Títulos', icon: 'assignment', onPress: () => router.push('/reports/assignments') },
    ];

    return (
        <View className="flex-1 bg-gray-50">
            <Header username={username} />
            <View className="flex-1 px-2">
                <View className="p-4">
                    <Text className="text-2xl font-bold text-gray-800">Relatórios</Text>
                    <Text className="text-gray-500 mt-1">Escolha um relatório para visualizar</Text>
                </View>
                <FlatList
                    data={reports}
                    renderItem={({ item }) => <ReportItem {...item} />}
                    keyExtractor={(item) => item.title}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    contentContainerStyle={{ paddingBottom: 16 }}
                />
            </View>
        </View>
    );
}
