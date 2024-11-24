import Header from "@/components/header";
import { api } from "@/lib/api";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Button, Text, TextInput, View } from "react-native";
import Markdown from "react-native-markdown-display";
import Animated, { FadeIn } from "react-native-reanimated";

export default function Assignments() {
    const params = useLocalSearchParams()
    const username = params.usuario || 'Admin'

    const [assignment, setAssignment] = useState<string>('')
    const [message, setMessage] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    async function onReportSubmit() {
        setIsLoading(true)
        const assignmentCount = Number(assignment);
        const response = await api.get('/contas_receber/ai', {
            params: {
                prompt: `Realize a renegociação de todos os títulos vencidos, considere a renegociação de ${assignmentCount} título${assignmentCount > 1 && 's'} por dia, somente os títulos vencidos e o inicio da renegociação a data de hoje. Considerar que a nova data de vencimento será de 20 dias a contar da data de cada renegociação. Crie uma tabela e projete um fluxo de caixa com base nas novas datas de vencimento, exibir as seguintes colunas: título, valor, dt de renegociação, dt original vencto, nova dt vencto. Exiba também o novo fluxo de caixa resumido por mês. Apresente apenas a tabela de título de renegociação e o fluxo de caixa.`,
            },
        })

        if (response.status !== 200) {
            return
        }

        setMessage(response.data)
        setIsLoading(false)
    }

    return (
        <View className="flex-1 bg-gray-50">
            <Header username={username} />
            <Animated.ScrollView
                entering={FadeIn.delay(200).springify()}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-1 px-2">
                    <View className="p-4">
                        <Text className="text-2xl font-bold text-gray-800">Renegociação de Títulos</Text>
                        <Text className="text-gray-500 mt-1">
                            Visualizar e gerenciar todas as suas renegociações.
                        </Text>
                    </View>
                </View>

                <View className="p-4 bg-white rounded-lg shadow-sm">
                    <View className="border border-gray-300 rounded-lg overflow-hidden">
                        <TextInput
                            className="p-3 text-base text-gray-700"
                            placeholder="Digite o número de renegociações"
                            keyboardType="numeric"
                            onChangeText={(text) => setAssignment(text)}
                            value={assignment}
                        />
                        <Button
                            title="Buscar"
                            onPress={onReportSubmit}
                            disabled={isLoading}
                        />
                    </View>
                </View>

                <View className="m-4 p-4 shadow-sm bg-slate-100 border border-slate-300">
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <MessageText>{message}</MessageText>
                    )}
                </View>
            </Animated.ScrollView>
        </View>
    )
}

function MessageText({ children }: { children: string }) {
    return children ? (
        <Markdown
            style={{
                body: {
                    color: '#333',
                    fontSize: 12,
                    width: '100%',
                },
                td: {
                    width: 'auto',
                }
            }}
        >
            {children}
        </Markdown>
    ) : (
        <Text className="text-gray-600">Os detalhes das suas renegociações aparecerão aqui.</Text>
    );
}
