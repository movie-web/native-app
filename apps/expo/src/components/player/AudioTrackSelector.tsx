import { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "tamagui";

import { useAudioTrack } from "~/hooks/player/useAudioTrack";
import { useAudioTrackStore } from "~/stores/audio";
import { usePlayerStore } from "~/stores/player/store";
import { MWButton } from "../ui/Button";
import { Controls } from "./Controls";
import { Settings } from "./settings/Sheet";

export interface AudioTrack {
  uri: string;
  name: string;
  language: string;
  active?: boolean;
}

export const AudioTrackSelector = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const tracks = usePlayerStore((state) => state.interface.audioTracks);
  const setAudioTracks = usePlayerStore((state) => state.setAudioTracks);
  const stream = usePlayerStore((state) => state.interface.currentStream);
  const selectedTrack = useAudioTrackStore((state) => state.selectedTrack);

  const setSelectedAudioTrack = useAudioTrackStore(
    (state) => state.setSelectedAudioTrack,
  );

  const { synchronizePlayback } = useAudioTrack();

  useEffect(() => {
    if (tracks && selectedTrack) {
      const needsUpdate = tracks.some(
        (t) => t.active !== (t.uri === selectedTrack.uri),
      );

      if (needsUpdate) {
        const updatedTracks = tracks.map((t) => ({
          ...t,
          active: t.uri === selectedTrack.uri,
        }));
        setAudioTracks(updatedTracks);
      }
    }
  }, [selectedTrack, setAudioTracks, tracks]);

  if (!tracks?.length) return null;

  return (
    <>
      <Controls>
        <MWButton
          type="secondary"
          icon={
            <MaterialCommunityIcons
              name="volume-high"
              size={24}
              color={theme.buttonSecondaryText.val}
            />
          }
          onPress={() => setOpen(true)}
        >
          Audio
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
            title="Audio"
          />
          <Settings.Content>
            {tracks?.map((track) => (
              <Settings.Item
                key={track.language}
                title={track.name}
                iconRight={
                  track.active && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={24}
                      color={theme.playerSettingsUnactiveText.val}
                    />
                  )
                }
                onPress={() => {
                  setSelectedAudioTrack(track);
                  if (stream) {
                    void synchronizePlayback(track, stream);
                  }
                }}
              />
            ))}
          </Settings.Content>
        </Settings.SheetFrame>
      </Settings.Sheet>
    </>
  );
};
