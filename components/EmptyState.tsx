import React from "react";
import { View, Text, Pressable } from "react-native";
import { fonts } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { PlusIcon } from "@/components/icons/PlusIcon";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  onAction?: () => void;
}

export function EmptyState({ title, subtitle, onAction }: EmptyStateProps) {
  const { isDark, theme } = useAppTheme();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text
        style={{
          fontSize: 28,
          color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
          ...fonts.regular,
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{
            fontSize: 16,
            color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
            marginTop: 8,
            ...fonts.regular,
          }}
        >
          {subtitle}
        </Text>
      )}
      {onAction && (
        <Pressable
          onPress={onAction}
          style={{
            marginTop: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: theme.foreground,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <PlusIcon color={theme.background} size={28} />
        </Pressable>
      )}
    </View>
  );
}
