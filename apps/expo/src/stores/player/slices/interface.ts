import type { HLSTracks, Stream } from "@movie-web/provider-utils";
import type { SeasonDetails } from "@movie-web/tmdb";

import type { MakeSlice } from "./types";
import type { ItemData } from "~/components/item/item";
import type { AudioTrack } from "~/components/player/AudioTrackSelector";

export enum PlayerStatus {
  SCRAPING,
  READY,
}

type PlayerState = "playing" | "paused";

export interface InterfaceSlice {
  interface: {
    state: PlayerState;
    isIdle: boolean;
    idleTimeout: NodeJS.Timeout | null;
    currentStream: Stream | null;
    availableStreams: Stream[] | null;
    sourceId: string | null;
    data: ItemData | null;
    seasonData: SeasonDetails | null;
    selectedCaption: Stream["captions"][0] | null;
    hlsTracks: HLSTracks | null;
    audioTracks: AudioTrack[] | null;
    playerStatus: PlayerStatus;
  };
  toggleState(): void;
  setIsIdle(state: boolean): void;
  setCurrentStream(stream: Stream): void;
  setAvailableStreams(streams: Stream[]): void;
  setSourceId(sourceId: string): void;
  setData(data: ItemData): void;
  setSeasonData(data: SeasonDetails): void;
  setHlsTracks(tracks: HLSTracks): void;
  setAudioTracks(tracks: AudioTrack[]): void;
  setPlayerStatus(status: PlayerStatus): void;
  reset: () => void;
}

export const createInterfaceSlice: MakeSlice<InterfaceSlice> = (set, get) => ({
  interface: {
    state: "playing",
    isIdle: true,
    idleTimeout: null,
    currentStream: null,
    availableStreams: null,
    sourceId: null,
    data: null,
    seasonData: null,
    selectedCaption: null,
    hlsTracks: null,
    audioTracks: null,
    playerStatus: PlayerStatus.SCRAPING,
  },
  toggleState: () => {
    set((s) => {
      s.interface.state =
        s.interface.state === "playing" ? "paused" : "playing";
    });
  },
  setIsIdle: (state) => {
    set((s) => {
      if (s.interface.idleTimeout) clearTimeout(s.interface.idleTimeout);

      s.interface.idleTimeout = setTimeout(() => {
        if (get().interface.isIdle === false) {
          set((s) => {
            s.interface.isIdle = true;
          });
        }
      }, 6000);

      s.interface.isIdle = state;
    });
  },
  setCurrentStream: (stream) => {
    set((s) => {
      s.interface.currentStream = stream;
    });
  },
  setAvailableStreams: (streams) => {
    set((s) => {
      s.interface.availableStreams = streams;
    });
  },
  setSourceId: (sourceId: string) => {
    set((s) => {
      s.interface.sourceId = sourceId;
    });
  },
  setData: (data: ItemData) => {
    set((s) => {
      s.interface.data = data;
    });
  },
  setSeasonData: (data: SeasonDetails) => {
    set((s) => {
      s.interface.seasonData = data;
    });
  },
  setHlsTracks: (tracks) => {
    set((s) => {
      s.interface.hlsTracks = tracks;
    });
  },
  setAudioTracks: (tracks) => {
    set((s) => {
      s.interface.audioTracks = tracks;
    });
  },
  setPlayerStatus: (status) => {
    set((s) => {
      s.interface.playerStatus = status;
    });
  },
  reset: () => {
    set(() => ({
      interface: {
        state: "playing",
        isIdle: true,
        idleTimeout: null,
        currentStream: null,
        availableStreams: null,
        sourceId: null,
        data: null,
        seasonData: null,
        selectedCaption: null,
        hlsTracks: null,
        audioTracks: null,
        playerStatus: PlayerStatus.SCRAPING,
      },
    }));
  },
});
