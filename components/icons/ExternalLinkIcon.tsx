import React from "react";
import { ArrowSquareOut as ArrowSquareOutPhosphor } from "phosphor-react-native";

interface ExternalLinkIconProps {
  color: string;
  size?: number;
}

export function ExternalLinkIcon({ color, size = 24 }: ExternalLinkIconProps) {
  return <ArrowSquareOutPhosphor color={color} size={size} weight="regular" />;
}
