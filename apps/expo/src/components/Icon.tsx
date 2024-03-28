import React from "react";
import Svg, { G, Path } from "react-native-svg";

export const MovieWebSvg = ({ fillColor }: { fillColor?: string }) => {
  const svgPath =
    "M18.186,4.5V6.241H16.445V4.5H9.482V6.241H7.741V4.5H6V20.168H7.741V18.427H9.482v1.741h6.964V18.427h1.741v1.741h1.741V4.5Zm-8.7,12.186H7.741V14.945H9.482Zm0-3.482H7.741V11.464H9.482Zm0-3.482H7.741V7.982H9.482Zm8.7,6.964H16.445V14.945h1.741Zm0-3.482H16.445V11.464h1.741Zm0-3.482H16.445V7.982h1.741Z";

  return (
    <Svg width="24" height="24" viewBox="0 0 20.927 20.927" fill={fillColor}>
      <G transform="translate(10.018 -7.425) rotate(45)">
        <Path d={svgPath} />
      </G>
    </Svg>
  );
};
