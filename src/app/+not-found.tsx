import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';


const NotFound = () => {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Ionicons name="alert-circle-outline" size={64} color="red" style={{ marginBottom: 20 }} />
            <Text style={styles.text} className='mb-4'>Página não encontrada</Text>
            <Button title="Voltar" onPress={() => router.back()} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default NotFound;
