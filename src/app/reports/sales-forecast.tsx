import Header from '@/components/header';
import { env } from '@/config/env';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Button,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface ForecastData {
    ds: string;
    yhat: number;
    yhat_lower: number;
    yhat_upper: number;
}

const SalesForecastScreen = () => {
    const [days, setDays] = useState('7');
    const [forecast, setForecast] = useState<ForecastData[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const handleDaysChange = (text: string) => {
        const cleanedText = text.replace(/[^0-9]/g, '');
        if (cleanedText === '') {
            setDays('');
            return;
        }
        if (cleanedText === '0') {
            return;
        }
        setDays(cleanedText);
    };

    const fetchForecast = async () => {
        if (!days) return;
        setLoading(true);
        setError(null);
        setForecast(null);
        setCurrentPage(1);

        try {
            const response = await fetch(`${env.API_FORECAST_URL}/previsao/vendas?dias_previsao=${days}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.API_TOKEN}`,
                },
            });

            if (!response.ok) {
                throw new Error('Falha ao buscar a previsão de vendas');
            }

            const data: ForecastData[] = await response.json();
            setForecast(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const paginatedData = forecast
        ? forecast.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        : [];

    const totalPages = forecast ? Math.ceil(forecast.length / itemsPerPage) : 0;

    const chartData = forecast ? {
        labels: forecast.map(item => item.ds.substring(5, 10)), // Format date to MM-DD
        datasets: [
            {
                data: forecast.map(item => item.yhat),
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                strokeWidth: 2,
            },
        ],
        legend: ['Previsão de Vendas'],
    } : {
        labels: [],
        datasets: [{ data: [] }]
    };

    return (
        <View style={styles.container}>
            <Header username="Previsão de Vendas" />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Dias para Previsão:</Text>
                <TextInput
                    style={styles.input}
                    value={days}
                    onChangeText={handleDaysChange}
                    keyboardType="numeric"
                    placeholder="Ex: 30"
                />
                <Button title="Gerar Previsão" onPress={fetchForecast} disabled={loading || !days} />

                {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}
                {error && <Text style={styles.error}>{error}</Text>}

                {forecast && (
                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitle}>Previsão de Vendas para os próximos {days} dias</Text>
                        <LineChart
                            data={chartData}
                            width={screenWidth - 40}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    </View>
                )}

                {forecast && forecast.length > 0 && (
                    <View className="mt-6 px-1">
                        <Text className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Resultados da Previsão</Text>
                        {paginatedData.map((item, index) => (
                            <View key={index} className="bg-white rounded-xl p-4 mb-3 flex-row justify-between items-center">
                                <View>
                                    <Text className="text-base font-medium text-gray-700">
                                        {new Date(item.ds).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                        })}
                                    </Text>
                                </View>
                                <View className="flex-row items-center bg-blue-50 py-1 px-3 rounded-full">
                                    <Text className="text-base font-bold text-blue-600 mr-2">
                                        R$
                                    </Text>
                                    <Text className="text-base font-bold text-blue-600">
                                        {item.yhat.toLocaleString('pt-BR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </Text>
                                </View>
                            </View>
                        ))}
                        <View className="flex-row justify-between items-center mt-4">
                            <TouchableOpacity
                                onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`py-2 px-4 rounded-lg ${currentPage === 1 ? 'bg-gray-200' : 'bg-blue-500'
                                    }`}
                            >
                                <Text className={`font-bold ${currentPage === 1 ? 'text-gray-500' : 'text-white'}`}>
                                    Anterior
                                </Text>
                            </TouchableOpacity>
                            <Text className="text-gray-700 font-medium">
                                Página {currentPage} de {totalPages}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`py-2 px-4 rounded-lg ${currentPage === totalPages ? 'bg-gray-200' : 'bg-blue-500'
                                    }`}
                            >
                                <Text
                                    className={`font-bold ${currentPage === totalPages ? 'text-gray-500' : 'text-white'
                                        }`}
                                >
                                    Próximo
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const chartConfig = {
    backgroundColor: '#36C',
    backgroundGradientFrom: '#36C',
    backgroundGradientTo: '#36C',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
        borderRadius: 16,
    },
    propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: '#ffa726',
    },
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    content: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    loader: {
        marginTop: 20,
    },
    error: {
        marginTop: 20,
        color: 'red',
        textAlign: 'center',
    },
    chartContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
});

export default SalesForecastScreen;
