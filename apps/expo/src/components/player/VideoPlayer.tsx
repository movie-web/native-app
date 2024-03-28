import type { AVPlaybackStatus } from "expo-av";
import type { SharedValue } from "react-native-reanimated";
import { useEffect, useState } from "react";
import { Dimensions, Platform } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ResizeMode, Video } from "expo-av";
import * as Haptics from "expo-haptics";
import * as MediaLibrary from "expo-media-library";
import * as NavigationBar from "expo-navigation-bar";
import { useRouter } from "expo-router";
import * as StatusBar from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import { Spinner, useTheme, View } from "tamagui";

import { findHighestQuality } from "@movie-web/provider-utils";

import { useAudioTrack } from "~/hooks/player/useAudioTrack";
import { useBrightness } from "~/hooks/player/useBrightness";
import { usePlaybackSpeed } from "~/hooks/player/usePlaybackSpeed";
import { usePlayer } from "~/hooks/player/usePlayer";
import { useVolume } from "~/hooks/player/useVolume";
import {
  convertMetaToItemData,
  convertMetaToScrapeMedia,
  getNextEpisode,
} from "~/lib/meta";
import { useAudioTrackStore } from "~/stores/audio";
import { usePlayerStore } from "~/stores/player/store";
import {
  usePlayerSettingsStore,
  useWatchHistoryStore,
} from "~/stores/settings";
import { CaptionRenderer } from "./CaptionRenderer";
import { ControlsOverlay } from "./ControlsOverlay";

