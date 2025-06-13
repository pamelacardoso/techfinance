import Header from '@/components/header';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

interface ReportItemProps {
    title: string;
    icon: string;
    onPress: () => void;
}

const ReportItem: React.FC<ReportItemProps> = ({ title, icon, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        className="flex-1 m-1 sm:m-2 min-w-[140px] max-w-[200px]"
        accessibilityRole="button"
        accessibilityLabel={title}
        activeOpacity={0.7}
    >
        <View className="bg-blue-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 items-center justify-center min-h-[120px] sm:min-h-[140px] lg:min-h-[160px]">
            <MaterialIcons
                name={icon as keyof typeof MaterialIcons.glyphMap}
                size={32}
                color="white"
                className="sm:text-4xl lg:text-5xl"
            />
            <Text className="text-white text-sm sm:text-base lg:text-lg font-bold mt-2 sm:mt-3 text-center leading-tight" numberOfLines={3}>
                {title}
            </Text>
        </View>
    </TouchableOpacity>
);

export default function ReportsScreen() {
    const params = useLocalSearchParams();
    const username = Array.isArray(params.usuario) ? params.usuario[0] : params.usuario || 'User';

    const handleNavigation = (route: string) => {
        router.push(route as any);
    };

    const reports = [
        { title: 'Top 10 Produtos \nem $', icon: 'bar-chart', onPress: () => handleNavigation('/reports/sales') },
        { title: 'Top 10 Produtos \nem Qtde.', icon: 'bar-chart', onPress: () => handleNavigation('/reports/sales-by-qtd') },
        { title: 'Top 10 Clientes \nem $', icon: 'people', onPress: () => handleNavigation('/reports/customers-by-value') },
        { title: 'Top 10 Clientes \nem Qtde.', icon: 'people', onPress: () => handleNavigation('/reports/customers') },
        { title: 'Variação preços \n min-max', icon: 'auto-graph', onPress: () => handleNavigation('/reports/sales-min-max') },
        { title: 'Renegociação de Títulos', icon: 'assignment', onPress: () => handleNavigation('/reports/assignments') },
        {
            title: 'Análises IA',
            icon: 'psychology',
            onPress: () => handleNavigation('/mcp'),
        },
    ];

    return (
        <View className="flex-1 bg-gray-50">
            <Header username={username} />
            <View className="flex-1 px-2 sm:px-4 lg:px-6">
                <View className="p-3 sm:p-4 lg:p-6">
                    <Text className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                        Relatórios, Insights & IA
                    </Text>
                    <Text className="text-gray-500 mt-1 text-sm sm:text-base">
                        Escolha um relatório para visualizar
                    </Text>
                </View>
                <FlatList
                    data={reports}
                    renderItem={({ item }) => <ReportItem {...item} />}
                    keyExtractor={(item) => item.title}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={{ justifyContent: 'space-around' }}
                    contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 8 }}
                />
            </View>
        </View>
    );
}
