import type { ContentCaption } from "subsrt-ts/dist/types/handler";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { Stream } from "@movie-web/provider-utils";

export type CaptionWithData = Stream["captions"][0] & {
  data: ContentCaption[];
};

export interface CaptionsStore {
  selectedCaption: CaptionWithData | null;
  delay: number;
  setSelectedCaption(caption: CaptionWithData | null): void;
  setDelay(delay: number): void;
}

export const useCaptionsStore = create(
  immer<CaptionsStore>((set) => ({
    selectedCaption: null,
    delay: 0,
    setSelectedCaption: (caption) => {
      set((s) => {
        s.selectedCaption = caption;
      });
    },
    setDelay: (delay) => {
      set((s) => {
        s.delay = delay;
      });
    },
  })),
);
