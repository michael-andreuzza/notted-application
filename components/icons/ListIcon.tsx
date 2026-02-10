import React from "react";
import { List as ListPhosphor } from "phosphor-react-native";

interface ListIconProps {
  color: string;
  size?: number;
}

export function ListIcon({ color, size = 24 }: ListIconProps) {
  return <ListPhosphor color={color} size={size} weight="regular" />;
}
