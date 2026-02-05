import React from "react";
import { Pressable } from "react-native";
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
        bottom,
        right,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.foreground,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <PlusIcon color={theme.background} size={22} />
    </Pressable>
  );
}
