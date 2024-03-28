import { useState } from "react";
import { useSharedValue } from "react-native-reanimated";

export const useVolume = () => {
  const [showVolumeOverlay, setShowVolumeOverlay] = useState(false);

  const volume = useSharedValue(1);

  return {
    showVolumeOverlay,
    setShowVolumeOverlay,
    volume,
  } as const;
};
