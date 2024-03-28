import { Keyboard } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { usePlayer } from "~/hooks/player/usePlayer";

export const BackButton = () => {
  const { dismissFullscreenPlayer } = usePlayer();
  const router = useRouter();

  return (
    <Ionicons
      name="arrow-back"
      onPress={() => {
        dismissFullscreenPlayer()
          .then(() => {
            router.back();
            return setTimeout(() => {
              Keyboard.dismiss();
            }, 100);
          })
          .catch(() => {
            router.back();
            return setTimeout(() => {
              Keyboard.dismiss();
            }, 100);
          });
      }}
      size={36}
      color="white"
      style={{
        width: 100,
      }}
    />
  );
};
