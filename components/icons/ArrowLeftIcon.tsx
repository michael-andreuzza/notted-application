import React from "react";
import Svg, { Path } from "react-native-svg";

interface ArrowLeftIconProps {
  color: string;
  size?: number;
}

export function ArrowLeftIcon({ color, size = 24 }: ArrowLeftIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18L9 12L15 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
