import { useCallback } from "react";
import * as ScreenOrientation from "expo-screen-orientation";

export const usePlayer = () => {
  const presentFullscreenPlayer = useCallback(async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE,
    );
  }, []);

  const dismissFullscreenPlayer = useCallback(async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    );
  }, []);

  return {
    presentFullscreenPlayer,
    dismissFullscreenPlayer,
  } as const;
};
