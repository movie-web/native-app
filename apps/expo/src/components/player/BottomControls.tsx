import { useCallback, useMemo, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Text, View } from "tamagui";

import { usePlayerStore } from "~/stores/player/store";
import { AudioTrackSelector } from "./AudioTrackSelector";
import { CaptionsSelector } from "./CaptionsSelector";
import { Controls } from "./Controls";
import { DownloadButton } from "./DownloadButton";
import { PlaybackSpeedSelector } from "./PlaybackSpeedSelector";
import { ProgressBar } from "./ProgressBar";
import { QualitySelector } from "./QualitySelector";
import { SeasonSelector } from "./SeasonEpisodeSelector";
import { SourceSelector } from "./SourceSelector";
import { mapMillisecondsToTime } from "./utils";

export const BottomControls = ({ isLocalAsset }: { isLocalAsset: boolean }) => {
  const status = usePlayerStore((state) => state.status);
  const setIsIdle = usePlayerStore((state) => state.setIsIdle);
  const [showRemaining, setShowRemaining] = useState(false);

  const toggleTimeDisplay = useCallback(() => {
    setIsIdle(false);
    setShowRemaining(!showRemaining);
  }, [showRemaining, setIsIdle]);

  const { currentTime, remainingTime } = useMemo(() => {
    if (status?.isLoaded) {
      const current = mapMillisecondsToTime(status.positionMillis ?? 0);
      const remaining =
        "-" +
        mapMillisecondsToTime(
          (status.durationMillis ?? 0) - (status.positionMillis ?? 0),
        );
      return { currentTime: current, remainingTime: remaining };
    } else {
      return { currentTime: "", remainingTime: "" };
    }
  }, [status]);

  const durationTime = useMemo(() => {
    if (status?.isLoaded) {
      return mapMillisecondsToTime(status.durationMillis ?? 0);
    }
  }, [status]);

  if (status?.isLoaded) {
    return (
      <View
        height={128}
        width="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        padding={24}
      >
        <Controls>
          <View flexDirection="row" justifyContent="space-between" width="$11">
            <Text fontWeight="bold">{currentTime}</Text>
            <Text marginHorizontal={1} fontWeight="bold">
              /
            </Text>
            <TouchableOpacity onPress={toggleTimeDisplay}>
              <Text fontWeight="bold">
                {showRemaining ? remainingTime : durationTime}
              </Text>
            </TouchableOpacity>
          </View>

          <ProgressBar />
        </Controls>
        <View
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          gap={4}
          paddingBottom={40}
        >
          {!isLocalAsset && (
            <>
              <SeasonSelector />
              <CaptionsSelector />
              <SourceSelector />
              <AudioTrackSelector />
              <PlaybackSpeedSelector />
              <QualitySelector />
              <DownloadButton />
            </>
          )}
        </View>
      </View>
    );
  }
};
