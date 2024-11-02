import { MaterialIcons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
    username: string | string[];
    imageUri: string | null;
    setImageUri: (uri: string | null) => void;
    pickImage: () => void;
}

export default function Header({ username, imageUri, setImageUri, pickImage }: HeaderProps) {
    return (
        <View className="bg-gray-200 p-4 flex-row items-center">
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
    )
}