export const VideoPlayer = () => {
  const {
    brightness,
    showBrightnessOverlay,
    setShowBrightnessOverlay,
    handleBrightnessChange,
  } = useBrightness();
  const { volume, showVolumeOverlay, setShowVolumeOverlay } = useVolume();

  const { currentSpeed } = usePlaybackSpeed();
  const { synchronizePlayback } = useAudioTrack();
  const { dismissFullscreenPlayer } = usePlayer();
  const [isLoading, setIsLoading] = useState(true);
  const [resizeMode, setResizeMode] = useState(ResizeMode.CONTAIN);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const router = useRouter();

  const scale = useSharedValue(1);

  const state = usePlayerStore((state) => state.interface.state);
  const isIdle = usePlayerStore((state) => state.interface.isIdle);
  const stream = usePlayerStore((state) => state.interface.currentStream);
  const selectedAudioTrack = useAudioTrackStore((state) => state.selectedTrack);
  const videoRef = usePlayerStore((state) => state.videoRef);
  const asset = usePlayerStore((state) => state.asset);
  const setVideoRef = usePlayerStore((state) => state.setVideoRef);
  const videoSrc = usePlayerStore((state) => state.videoSrc) ?? undefined;
  const setVideoSrc = usePlayerStore((state) => state.setVideoSrc);
  const setStatus = usePlayerStore((state) => state.setStatus);
  const setIsIdle = usePlayerStore((state) => state.setIsIdle);
  const toggleAudio = usePlayerStore((state) => state.toggleAudio);
  const toggleState = usePlayerStore((state) => state.toggleState);
  const meta = usePlayerStore((state) => state.meta);
  const setMeta = usePlayerStore((state) => state.setMeta);

  const { gestureControls, autoPlay } = usePlayerSettingsStore();
  const { updateWatchHistory, removeFromWatchHistory, getWatchHistoryItem } =
    useWatchHistoryStore();

  const updateResizeMode = (newMode: ResizeMode) => {
    setResizeMode(newMode);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const pinchGesture = Gesture.Pinch().onUpdate((e) => {
    scale.value = e.scale;
    if (scale.value > 1 && resizeMode !== ResizeMode.COVER) {
      runOnJS(updateResizeMode)(ResizeMode.COVER);
    } else if (scale.value <= 1 && resizeMode !== ResizeMode.CONTAIN) {
      runOnJS(updateResizeMode)(ResizeMode.CONTAIN);
    }
  });

  const doubleTapGesture = Gesture.Tap()
    .enabled(gestureControls && isIdle)
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(toggleAudio)();
      runOnJS(toggleState)();
    });

  const screenHalfWidth = Dimensions.get("window").width / 2;

  const panGesture = Gesture.Pan()
    .enabled(gestureControls && isIdle)
    .onStart((event) => {
      if (event.x > screenHalfWidth) {
        runOnJS(setShowVolumeOverlay)(true);
      } else {
        runOnJS(setShowBrightnessOverlay)(true);
      }
    })
    .onUpdate((event) => {
      const divisor = 5000;
      const directionMultiplier = event.velocityY < 0 ? 1 : -1;

      const change = directionMultiplier * Math.abs(event.velocityY / divisor);

      if (event.x > screenHalfWidth) {
        const newVolume = Math.max(0, Math.min(1, volume.value + change));
        volume.value = newVolume;
      } else {
        const newBrightness = Math.max(
          0,
          Math.min(1, brightness.value + change),
        );
        brightness.value = newBrightness;
        runOnJS(handleBrightnessChange)(newBrightness);
      }
    })
    .onEnd((event) => {
      if (event.x > screenHalfWidth) {
        runOnJS(setShowVolumeOverlay)(false);
      } else {
        runOnJS(setShowBrightnessOverlay)(false);
      }
    });

  const composedGesture = Gesture.Race(
    panGesture,
    pinchGesture,
    doubleTapGesture,
  );

  StatusBar.setStatusBarHidden(true);

  if (Platform.OS === "android") {
    void NavigationBar.setVisibilityAsync("hidden");
  }

  useEffect(() => {
    const initializePlayer = async () => {
      if (asset) {
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
        if (!assetInfo.localUri) return;
        setVideoSrc({
          uri: assetInfo.localUri,
        });
        setIsLoading(false);
        return;
      }

      if (!stream) {
        await dismissFullscreenPlayer();
        return router.back();
      }
      setIsLoading(true);

      let url = null;

      if (stream.type === "hls") {
        url = stream.playlist;
      }

      if (stream.type === "file") {
        const highestQuality = findHighestQuality(stream);
        url = highestQuality ? stream.qualities[highestQuality]?.url : null;
      }

      if (!url) {
        await dismissFullscreenPlayer();
        return router.back();
      }

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
    void initializePlayer();

    const timeout = setTimeout(() => {
      if (!hasStartedPlaying) {
        router.back();
      }
    }, 60000);

    return () => {
      if (meta) {
        const item = convertMetaToItemData(meta);
        const scrapeMedia = convertMetaToScrapeMedia(meta);
        updateWatchHistory(
          item,
          scrapeMedia,
          videoRef?.props.positionMillis ?? 0,
        );
      }
      clearTimeout(timeout);
      void synchronizePlayback();
    };
  }, [
    asset,
    dismissFullscreenPlayer,
    hasStartedPlaying,
    meta,
    router,
    selectedAudioTrack,
    setVideoSrc,
    stream,
    synchronizePlayback,
    updateWatchHistory,
    videoRef?.props.positionMillis,
  ]);

  const onVideoLoadStart = () => {
    setIsLoading(true);
  };

  const onReadyForDisplay = () => {
    setIsLoading(false);
    setHasStartedPlaying(true);
    if (videoRef) {
      void videoRef.setRateAsync(currentSpeed, true);

      if (meta) {
        const media = convertMetaToScrapeMedia(meta);
        const watchHistoryItem = getWatchHistoryItem(media);

        if (watchHistoryItem) {
          void videoRef.setPositionAsync(watchHistoryItem.positionMillis);
        }
      }
    }
  };

  const onPlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
    setStatus(status);
    if (meta && status.isLoaded && status.didJustFinish) {
      const item = convertMetaToItemData(meta);
      removeFromWatchHistory(item);
    }
    if (
      status.isLoaded &&
      status.didJustFinish &&
      !status.isLooping &&
      autoPlay
    ) {
      if (meta?.type !== "show") return;
      const nextEpisodeMeta = await getNextEpisode(meta);
      if (!nextEpisodeMeta) return;
      setMeta(nextEpisodeMeta);
      const media = convertMetaToScrapeMedia(nextEpisodeMeta);

      router.replace({
        pathname: "/videoPlayer",
        params: { media: JSON.stringify(media) },
      });
    }
  };

  return (
    <GestureDetector gesture={composedGesture}>
      <View
        flex={1}
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        backgroundColor="black"
      >
        <Video
          ref={setVideoRef}
          source={videoSrc}
          shouldPlay={state === "playing"}
          resizeMode={resizeMode}
          volume={volume.value}
          rate={currentSpeed}
          onLoadStart={onVideoLoadStart}
          onReadyForDisplay={onReadyForDisplay}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              ...(!isIdle && {
                opacity: 0.7,
              }),
            },
          ]}
          onTouchStart={() => setIsIdle(!isIdle)}
        />
        <View
          height="100%"
          width="100%"
          alignItems="center"
          justifyContent="center"
        >
          {isLoading && (
            <Spinner
              size="large"
              color="$loadingIndicator"
              position="absolute"
            />
          )}
          <ControlsOverlay isLoading={isLoading} isLocalAsset={!!asset} />
        </View>
        {showVolumeOverlay && <GestureOverlay value={volume} type="volume" />}
        {showBrightnessOverlay && (
          <GestureOverlay value={brightness} type="brightness" />
        )}
        <CaptionRenderer />
      </View>
    </GestureDetector>
  );
};

function GestureOverlay(props: {
  value: SharedValue<number>;
  type: "brightness" | "volume";
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: `${props.value.value * 100}%`,
      borderTopLeftRadius: props.value.value >= 0.98 ? 44 : 0,
      borderTopRightRadius: props.value.value >= 0.98 ? 44 : 0,
    };
  });

  return (
    <View
      position="absolute"
      left={props.type === "brightness" ? insets.left + 20 : undefined}
      right={props.type === "volume" ? insets.right + 20 : undefined}
      borderRadius="$4"
      gap={8}
      height="50%"
    >
      <Feather
        size={24}
        color="white"
        style={{
          bottom: 20,
        }}
        name={props.type === "brightness" ? "sun" : "volume-2"}
      />
      <View
        width={14}
        backgroundColor={theme.progressBackground}
        justifyContent="flex-end"
        borderRadius="$4"
        left={4}
        bottom={20}
        height="100%"
      >
        <Animated.View
          style={[
            animatedStyle,
            {
              width: "100%",
              backgroundColor: theme.progressFilled.val,
              borderBottomRightRadius: 44,
              borderBottomLeftRadius: 44,
            },
          ]}
        />
      </View>
    </View>
  );
}
