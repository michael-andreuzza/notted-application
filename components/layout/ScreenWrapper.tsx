import React from "react";
import { View, KeyboardAvoidingView, Platform, ViewStyle } from "react-native";
import { scale } from "@/constants/responsive";
import { useAppTheme } from "@/hooks/useAppTheme";

interface ScreenWrapperProps {
  children: React.ReactNode;
  keyboard?: boolean;
  style?: ViewStyle;
}

export function ScreenWrapper({
  children,
  keyboard = false,
  style,
}: ScreenWrapperProps) {
  const { theme } = useAppTheme();

  if (keyboard) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.background }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={[{ flex: 1, paddingTop: scale(50) }, style]}>
          {children}
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View
      style={[
        { flex: 1, backgroundColor: theme.background, paddingTop: scale(50) },
        style,
      ]}
    >
      {children}
    </View>
  );
}
