import Header from '@/components/header'
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
  const params = useLocalSearchParams()
  const username = params.usuario || 'User'

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
      title: 'Relatórios',
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
      className="w-1/2 p-2"
    >
      <TouchableOpacity
        onPress={onPress}
        className="bg-blue-500 rounded-3xl p-4 active:scale-95 transition-transform"
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={description}
      >
        <View className="aspect-square justify-between">
          <MaterialIcons name={icon} size={32} color="white" />
          <View className="space-y-1">
            <Text className="text-white text-lg font-bold">{title}</Text>
            <Text className="text-blue-100 text-sm">{description}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  ), [])

  return (
    <View className="flex-1 bg-gray-50">
      <Header username={username} />

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Animated.View
          entering={FadeIn.delay(300).springify()}
          className="py-6"
        >
          <Text className="text-3xl font-bold text-gray-800">
            Bem-vindo, {username}
          </Text>
          <Text className="text-gray-500 mt-2 text-lg">
            O que você gostaria de fazer hoje?
          </Text>
        </Animated.View>

        <View className="flex-row flex-wrap -mx-2">
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
