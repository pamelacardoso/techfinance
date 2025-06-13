import { useMCP } from '@/hooks/useMCP';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

interface MCPContextManagerProps {
  visible: boolean;
  onClose: () => void;
  onContextSelected?: (contextId: string) => void;
}

export default function MCPContextManager({ visible, onClose, onContextSelected }: MCPContextManagerProps) {
  const {
    isLoading,
    error,
    contexts,
    loadContexts,
    createContext,
    deleteContext,
    clearError
  } = useMCP();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newContextName, setNewContextName] = useState('');
  const [newContextDescription, setNewContextDescription] = useState('');

  useEffect(() => {
    if (visible) {
      loadContexts();
    }
  }, [visible, loadContexts]);

  const handleCreateContext = async () => {
    if (!newContextName.trim() || !newContextDescription.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    const context = await createContext(
      newContextName,
      newContextDescription,
      {
        createdAt: new Date().toISOString(),
        analysisType: 'general'
      }
    );

    if (context) {
      setNewContextName('');
      setNewContextDescription('');      setShowCreateForm(false);
      loadContexts();
      Alert.alert('Sucesso', 'Análise salva com sucesso');
    }
  };
  const handleDeleteContext = (contextId: string, contextName: string) => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja realmente excluir a análise "${contextName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteContext(contextId);
            if (success) {
              Alert.alert('Sucesso', 'Análise excluída com sucesso');
            }
          }
        }
      ]
    );
  };

  const renderContextItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      className="bg-white rounded-lg shadow-sm p-4 mb-3"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
          <Text className="text-sm text-gray-600 mt-1">{item.description}</Text>
        </View>
        <View className="flex-row">
          {onContextSelected && (
            <TouchableOpacity
              onPress={() => {
                onContextSelected(item.id);
                onClose();
              }}
              className="p-2 mr-2 bg-blue-100 rounded-lg"
            >
              <MaterialIcons name="check" size={20} color="#3B82F6" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => handleDeleteContext(item.id, item.name)}
            className="p-2 bg-red-100 rounded-lg"
          >
            <MaterialIcons name="delete" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-xs text-gray-500">
          Criado: {new Date(item.createdAt).toLocaleDateString('pt-BR')}
        </Text>
        <Text className="text-xs text-blue-600 font-medium">
          {item.data?.analysisType || 'Geral'}
        </Text>
      </View>
    </Animated.View>
  );

  const CreateContextForm = () => (
    <Animated.View entering={FadeIn.springify()} className="bg-white rounded-lg p-4 mb-4">      <Text className="text-lg font-bold text-gray-800 mb-4">Nova Análise Inteligente</Text>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Nome da Análise</Text>        <TextInput
          className="p-3 border border-gray-300 rounded-lg text-gray-700"
          placeholder="Ex: Análise Cliente ABC"
          value={newContextName}
          onChangeText={setNewContextName}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Descrição</Text>
        <TextInput
          className="p-3 border border-gray-300 rounded-lg text-gray-700"
          placeholder="Descreva o propósito desta análise"
          value={newContextDescription}
          onChangeText={setNewContextDescription}
          multiline
          numberOfLines={3}
        />
      </View>

      <View className="flex-row space-x-3">
        <TouchableOpacity
          onPress={() => setShowCreateForm(false)}
          className="flex-1 p-3 bg-gray-200 rounded-lg"
        >
          <Text className="text-center text-gray-700 font-medium">Cancelar</Text>
        </TouchableOpacity>        <TouchableOpacity
          onPress={handleCreateContext}
          disabled={isLoading}
          className={`flex-1 p-3 rounded-lg ${isLoading ? 'bg-blue-300' : 'bg-blue-600'}`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center text-white font-medium">Salvar</Text>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-4 py-6 border-b border-gray-200">          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold text-gray-800">Gerenciar Análises</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600 mt-1">
            Gerencie suas análises salvas e histórico
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1 p-4">
          {/* Error Display */}
          {error && (
            <Animated.View entering={FadeIn.springify()} className="bg-red-100 border border-red-400 rounded-lg p-4 mb-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-red-700 flex-1">{error}</Text>
                <TouchableOpacity onPress={clearError}>
                  <MaterialIcons name="close" size={20} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* Create Button */}
          {!showCreateForm && (            <TouchableOpacity
              onPress={() => setShowCreateForm(true)}
              className="bg-blue-600 rounded-lg p-4 mb-4 flex-row items-center justify-center"
            >
              <MaterialIcons name="add" size={24} color="white" />
              <Text className="text-white font-medium ml-2">Nova Análise</Text>
            </TouchableOpacity>
          )}

          {/* Create Form */}
          {showCreateForm && <CreateContextForm />}

          {/* Loading */}
          {isLoading && !showCreateForm && (            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-600 mt-2">Carregando análises...</Text>
            </View>
          )}

          {/* Contexts List */}
          {!isLoading && contexts.length > 0 && (
            <FlatList
              data={contexts}
              renderItem={renderContextItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Empty State */}
          {!isLoading && contexts.length === 0 && !showCreateForm && (            <View className="flex-1 justify-center items-center">
              <MaterialIcons name="folder-open" size={64} color="#D1D5DB" />
              <Text className="text-gray-500 text-lg mt-4">Nenhuma análise encontrada</Text>
              <Text className="text-gray-400 text-center mt-2">
                Crie uma nova análise para começar a organizar seus dados
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
