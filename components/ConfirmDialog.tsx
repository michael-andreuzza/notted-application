import React from "react";
import { View, Text } from "react-native";
import { fonts } from "@/constants/theme";
import { scale, fontScale } from "@/constants/responsive";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Button } from "@/components/Button";

interface ConfirmDialogProps {
  visible: boolean;
  message: string;
  description?: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  visible,
  message,
  description,
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
          borderRadius: 20,
          padding: scale(24),
          width: "85%",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Text
          style={{
            fontSize: fontScale(18),
            color: theme.foreground,
            marginBottom: description ? scale(8) : scale(20),
            textAlign: "center",
            ...fonts.medium,
          }}
        >
          {message}
        </Text>
        {description && (
          <Text
            style={{
              fontSize: fontScale(14),
              color: theme.foreground,
              opacity: 0.6,
              textAlign: "center",
              marginBottom: scale(16),
              ...fonts.regular,
            }}
          >
            {description}
          </Text>
        )}
        <View style={{ flexDirection: "row", gap: 8, marginTop: scale(20) }}>
          <Button
            title={cancelLabel}
            onPress={onCancel}
            variant="muted"
            style={{ flex: 1 }}
          />
          <Button
            title={confirmLabel}
            onPress={onConfirm}
            variant={isDestructive ? "destructive" : "default"}
            style={{ flex: 1 }}
            textStyle={fonts.medium}
          />
        </View>
      </View>
    </View>
  );
}
