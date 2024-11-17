// src/screens/ProductDetails.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

type ProductDetailsProps = {
  route: any
}

const ProductDetails = ({ route }: ProductDetailsProps) => {
  const { productId } = route.params

  // Aqui você pode buscar os detalhes do produto baseado no productId
  // Exemplo de exibição dos detalhes
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes do Produto</Text>
      <Text>ID do Produto: {productId}</Text>
      {/* Exiba outros detalhes do produto aqui */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
})

export default ProductDetails
