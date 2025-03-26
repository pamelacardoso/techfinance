import { useAuth } from "@/hooks/useAuth";
import { useImageStore } from "@/hooks/useImageStore";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from "expo-router";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  username: string;
}

export default function Header({ username }: Readonly<HeaderProps>) {
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  return (
    <View className="bg-gray-200 p-4 flex-row items-center justify-between">
      <View className="flex-row items-center">
        {navigation.canGoBack() && (
          <TouchableOpacity onPress={navigation.goBack} className="mr-4">
            <MaterialIcons name="arrow-back" size={24} color="gray" />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={pickImage}>
          <View className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden justify-center items-center">
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                className="w-full h-full"
              />
            ) : (
              <MaterialIcons name="person" size={20} color="gray" />
            )}
          </View>
        </TouchableOpacity>
        <Text className="text-xl ml-5">{username}</Text>
      </View>

      <TouchableOpacity onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="gray" />
      </TouchableOpacity>
    </View>
  );
}
