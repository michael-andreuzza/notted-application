import React from "react";
import { View, Text } from "react-native";
import { fonts } from "@/constants/theme";
import { scale, fontScale } from "@/constants/responsive";
import { useAppTheme } from "@/hooks/useAppTheme";
import { PlusIcon } from "../icons/PlusIcon";
import { IconButton } from "../elements/IconButton";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  onAction?: () => void;
}

export function EmptyState({ title, subtitle, onAction }: EmptyStateProps) {
  const { isDark } = useAppTheme();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text
        style={{
          fontSize: fontScale(28),
          color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
          letterSpacing: -0.3,
          ...fonts.medium,
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{
            fontSize: fontScale(16),
            color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
            marginTop: 8,
            ...fonts.regular,
          }}
        >
          {subtitle}
        </Text>
      )}
      {onAction && (
        <IconButton
          onPress={onAction}
          size="lg"
          variant="default"
          background
          style={{ marginTop: scale(24) }}
          icon={(color, size) => <PlusIcon color={color} size={size} />}
          iconSize={scale(28)}
        />
      )}
    </View>
  );
}
