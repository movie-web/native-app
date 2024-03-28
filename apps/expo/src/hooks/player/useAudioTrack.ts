import type { Video } from "expo-av";
import { useCallback, useEffect } from "react";
import { Audio } from "expo-av";

import type { Stream } from "@movie-web/provider-utils";

import type { AudioTrack } from "~/components/player/AudioTrackSelector";
import { usePlayerStore } from "~/stores/player/store";

export const useAudioTrack = () => {
  const videoRef = usePlayerStore((state) => state.videoRef);
  const audioObject = usePlayerStore((state) => state.audioObject);
  const currentAudioTrack = usePlayerStore((state) => state.currentAudioTrack);
  const setAudioObject = usePlayerStore((state) => state.setAudioObject);
  const setCurrentAudioTrack = usePlayerStore(
    (state) => state.setCurrentAudioTrack,
  );

  const synchronizePlayback = useCallback(
    async (selectedAudioTrack?: AudioTrack, stream?: Stream) => {
      if (selectedAudioTrack && stream) {
        if (audioObject) {
          await audioObject.unloadAsync();
        }

        const createAudioAsyncWithTimeout = (uri: string, timeout = 5000) => {
          return new Promise<Audio.Sound | undefined>((resolve, reject) => {
            Audio.Sound.createAsync({
              uri,
              headers: {
                ...stream.headers,
                ...stream.preferredHeaders,
              },
            })
              .then((value) => resolve(value.sound))
              .catch(reject);

            setTimeout(() => {
              reject(new Error("Timeout: Audio loading took too long"));
            }, timeout);
          });
        };
        try {
          const sound = await createAudioAsyncWithTimeout(
            selectedAudioTrack.uri,
          );
          if (!sound) return;
          setAudioObject(sound);
          setCurrentAudioTrack(selectedAudioTrack);
        } catch (error) {
          console.error("Error loading audio track:", error);
        }
      } else {
        if (audioObject) {
          await audioObject.unloadAsync();
          setAudioObject(null);
        }
      }
    },
    [audioObject, setAudioObject, setCurrentAudioTrack],
  );

  const synchronizeAudioWithVideo = async (
    videoRef: Video | null,
    audioObject: Audio.Sound | null,
    selectedAudioTrack?: AudioTrack,
  ): Promise<void> => {
    if (videoRef && audioObject) {
      const videoStatus = await videoRef.getStatusAsync();

      if (selectedAudioTrack && videoStatus.isLoaded) {
        await videoRef.setIsMutedAsync(true);
        await audioObject.playAsync();
        await audioObject.setPositionAsync(videoStatus.positionMillis + 2000);
      } else {
        await videoRef.setIsMutedAsync(false);
      }
    }
  };

  useEffect(() => {
    if (audioObject && currentAudioTrack) {
      void synchronizeAudioWithVideo(videoRef, audioObject, currentAudioTrack);
    }
  }, [audioObject, videoRef, currentAudioTrack]);

  return { synchronizePlayback };
};
