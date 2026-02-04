import React from "react";
import Svg, { Path, Rect } from "react-native-svg";

interface ShakeIconProps {
  color: string;
  size?: number;
}

export function ShakeIcon({ color, size = 24 }: ShakeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Phone body */}
      <Rect
        x="7"
        y="2"
        width="10"
        height="20"
        rx="2"
        stroke={color}
        strokeWidth={2}
      />
      {/* Shake lines left */}
      <Path
        d="M4 8L2 6M4 12L1 12M4 16L2 18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Shake lines right */}
      <Path
        d="M20 8L22 6M20 12L23 12M20 16L22 18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
