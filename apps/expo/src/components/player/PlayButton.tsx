import { FontAwesome } from "@expo/vector-icons";

import { usePlayerStore } from "~/stores/player/store";

export const PlayButton = () => {
  const videoRef = usePlayerStore((state) => state.videoRef);
  const status = usePlayerStore((state) => state.status);
  const playAudio = usePlayerStore((state) => state.playAudio);
  const pauseAudio = usePlayerStore((state) => state.pauseAudio);

  return (
    <FontAwesome
      name={status?.isLoaded && status.isPlaying ? "pause" : "play"}
      size={36}
      color="white"
      onPress={() => {
        if (status?.isLoaded) {
          if (status.isPlaying) {
            videoRef?.pauseAsync().catch(() => {
              console.log("Error pausing video");
            });
            void pauseAudio();
          } else {
            videoRef?.playAsync().catch(() => {
              console.log("Error playing video");
            });
            void playAudio();
          }
        }
      }}
    />
  );
};
