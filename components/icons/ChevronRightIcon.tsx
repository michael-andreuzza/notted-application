import React from "react";
import { CaretRight as CaretRightPhosphor } from "phosphor-react-native";

interface ChevronRightIconProps {
  color: string;
  size?: number;
}

export function ChevronRightIcon({ color, size = 24 }: ChevronRightIconProps) {
  return <CaretRightPhosphor color={color} size={size} weight="regular" />;
}
