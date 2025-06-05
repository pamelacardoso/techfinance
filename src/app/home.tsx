import Header from '@/components/header'
import { useAuth } from '@/hooks/useAuth'
import { MaterialIcons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

interface MenuItem {
  title: string
  icon: keyof typeof MaterialIcons.glyphMap
  route?: string
  description: string
}

interface GridItemProps {
  title: string
  icon: keyof typeof MaterialIcons.glyphMap
  description: string
  onPress?: () => void
  index: number
}

export default function HomeScreen() {
  const user = useAuth((state) => state.user)
  const username = user?.name || 'User'
  const params = useLocalSearchParams()

  const menuItems: MenuItem[] = [
    {
      title: 'Produtos',
      icon: 'shopping-bag',
      route: '/product',
      description: 'Gerencie seu inventário'
    },
    {
      title: 'Vendas',
      icon: 'attach-money',
      route: '/sales',
      description: 'Acompanhe suas vendas'
    },
    {
      title: 'Clientes',
      icon: 'people',
      route: '/customer',
      description: 'Gerencie seus clientes'
    },
    {
      title: 'Títulos',
      icon: 'assignment',
      route: '/title',
      description: 'Controle financeiro'
    },
    {
      title: 'Relatórios & Insights',
      icon: 'bar-chart',
      description: 'Análise de dados',
      route: '/reports',
    },
    {
      title: 'Dinho Bot',
      icon: 'chat',
      route: '/chat',
      description: 'Assistente virtual'
    },
  ]

  const GridItem = useCallback<React.FC<GridItemProps>>(({ title, icon, description, onPress, index }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      className="w-1/2 sm:w-1/2 lg:w-1/3 xl:w-1/4 p-2"
    >
      <TouchableOpacity
        onPress={onPress}
        className="bg-blue-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 active:scale-95 transition-transform lg:m-2"
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={description}
      >
        <View className="aspect-square justify-between min-h-[120px] sm:min-h-[140px] lg:min-h-[160px]">
          <View className="flex-1 justify-center items-center">
            <MaterialIcons name={icon} size={32} color="white" className="sm:text-4xl lg:text-5xl mb-2" />
          </View>
          <View className="space-y-1">
            <Text className="text-white text-base sm:text-lg lg:text-xl font-bold text-center" numberOfLines={2}>
              {title}
            </Text>
            <Text className="text-blue-100 text-xs sm:text-sm text-center" numberOfLines={2}>
              {description}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  ), [])

  return (
    <View className="flex-1 bg-gray-50">
      <Header username={username} />

      <ScrollView
        className="flex-1 px-3 sm:px-4 lg:px-6 xl:px-8"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Animated.View
          entering={FadeIn.delay(300).springify()}
          className="py-4 sm:py-6 lg:py-8"
        >
          <Text className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
            Bem-vindo, {username}
          </Text>
          <Text className="text-gray-500 mt-2 text-base sm:text-lg lg:text-xl">
            O que você gostaria de fazer hoje?
          </Text>
        </Animated.View>

        <View className="flex-row flex-wrap -mx-2 justify-center sm:justify-start">
          {menuItems.map((item: MenuItem, index: number) => (
            <GridItem
              key={index}
              index={index}
              title={item.title}
              icon={item.icon}
              description={item.description}
              onPress={item.route ? () => router.push(item.route!) : undefined}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
