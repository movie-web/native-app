import { useState } from "react";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "tamagui";

import { constructFullUrl } from "@movie-web/provider-utils";

import { usePlayerStore } from "~/stores/player/store";
import { MWButton } from "../ui/Button";
import { Controls } from "./Controls";
import { Settings } from "./settings/Sheet";

export const QualitySelector = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const videoRef = usePlayerStore((state) => state.videoRef);
  const videoSrc = usePlayerStore((state) => state.videoSrc);
  const stream = usePlayerStore((state) => state.interface.currentStream);
  const hlsTracks = usePlayerStore((state) => state.interface.hlsTracks);

  if (!videoRef || !videoSrc || !stream) return null;
  let qualityMap: { quality: string; url: string }[];
  let currentQuality: string | undefined;

  if (stream.type === "file") {
    const { qualities } = stream;

    currentQuality = Object.keys(qualities).find(
      (key) => qualities[key as keyof typeof qualities]!.url === videoSrc.uri,
    );

    qualityMap = Object.keys(qualities).map((key: string) => ({
      quality: key,
      url: qualities[key as keyof typeof qualities]!.url,
    }));
  } else if (stream.type === "hls") {
    if (!hlsTracks?.video) return null;

    qualityMap = hlsTracks.video.map((video) => ({
      quality:
        (video.properties[0]?.attributes.resolution as string) ?? "unknown",
      url: constructFullUrl(stream.playlist, video.uri),
    }));
  } else {
    return null;
  }

  return (
    <>
      <Controls>
        <MWButton
          type="secondary"
          icon={
            <MaterialIcons
              name="hd"
              size={24}
              color={theme.buttonSecondaryText.val}
            />
          }
          onPress={() => setOpen(true)}
        >
          Quality
        </MWButton>
      </Controls>

      <Settings.Sheet
        forceRemoveScrollEnabled={open}
        open={open}
        onOpenChange={setOpen}
      >
        <Settings.SheetOverlay />
        <Settings.SheetHandle />
        <Settings.SheetFrame>
          <Settings.Header
            icon={
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.playerSettingsUnactiveText.val}
                onPress={() => setOpen(false)}
              />
            }
            title="Quality settings"
          />
          <Settings.Content>
            {qualityMap?.map((quality) => (
              <Settings.Item
                key={quality.quality}
                title={quality.quality}
                iconRight={
                  quality.quality === currentQuality && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={24}
                      color={theme.sheetItemSelected.val}
                    />
                  )
                }
                onPress={() => {
                  void videoRef.unloadAsync();
                  void videoRef.loadAsync(
                    { uri: quality.url, headers: stream.headers },
                    { shouldPlay: true },
                  );
                }}
              />
            ))}
          </Settings.Content>
        </Settings.SheetFrame>
      </Settings.Sheet>
    </>
  );
};
