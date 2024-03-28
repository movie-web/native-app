import type { StateCreator } from "zustand";

import type { AudioSlice } from "./audio";
import type { InterfaceSlice } from "./interface";
import type { VideoSlice } from "./video";

export type AllSlices = InterfaceSlice & VideoSlice & AudioSlice;

export type MakeSlice<Slice> = StateCreator<
  AllSlices,
  [["zustand/immer", never]],
  [],
  Slice
>;
