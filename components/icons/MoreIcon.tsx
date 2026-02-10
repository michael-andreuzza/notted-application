import React from "react";
import { DotsThreeVertical as DotsThreeVerticalPhosphor } from "phosphor-react-native";

interface MoreIconProps {
  color: string;
  size?: number;
}

export function MoreIcon({ color, size = 24 }: MoreIconProps) {
  return <DotsThreeVerticalPhosphor color={color} size={size} weight="regular" />;
}
