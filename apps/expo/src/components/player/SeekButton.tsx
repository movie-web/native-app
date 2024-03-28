import { MaterialIcons } from "@expo/vector-icons";

import { usePlayerStore } from "~/stores/player/store";

interface SeekProps {
  type: "forward" | "backward";
}

export const SeekButton = ({ type }: SeekProps) => {
  const videoRef = usePlayerStore((state) => state.videoRef);
  const status = usePlayerStore((state) => state.status);
  const setAudioPositionAsync = usePlayerStore(
    (state) => state.setAudioPositionAsync,
  );

  return (
    <MaterialIcons
      name={type === "forward" ? "forward-10" : "replay-10"}
      size={36}
      color="white"
      onPress={() => {
        if (status?.isLoaded) {
          const position =
            type === "forward"
              ? status.positionMillis + 10000
              : status.positionMillis - 10000;

          videoRef?.setPositionAsync(position).catch(() => {
            console.log("Error seeking backwards");
          });
          void setAudioPositionAsync(position);
        }
      }}
    />
  );
};
