import React from "react";
import Svg, { Path } from "react-native-svg";

interface CheckIconProps {
  color: string;
  size?: number;
}

export function CheckIcon({ color, size = 24 }: CheckIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17L4 12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
