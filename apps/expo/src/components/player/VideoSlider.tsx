import type {
  HandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
  TapGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import React, { useEffect, useRef } from "react";
import { Dimensions } from "react-native";
import {
  PanGestureHandler,
  State,
  TapGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useTheme, View } from "tamagui";

import { usePlayerStore } from "~/stores/player/store";

const clamp = (value: number, lowerBound: number, upperBound: number) => {
  "worklet";
  return Math.min(Math.max(lowerBound, value), upperBound);
};

interface VideoSliderProps {
  onSlidingComplete?: (value: number) => void;
}

const VideoSlider = ({ onSlidingComplete }: VideoSliderProps) => {
  const theme = useTheme();
  const tapRef = useRef<TapGestureHandler>(null);
  const panRef = useRef<PanGestureHandler>(null);
  const status = usePlayerStore((state) => state.status);
  const setIsIdle = usePlayerStore((state) => state.setIsIdle);

  const width = Dimensions.get("screen").width - 120;
  const knobSize_ = 20;
  const trackSize_ = 8;
  const minimumValue = 0;
  const maximumValue = status?.isLoaded ? status.durationMillis! : 0;
  const value = status?.isLoaded ? status.positionMillis : 0;

  const valueToX = (v: number) => {
    if (maximumValue === minimumValue) return 0;
    return (width * (v - minimumValue)) / (maximumValue - minimumValue);
  };
  const xToValue = (x: number) => {
    "worklet";
    if (maximumValue === minimumValue) return minimumValue;
    return (x / width) * (maximumValue - minimumValue) + minimumValue;
  };
  const valueX = valueToX(value);
  const translateX = useSharedValue(valueToX(value));
  const isDragging = useSharedValue(false);

  useEffect(() => {
    if (!isDragging.value) {
      translateX.value = clamp(valueX, 0, width - knobSize_);
    }
  }, [valueX, isDragging.value, translateX, width]);

  const _onSlidingComplete = (xValue: number) => {
    "worklet";
    if (onSlidingComplete) runOnJS(onSlidingComplete)(xToValue(xValue));
  };

  const _onActive = (value: number) => {
    "worklet";
    isDragging.value = true;
    translateX.value = clamp(value, 0, width - knobSize_);
    runOnJS(setIsIdle)(false);
  };

  const _onEnd = () => {
    "worklet";
    isDragging.value = false;
    _onSlidingComplete(translateX.value);
  };

  const onGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { offsetX: number }
  >({
    onStart: (_, ctx) => (ctx.offsetX = translateX.value),
    onActive: (event, ctx) => _onActive(event.translationX + ctx.offsetX),
    onEnd: _onEnd,
    onCancel: _onEnd,
    onFinish: _onEnd,
  });

  const onTapEvent = (
    event: HandlerStateChangeEvent<TapGestureHandlerEventPayload>,
  ) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      _onActive(event.nativeEvent.x);
      _onSlidingComplete(event.nativeEvent.x);
    }
  };

  const scrollTranslationStyle = useAnimatedStyle(() => {
    return { transform: [{ translateX: translateX.value }] };
  });

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: translateX.value + knobSize_,
    };
  });

  return (
    <TapGestureHandler
      ref={tapRef}
      onHandlerStateChange={onTapEvent}
      simultaneousHandlers={panRef}
    >
      <View
        style={[
          {
            alignItems: "center",
            justifyContent: "center",
            height: knobSize_,
            width,
          },
        ]}
      >
        <View
          style={[
            {
              height: trackSize_,
              borderRadius: trackSize_,
              backgroundColor: theme.videoSlider.val,
              width,
              justifyContent: "center",
            },
          ]}
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                height: trackSize_,
                backgroundColor: theme.videoSliderFilled.val,
                borderRadius: trackSize_ / 2,
              },
              progressStyle,
            ]}
          />
          <PanGestureHandler
            ref={panRef}
            onGestureEvent={onGestureEvent}
            simultaneousHandlers={tapRef}
          >
            <Animated.View
              style={[
                {
                  justifyContent: "center",
                  alignItems: "center",
                  height: knobSize_,
                  width: knobSize_,
                  borderRadius: knobSize_ / 2,
                  backgroundColor: theme.videoSliderFilled.val,
                },
                scrollTranslationStyle,
              ]}
            />
          </PanGestureHandler>
        </View>
      </View>
    </TapGestureHandler>
  );
};

export default VideoSlider;
