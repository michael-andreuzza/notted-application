import React from "react";
import Svg, { Path } from "react-native-svg";

interface ArrowDownIconProps {
  color: string;
  size?: number;
}

export function ArrowDownIcon({ color, size = 24 }: ArrowDownIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5V19M12 19L19 12M12 19L5 12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
