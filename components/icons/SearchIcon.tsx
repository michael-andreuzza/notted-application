import React from "react";
import { MagnifyingGlass as MagnifyingGlassPhosphor } from "phosphor-react-native";

interface SearchIconProps {
  color: string;
  size?: number;
}

export function SearchIcon({ color, size = 24 }: SearchIconProps) {
  return <MagnifyingGlassPhosphor color={color} size={size} weight="regular" />;
}
