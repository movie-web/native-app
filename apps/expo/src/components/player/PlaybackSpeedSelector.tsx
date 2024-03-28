import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "tamagui";

import { usePlaybackSpeed } from "~/hooks/player/usePlaybackSpeed";
import { MWButton } from "../ui/Button";
import { Controls } from "./Controls";
import { Settings } from "./settings/Sheet";

export const PlaybackSpeedSelector = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const { currentSpeed, changePlaybackSpeed } = usePlaybackSpeed();

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <>
      <Controls>
        <MWButton
          type="secondary"
          icon={
            <MaterialCommunityIcons
              name="speedometer"
              size={24}
              color={theme.buttonSecondaryText.val}
            />
          }
          onPress={() => setOpen(true)}
        >
          Playback
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
            title="Playback settings"
          />
          <Settings.Content>
            {speeds.map((speed) => (
              <Settings.Item
                key={speed}
                title={`${speed}x`}
                iconRight={
                  speed === currentSpeed && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={24}
                      color={theme.sheetItemSelected.val}
                    />
                  )
                }
                onPress={() => {
                  changePlaybackSpeed(speed)
                    .then(() => setOpen(false))
                    .catch((err) => {
                      console.log("error", err);
                    });
                }}
              />
            ))}
          </Settings.Content>
        </Settings.SheetFrame>
      </Settings.Sheet>
    </>
  );
};
