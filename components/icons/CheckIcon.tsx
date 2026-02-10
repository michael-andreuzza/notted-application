import React from "react";
import { Check as CheckPhosphor } from "phosphor-react-native";

interface CheckIconProps {
  color: string;
  size?: number;
}

export function CheckIcon({ color, size = 24 }: CheckIconProps) {
  return <CheckPhosphor color={color} size={size} weight="regular" />;
}
