import { TouchableWithoutFeedback } from "react-native";
import { View } from "tamagui";

import { usePlayerStore } from "~/stores/player/store";
import { Controls } from "./Controls";
import { PlayButton } from "./PlayButton";
import { SeekButton } from "./SeekButton";

export const MiddleControls = () => {
  const idle = usePlayerStore((state) => state.interface.isIdle);
  const setIsIdle = usePlayerStore((state) => state.setIsIdle);

  const handleTouch = () => {
    setIsIdle(!idle);
  };

  return (
    <TouchableWithoutFeedback onPress={handleTouch}>
      <View
        position="absolute"
        height="100%"
        width="100%"
        flex={1}
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        gap={82}
      >
        <Controls>
          <SeekButton type="backward" />
        </Controls>
        <Controls>
          <PlayButton />
        </Controls>
        <Controls>
          <SeekButton type="forward" />
        </Controls>
      </View>
    </TouchableWithoutFeedback>
  );
};
