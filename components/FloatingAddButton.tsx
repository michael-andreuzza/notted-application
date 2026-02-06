import React from "react";
import { Pressable } from "react-native";
import { scale } from "@/constants/responsive";
import { useAppTheme } from "@/hooks/useAppTheme";
import { PlusIcon } from "@/components/icons/PlusIcon";

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
  const { theme } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        position: "absolute",
        bottom: scale(bottom),
        right: scale(right),
        width: scale(44),
        height: scale(44),
        borderRadius: scale(22),
        backgroundColor: theme.foreground,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <PlusIcon color={theme.background} size={scale(22)} />
    </Pressable>
  );
}
