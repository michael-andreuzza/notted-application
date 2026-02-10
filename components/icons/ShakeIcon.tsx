import React from "react";
import { DeviceMobile as DeviceMobilePhosphor } from "phosphor-react-native";

interface ShakeIconProps {
  color: string;
  size?: number;
}

export function ShakeIcon({ color, size = 24 }: ShakeIconProps) {
  return <DeviceMobilePhosphor color={color} size={size} weight="regular" />;
}
