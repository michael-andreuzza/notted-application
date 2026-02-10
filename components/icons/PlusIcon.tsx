import React from "react";
import { Plus as PlusPhosphor } from "phosphor-react-native";

interface PlusIconProps {
  color: string;
  size?: number;
}

export function PlusIcon({ color, size = 24 }: PlusIconProps) {
  return <PlusPhosphor color={color} size={size} weight="regular" />;
}
