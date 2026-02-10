import React from "react";
import { X as XPhosphor } from "phosphor-react-native";

interface CloseIconProps {
  color: string;
  size?: number;
}

export function CloseIcon({ color, size = 24 }: CloseIconProps) {
  return <XPhosphor color={color} size={size} weight="regular" />;
}
