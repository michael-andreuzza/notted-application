import React from "react";
import { TrashSimple as TrashSimplePhosphor } from "phosphor-react-native";

interface TrashIconProps {
  color: string;
  size?: number;
}

export function TrashIcon({ color, size = 24 }: TrashIconProps) {
  return <TrashSimplePhosphor color={color} size={size} weight="regular" />;
}
