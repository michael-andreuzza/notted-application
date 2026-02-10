import React from "react";
import { FileText as FileTextPhosphor } from "phosphor-react-native";

interface FileIconProps {
  color: string;
  size?: number;
}

export function FileIcon({ color, size = 24 }: FileIconProps) {
  return <FileTextPhosphor color={color} size={size} weight="regular" />;
}
