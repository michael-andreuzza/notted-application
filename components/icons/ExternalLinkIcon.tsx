import React from "react";
import Svg, { Path } from "react-native-svg";

interface ExternalLinkIconProps {
  color: string;
  size?: number;
}

export function ExternalLinkIcon({ color, size = 24 }: ExternalLinkIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 9V3H15M21 3L13 11M10 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21H17C18.1046 21 19 20.1046 19 19V14"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
