import React from "react";
import Svg, { Path } from "react-native-svg";

interface PlusIconProps {
  color: string;
  size?: number;
}

export function PlusIcon({ color, size = 24 }: PlusIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5V19M5 12H19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
