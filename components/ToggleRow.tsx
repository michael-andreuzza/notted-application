import React from "react";
import { View, Text, Pressable } from "react-native";
import { fonts } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

interface ToggleRowProps {
  label: string;
  isEnabled: boolean;
  onToggle: () => void;
}

export function ToggleRow({ label, isEnabled, onToggle }: ToggleRowProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      onPress={onToggle}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: isEnabled ? theme.card : "transparent",
      }}
    >
      <Text
        style={{
          fontSize: 15,
          color: theme.foreground,
          ...fonts.regular,
        }}
      >
        {label}
      </Text>
      {isEnabled && (
        <Text
          style={{
            fontSize: 15,
            color: theme.foreground,
            ...fonts.regular,
          }}
        >
          ✓
        </Text>
      )}
    </Pressable>
  );
}
