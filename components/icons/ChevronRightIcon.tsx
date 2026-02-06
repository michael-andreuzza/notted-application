import React from "react";
import Svg, { Path } from "react-native-svg";

interface ChevronRightIconProps {
  color: string;
  size?: number;
}

export function ChevronRightIcon({ color, size = 24 }: ChevronRightIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18L15 12L9 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
