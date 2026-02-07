import React from "react";
import { scale } from "@/constants/responsive";
import { PlusIcon } from "@/components/icons/PlusIcon";
import { IconButton } from "@/components/IconButton";

interface FloatingAddButtonProps {
  onPress: () => void;
  bottom?: number;
  right?: number;
}

export function FloatingAddButton({ 
  onPress, 
  bottom = 48,
  right = 24,
}: FloatingAddButtonProps) {
  return (
    <IconButton
      onPress={onPress}
      size="md"
      variant="default"
      background
      style={{
        position: "absolute",
        bottom: scale(bottom),
        right: scale(right),
      }}
      icon={(color, size) => <PlusIcon color={color} size={size} />}
      iconSize={scale(22)}
    />
  );
}
