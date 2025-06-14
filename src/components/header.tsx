import { useAuth } from "@/hooks/useAuth";
import { useImageStore } from "@/hooks/useImageStore";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from "expo-router";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  username: string;
}

export default function Header({ username = 'Admin' }: Readonly<HeaderProps>) {
  const imageUri = useImageStore((state) => state.imageUri);
  const setImageUri = useImageStore((state) => state.setImageUri);
  const logout = useAuth((state) => state.logout);
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'index' as never }],
    });
  };

  async function pickImage() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Não foi possível acessar a galeria de imagens, tente novamente mais tarde.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  return (
    <View className="bg-gray-200 p-3 sm:p-4 lg:p-6 flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        {navigation.canGoBack() && (
          <TouchableOpacity
            onPress={navigation.goBack}
            className="mr-2 sm:mr-4 p-1 sm:p-2 rounded-full active:bg-gray-300"
            accessibilityLabel="Voltar"
          >
            <MaterialIcons name="arrow-back" size={20} color="gray" className="sm:text-2xl" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={pickImage}
          className="mr-3 sm:mr-4"
          accessibilityLabel="Alterar foto de perfil"
        >
          <View className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gray-300 overflow-hidden justify-center items-center">
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <MaterialIcons name="person" size={16} color="gray" className="sm:text-xl lg:text-2xl" />
            )}
          </View>
        </TouchableOpacity>

        <Text className="text-base sm:text-lg lg:text-xl font-medium text-gray-800 flex-1" numberOfLines={1}>
          {username}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleLogout}
        className="p-1 sm:p-2 rounded-full active:bg-gray-300"
        accessibilityLabel="Sair"
      >
        <MaterialIcons name="logout" size={20} color="gray" className="sm:text-2xl" />
      </TouchableOpacity>
    </View>
  );
}
