import React from "react";
import { ArrowDown as ArrowDownPhosphor } from "phosphor-react-native";

interface ArrowDownIconProps {
  color: string;
  size?: number;
}

export function ArrowDownIcon({ color, size = 24 }: ArrowDownIconProps) {
  return <ArrowDownPhosphor color={color} size={size} weight="regular" />;
}
