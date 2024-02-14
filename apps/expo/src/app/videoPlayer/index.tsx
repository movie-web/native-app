import type { AVPlaybackSource } from "expo-av";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";
import { ResizeMode, Video } from "expo-av";
import * as NavigationBar from "expo-navigation-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as StatusBar from "expo-status-bar";

import type { ScrapeMedia, Stream } from "@movie-web/provider-utils";
import { findHighestQuality } from "@movie-web/provider-utils";

import type { ItemData } from "~/components/item/item";
import type { HeaderData } from "~/components/player/Header";
import { ControlsOverlay } from "~/components/player/ControlsOverlay";
import { Text } from "~/components/ui/Text";
import { useBrightness } from "~/hooks/player/useBrightness";
import { useVolume } from "~/hooks/player/useVolume";
import { usePlayerStore } from "~/stores/player/store";

export default function VideoPlayerWrapper() {
  const params = useLocalSearchParams();
  const data = params.data
    ? (JSON.parse(params.data as string) as VideoPlayerData)
    : null;
  return <VideoPlayer data={data} />;
}

export interface VideoPlayerData {
  item: ItemData;
  stream: Stream;
  media: ScrapeMedia;
}

interface VideoPlayerProps {
  data: VideoPlayerData | null;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ data }) => {
  const {
    brightness,
    debouncedBrightness,
    showBrightnessOverlay,
    setShowBrightnessOverlay,
    handleBrightnessChange,
  } = useBrightness();
  const {
    currentVolume,
    debouncedVolume,
    showVolumeOverlay,
    setShowVolumeOverlay,
    handleVolumeChange,
  } = useVolume();
  const [videoSrc, setVideoSrc] = useState<AVPlaybackSource>();
  const [isLoading, setIsLoading] = useState(true);
  const [headerData, setHeaderData] = useState<HeaderData>();
  const [resizeMode, setResizeMode] = useState(ResizeMode.CONTAIN);
  const [shouldPlay, setShouldPlay] = useState(true);
  const router = useRouter();
  const scale = useSharedValue(1);

  const setVideoRef = usePlayerStore((state) => state.setVideoRef);
  const setStatus = usePlayerStore((state) => state.setStatus);
  const isIdle = usePlayerStore((state) => state.interface.isIdle);
  const setIsIdle = usePlayerStore((state) => state.setIsIdle);
  const presentFullscreenPlayer = usePlayerStore(
    (state) => state.presentFullscreenPlayer,
  );
  const dismissFullscreenPlayer = usePlayerStore(
    (state) => state.dismissFullscreenPlayer,
  );

  const updateResizeMode = (newMode: ResizeMode) => {
    setResizeMode(newMode);
  };

  const pinchGesture = Gesture.Pinch().onUpdate((e) => {
    scale.value = e.scale;
    if (scale.value > 1 && resizeMode !== ResizeMode.COVER) {
      runOnJS(updateResizeMode)(ResizeMode.COVER);
    } else if (scale.value <= 1 && resizeMode !== ResizeMode.CONTAIN) {
      runOnJS(updateResizeMode)(ResizeMode.CONTAIN);
    }
  });

  const togglePlayback = () => {
    setShouldPlay(!shouldPlay);
  };

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(togglePlayback)();
    });

  const screenHalfWidth = Dimensions.get("window").width / 2;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const divisor = 5000;
      const dragIsInHeaderOrFooter = event.y < 100 || event.y > 400;
      if (dragIsInHeaderOrFooter) return;

      const directionMultiplier = event.velocityY < 0 ? 1 : -1;

      if (event.x > screenHalfWidth) {
        const change =
          directionMultiplier * Math.abs(event.velocityY / divisor);
        const newVolume = Math.max(
          0,
          Math.min(1, currentVolume.value + change),
        );
        runOnJS(handleVolumeChange)(newVolume);
      } else {
        const change =
          directionMultiplier * Math.abs(event.velocityY / divisor);
        const newBrightness = Math.max(
          0,
          Math.min(1, brightness.value + change),
        );
        brightness.value = newBrightness;
        runOnJS(handleBrightnessChange)(newBrightness);
      }
    })
    .onEnd(() => {
      runOnJS(setShowVolumeOverlay)(false);
      runOnJS(setShowBrightnessOverlay)(false);
    });

  const composedGesture = Gesture.Race(
    panGesture,
    pinchGesture,
    doubleTapGesture,
  );

  useEffect(() => {
    const initializePlayer = async () => {
      if (!data) {
        await dismissFullscreenPlayer();
        return router.push("/(tabs)");
      }

      StatusBar.setStatusBarHidden(true);

      if (Platform.OS === "android") {
        await NavigationBar.setVisibilityAsync("hidden");
      }

      setIsLoading(true);

      const { item, stream, media } = data;

      setHeaderData({
        title: item.title,
        year: item.year,
        season: media.type === "show" ? media.season.number : undefined,
        episode: media.type === "show" ? media.episode.number : undefined,
      });

      let highestQuality;
      let url;

      switch (stream.type) {
        case "file":
          highestQuality = findHighestQuality(stream);
          url = highestQuality ? stream.qualities[highestQuality]?.url : null;
          return url ?? null;
        case "hls":
          url = stream.playlist;
      }

      // setTextTracks(
      //   stream.captions && stream.captions.length > 0
      //     ? convertCaptionsToTextTracks(stream.captions)
      //     : [],
      // );

      setVideoSrc({
        uri: url,
        headers: {
          ...stream.preferredHeaders,
          ...stream.headers,
        },
      });

      setIsLoading(false);
    };

    setIsLoading(true);
    void presentFullscreenPlayer();
    void initializePlayer();

    return () => {
      void dismissFullscreenPlayer();
      StatusBar.setStatusBarHidden(false);
      if (Platform.OS === "android") {
        void NavigationBar.setVisibilityAsync("visible");
      }
    };
  }, [data, dismissFullscreenPlayer, presentFullscreenPlayer, router]);

  const onVideoLoadStart = () => {
    setIsLoading(true);
  };

  const onReadyForDisplay = () => {
    setIsLoading(false);
  };

  return (
    <GestureDetector gesture={composedGesture}>
      <View className="flex-1 items-center justify-center bg-black">
        <Video
          ref={setVideoRef}
          source={videoSrc}
          shouldPlay={shouldPlay}
          resizeMode={resizeMode}
          volume={currentVolume.value}
          onLoadStart={onVideoLoadStart}
          onReadyForDisplay={onReadyForDisplay}
          onPlaybackStatusUpdate={setStatus}
          style={styles.video}
          onTouchStart={() => setIsIdle(!isIdle)}
        />
        {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
        {!isLoading && headerData && (
          <ControlsOverlay headerData={headerData} />
        )}
        {showVolumeOverlay && (
          <View className="absolute bottom-12 self-center rounded-xl bg-black p-3 opacity-50">
            <Text className="font-bold">Volume: {debouncedVolume}</Text>
          </View>
        )}
        {showBrightnessOverlay && (
          <View className="absolute bottom-12 self-center rounded-xl bg-black p-3 opacity-50">
            <Text className="font-bold">Brightness: {debouncedBrightness}</Text>
          </View>
        )}
      </View>
    </GestureDetector>
  );
};

// interface Caption {
//   type: "srt" | "vtt";
//   id: string;
//   url: string;
//   hasCorsRestrictions: boolean;
//   language: string;
// }

// const captionTypeToTextTracksType = {
//   srt: TextTracksType.SUBRIP,
//   vtt: TextTracksType.VTT,
// };

// function convertCaptionsToTextTracks(captions: Caption[]): TextTracks {
//   return captions
//     .map((caption) => {
//       if (Platform.OS === "ios" && caption.type !== "vtt") {
//         return null;
//       }

//       return {
//         title: caption.language,
//         language: caption.language as ISO639_1,
//         type: captionTypeToTextTracksType[caption.type],
//         uri: caption.url,
//       };
//     })
//     .filter(Boolean) as TextTracks;
// }

const styles = StyleSheet.create({
  video: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
