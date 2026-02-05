import React from "react";
import { View, Text, Pressable } from "react-native";
import { fonts, colors } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

interface ConfirmDialogProps {
  visible: boolean;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  visible,
  message,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  isDestructive = true,
}: ConfirmDialogProps) {
  const { theme } = useAppTheme();

  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          backgroundColor: theme.surface,
          borderRadius: 12,
          padding: 24,
          marginHorizontal: 40,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            color: theme.foreground,
            marginBottom: 20,
            textAlign: "center",
            ...fonts.medium,
          }}
        >
          {message}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 24 }}>
          <Pressable onPress={onCancel}>
            <Text style={{ color: theme.foreground, fontSize: 16, ...fonts.regular }}>
              {cancelLabel}
            </Text>
          </Pressable>
          <Pressable onPress={onConfirm}>
            <Text
              style={{
                color: isDestructive ? colors.danger : theme.foreground,
                fontSize: 16,
                ...fonts.medium,
              }}
            >
              {confirmLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
