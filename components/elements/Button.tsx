import React from "react";
import { Pressable, Text, View, ActivityIndicator, StyleProp, ViewStyle, TextStyle } from "react-native";
import { colors, fonts } from "@/constants/theme";
import { scale, fontScale } from "@/constants/responsive";
import { useAppTheme } from "@/hooks/useAppTheme";

type ButtonVariant = "default" | "muted" | "destructive";
type ButtonSize = "sm" | "md" | "lg";
type ButtonAlign = "center" | "space-between";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  align?: ButtonAlign;
  fullWidth?: boolean;
  background?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  hitSlop?: { top?: number; bottom?: number; left?: number; right?: number };
}

const sizeStyles: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number; radius: number }> = {
  sm: { paddingVertical: 10, paddingHorizontal: scale(14), fontSize: fontScale(13), radius: 16 },
  md: { paddingVertical: 12, paddingHorizontal: scale(16), fontSize: fontScale(15), radius: 20 },
  lg: { paddingVertical: scale(16), paddingHorizontal: scale(16), fontSize: fontScale(16), radius: 28 },
};

export function Button({
  title,
  onPress,
  variant = "default",
  size = "md",
  align = "center",
  fullWidth,
  background = true,
  disabled,
  loading,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  hitSlop,
}: ButtonProps) {
  const { theme } = useAppTheme();
  const sizeStyle = sizeStyles[size];

  const variantStyle = {
    default: { backgroundColor: theme.foreground, textColor: theme.background },
    muted: { backgroundColor: theme.surfaceAlt, textColor: theme.foreground },
    destructive: { backgroundColor: "rgba(255, 68, 68, 0.08)", textColor: colors.danger },
  }[variant];

  const justifyContent = align === "space-between" ? "space-between" : "center";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      hitSlop={hitSlop}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderRadius: sizeStyle.radius,
          backgroundColor: background ? variantStyle.backgroundColor : "transparent",
          opacity: disabled ? 0.6 : 1,
        },
        fullWidth ? { alignSelf: "stretch" } : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.textColor} size="small" />
      ) : (
        <>
          {leftIcon ? <View style={{ marginRight: scale(8) }}>{leftIcon}</View> : null}
          <Text
            style={[
              {
                fontSize: sizeStyle.fontSize,
                color: variantStyle.textColor,
                textAlign: "center",
                ...(align === "space-between" ? { flex: 1, textAlign: "left" as const } : null),
                ...fonts.regular,
              },
              textStyle,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          {rightIcon ? <View style={{ marginLeft: scale(8) }}>{rightIcon}</View> : null}
        </>
      )}
    </Pressable>
  );
}
