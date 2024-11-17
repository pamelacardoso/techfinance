// src/screens/CustomerDetails.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

type CustomerDetailsProps = {
  route: any
}

const CustomerDetails = ({ route }: CustomerDetailsProps) => {
  const { customerId } = route.params

  // Aqui você pode buscar os detalhes do cliente baseado no customerId
  // Exemplo de exibição dos detalhes
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes do Cliente</Text>
      <Text>ID do Cliente: {customerId}</Text>
      {/* Exiba outros detalhes do cliente aqui */}
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

export default CustomerDetails
