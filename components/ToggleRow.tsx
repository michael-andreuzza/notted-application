import React from "react";
import { Text, Pressable } from "react-native";
import { fonts } from "@/constants/theme";
import { scale, fontScale } from "@/constants/responsive";
import { useAppTheme } from "@/hooks/useAppTheme";
import { CheckIcon } from "@/components/icons/CheckIcon";

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
        paddingHorizontal: scale(12),
        borderRadius: 20,
        backgroundColor: isEnabled ? theme.surfaceAlt : "transparent",
      }}
    >
      <Text
        style={{
          fontSize: fontScale(15),
          color: theme.foreground,
          ...fonts.regular,
        }}
      >
        {label}
      </Text>
      {isEnabled && (
        <CheckIcon color={theme.foreground} size={scale(18)} />
      )}
    </Pressable>
  );
}
