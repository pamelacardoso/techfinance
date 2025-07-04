import Header from '@/components/header'
import { CustomerRepository, ResumoAtraso } from '@/repositories/customer.repository'
import { OpenAIService } from '@/services/openai.service'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Markdown from 'react-native-markdown-display'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

const customerRepository = new CustomerRepository()
const openAiService = new OpenAIService()

export default function TitlePage() {
  const [resumo, setResumo] = useState<ResumoAtraso | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [insights, setInsights] = useState('')

  const fetchResumo = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await customerRepository.fetchResumo()
      setResumo(data)
    } catch (err) {
      setError('Falha ao carregar o resumo. Por favor, tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResumo()
  }, [fetchResumo])

  const getInsights = useCallback(async () => {
    if (!resumo) return

    try {
      const prompt = `Forneça insights sobre os seguintes dados de títulos: ${Object.entries(resumo).map(([title, value]) => `${title}: ${value}`).join(', ')}. Limite a resposta a 260 caracteres.`
      await openAiService.sendMessage(prompt)
      const response = openAiService.messages[openAiService.messages.length - 1]?.message || 'Sem insights disponíveis.'
      setInsights(response)
    } catch (error) {
      console.error('Erro ao obter insights:', error)
      setInsights('Não foi possível obter insights no momento.')
    }
  }, [resumo])

  const resumoItems: { key: keyof ResumoAtraso, title: string, icon: string, color: string, order: number }[] = [
    { key: 'vencimento_hoje', title: 'Vencimento Hoje', icon: 'event', color: '#4CAF50', order: 3 },
    { key: 'vence_ate_30', title: 'Vence em até 30 dias', icon: 'event-available', color: '#2196F3', order: 4 },
    { key: 'vencimento_superior_30', title: 'Vencimento superior a 30 dias', icon: 'event-note', color: '#9C27B0', order: 5 },
    { key: 'atraso_ate_30', title: 'Atraso até 30 dias', icon: 'warning', color: '#FFC107', order: 2 },
    { key: 'atraso_30_60', title: 'Atraso entre 30 e 60 dias', icon: 'error', color: '#FF5722', order: 1 },
    { key: 'outro', title: 'Atraso superior a 60 dias', icon: 'more-horiz', color: '#607D8B', order: 6 },
  ]

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Carregando resumo...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-4">
        <MaterialIcons name="error-outline" size={48} color="#EF4444" />
        <Text className="mt-4 text-red-500 text-center">{error}</Text>
        <TouchableOpacity
          onPress={fetchResumo}
          className="mt-6 bg-blue-500 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <Header username={'Admin'} />
      <Animated.View
        entering={FadeIn.delay(300).springify()}
        className="p-3 sm:p-6 lg:p-8"
      >
        <Text className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Resumo de Títulos</Text>
        <Text className="text-base sm:text-lg lg:text-xl text-gray-600 mt-2">
          Visão geral dos seus títulos e prazos
        </Text>
      </Animated.View>

      <View className="mx-3 sm:mx-6 lg:mx-8 mb-4">
        <TouchableOpacity
          onPress={getInsights}
          className="bg-blue-600 rounded-xl px-4 sm:px-6 py-3 sm:py-4 flex-row items-center justify-center active:bg-blue-700"
          accessibilityLabel="Obter insights do Dinho"
        >
          <MaterialIcons name="psychology" size={20} color="white" className="sm:text-2xl mr-2" />
          <Text className="text-white font-semibold text-sm sm:text-base lg:text-lg">
            Obter Insights do Dinho
          </Text>
        </TouchableOpacity>
      </View>

      {insights ? (
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="mx-3 sm:mx-6 lg:mx-8 mb-6"
        >
          <View className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 sm:p-6">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="lightbulb" size={20} color="white" className="sm:text-2xl mr-2" />
              <Text className="text-white font-bold text-base sm:text-lg">Insights do Dinho</Text>
            </View>
            <Markdown
              style={{
                body: { color: 'black', fontSize: 14, lineHeight: 20 },
                paragraph: { marginBottom: 8 },
              }}
            >
              {insights}
            </Markdown>
          </View>
        </Animated.View>
      ) : null}

      {resumo && (
        <View className="px-3 sm:px-6 lg:px-8 pb-6">
          {resumoItems.sort((r1, r2) => r1.order - r2.order).map((item, index) => (
            <Animated.View
              key={item.key}
              entering={FadeInDown.delay(400 + index * 100).springify()}
              className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4"
            >
              <LinearGradient
                colors={[item.color, item.color + '80']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
              />
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <MaterialIcons
                      name={item.icon as any}
                      size={20}
                      color={item.color}
                      className="sm:text-2xl mr-3"
                    />
                    <Text className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">
                      {item.title}
                    </Text>
                  </View>
                  <Text className="text-xs sm:text-sm text-gray-600 ml-8">
                    {((Number(resumo[item.key]) / Number(resumo.total)) * 100).toFixed(1)}% do total
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: item.color }}>
                    {resumo[item.key]}
                  </Text>
                  <Text className="text-xs sm:text-sm text-gray-500">títulos</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}
