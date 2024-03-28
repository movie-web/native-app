import React from "react";
import { useTheme } from "tamagui";

interface SvgTabBarIconProps {
  focused?: boolean;
  children: React.ReactElement;
}

export default function SvgTabBarIcon({
  focused,
  children,
}: SvgTabBarIconProps) {
  const theme = useTheme();
  const fillColor = focused
    ? theme.tabBarIconFocused.val
    : theme.tabBarIcon.val;

  if (React.isValidElement(children)) {
    return React.cloneElement(children, { fillColor } as React.Attributes);
  }

  return null;
}
