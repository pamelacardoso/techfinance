import Header from "@/components/header"
import { SalesQuerySchema, SalesRepository, TopProducts } from "@/repositories/sales.repository"
import { OpenAIService } from "@/services/openai.service"
import { convertStringToDecimal } from "@/utils/numbers"
import { MaterialIcons } from "@expo/vector-icons"
import { LinearGradient } from 'expo-linear-gradient'
import { router, useLocalSearchParams } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native"
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

const salesRepository = new SalesRepository()
const openAiService = new OpenAIService()

export default function SalesByQuantity() {
    const params = useLocalSearchParams()
    const username = 'Admin'

    const [sales, setSales] = useState<TopProducts[]>([])
    const [loading, setLoading] = useState(false)
    const [totalSales, setTotalSales] = useState(0)
    const [totalValue, setTotalValue] = useState(0)
    const [insights, setInsights] = useState('')

    useEffect(() => {
        const fetchSales = async () => {
            setLoading(true)
            try {
                const query: SalesQuerySchema = {}
                const salesData = await salesRepository.getTopProductsByQuantity(query)
                setSales(salesData)

                const totalSalesCount = salesData.length > 0 ? Number(salesData[0].qtde ?? 0) : 0
                const totalSalesValue = salesData.reduce((acc, sale) => acc + (Number(sale.quantidade_total) ?? 0), 0)

                setTotalSales(totalSalesCount)
                setTotalValue(totalSalesValue)
            } catch (error) {
                console.error('Erro ao buscar dados de vendas:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSales()
    }, [])

    const getInsights = async () => {
        try {
            const prompt = `Forneça insights em até 260 caracteres sobre as seguintes vendas: ${JSON.stringify(sales)}. Total Histórico ${sales[0]?.total ?? 0}`
            await openAiService.sendMessage(prompt)
            const response = openAiService.messages[openAiService.messages.length - 1].message
            setInsights(response)
        } catch (error) {
            console.error('Erro ao obter insights do Dino:', error)
        }
    }

    const renderSalesItem = useCallback(({ item, index }: { item: TopProducts; index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 50).springify()}
            className="bg-white rounded-2xl shadow-lg p-4 mb-3"
        >
            <LinearGradient
                colors={['#4F46E5', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
            />
            <View className="flex-row justify-between items-center">
                <View className="flex-1 pr-4">
                    <Text className="text-lg font-bold text-gray-800" numberOfLines={2}>{item.descricao_produto}</Text>
                    <Text className="text-sm text-gray-500 mt-1">Código: {item.codigo_produto}</Text>
                </View>
                <View className="items-end">
                    <Text className="text-2xl font-bold text-blue-600">{convertStringToDecimal(item.quantidade_total ?? '0')}</Text>
                    <Text className="text-sm text-blue-500 font-medium">{(Number(item.quantidade_total) / Number(item.total) * 100).toFixed(2)}%</Text>
                </View>
            </View>
        </Animated.View>
    ), [])

    return (
        <View className="flex-1 bg-gray-50">
            <Header username={username} />
            <Animated.ScrollView
                entering={FadeIn.delay(300).springify()}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-4 pt-6 pb-4">
                    <Text className="text-2xl font-bold text-gray-800">Top 10 Produtos em Qtde </Text>
                    <Text className="text-lg text-gray-600 mt-1 font-bold">Mais vendidos em quantidade</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/reports/sales')}
                        className="mt-2 bg-blue-100 rounded-xl px-4 py-2 w-48 flex-row items-center justify-center active:bg-blue-200"
                        accessibilityLabel="Ver Top 10 Produtos em $"
                    >
                        <MaterialIcons name="attach-money" size={20} color="#3B82F6" />
                        <Text className="text-blue-600 font-medium text-base ml-2">Ver por Valor</Text>
                    </TouchableOpacity>

                    <View className="mt-6 space-y-4">
                        <View className="bg-white rounded-2xl shadow-lg shadow-blue-500/10 p-4">
                            <Text className="text-lg font-semibold text-gray-700 mb-2">Resumo de Vendas</Text>
                            <View className="flex-row justify-between items-center mt-6 bg-blue-50 p-4 rounded-2xl">
                                <View>
                                    <Text className="text-sm text-blue-600 font-medium">Total de Vendas</Text>
                                    <Text className="text-2xl font-bold text-gray-800 mt-1">{totalSales.toLocaleString('pt-br', { style: 'decimal' })}</Text>
                                </View>
                                <View>
                                    <Text className="text-sm text-blue-600 font-medium">Qtd. Total Histórico</Text>
                                    <Text className="text-2xl font-bold text-gray-800 mt-1">
                                        {sales?.length > 0 ? convertStringToDecimal(sales[0].total ?? '0') : 'N/A'}
                                    </Text>
                                    <Text className="mt-2 text-sm text-blue-600 font-medium">Qtd. Total Top 10</Text>
                                    <Text className="text-2xl font-bold text-gray-800 mt-1">
                                        {totalValue.toLocaleString('pt-br', {
                                            style: 'decimal',
                                        })}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={getInsights}
                            className="bg-blue-600 rounded-xl p-4 flex-row items-center justify-center active:bg-blue-700"
                            accessibilityLabel="Obter insights do Dinho"
                        >
                            <MaterialIcons name="insights" size={24} color="white" />
                            <Text className="text-white font-medium text-lg ml-2">Obter Insights do Dinho</Text>
                        </TouchableOpacity>

                        {insights ? (
                            <Animated.View
                                entering={FadeInDown.springify()}
                                className="bg-white rounded-2xl shadow-lg shadow-blue-500/10 p-4"
                            >
                                <Text className="text-gray-700 leading-relaxed">{insights}</Text>
                            </Animated.View>
                        ) : null}
                    </View>
                </View>

                <View className="px-4 mt-6">
                    <Text className="text-xl font-bold text-gray-800 mb-4">Detalhes dos Produtos</Text>
                    {loading ? (
                        <View className="flex-1 justify-center items-center py-12">
                            <ActivityIndicator size="large" color="#3B82F6" />
                            <Text className="text-gray-500 mt-4">Carregando dados...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={sales}
                            renderItem={renderSalesItem}
                            keyExtractor={(item) => item.codigo_produto.toString()}
                            ListEmptyComponent={
                                <View className="flex-1 justify-center items-center py-12">
                                    <MaterialIcons name="inventory" size={48} color="#D1D5DB" />
                                    <Text className="text-gray-500 text-center mt-4">Nenhum produto encontrado.</Text>
                                </View>
                            }
                            scrollEnabled={false}
                        />
                    )}
                </View>
            </Animated.ScrollView>
        </View>
    )
}
