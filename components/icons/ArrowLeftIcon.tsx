import React from "react";
import { ArrowLeft as ArrowLeftPhosphor } from "phosphor-react-native";

interface ArrowLeftIconProps {
  color: string;
  size?: number;
}

export function ArrowLeftIcon({ color, size = 24 }: ArrowLeftIconProps) {
  return <ArrowLeftPhosphor color={color} size={size} weight="regular" />;
}
