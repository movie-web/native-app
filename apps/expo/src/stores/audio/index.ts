import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { AudioTrack } from "~/components/player/AudioTrackSelector";

export interface AudioTrackStore {
  selectedTrack: AudioTrack | null;
  setSelectedAudioTrack(track: AudioTrack | null): void;
}

export const useAudioTrackStore = create(
  immer<AudioTrackStore>((set) => ({
    selectedTrack: null,
    setSelectedAudioTrack: (track) => {
      set((state) => {
        state.selectedTrack = track;
      });
    },
  })),
);
