import type { ViewProps } from "tamagui";
import React from "react";
import { View } from "tamagui";

import { usePlayerStore } from "~/stores/player/store";

interface ControlsProps extends ViewProps {
  children: React.ReactNode;
}

export const Controls = ({ children, ...props }: ControlsProps) => {
  const idle = usePlayerStore((state) => state.interface.isIdle);
  return <View {...props}>{!idle && children}</View>;
};
