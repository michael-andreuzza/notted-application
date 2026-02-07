import React from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import { colors } from "@/constants/theme";
import { scale } from "@/constants/responsive";
import { useAppTheme } from "@/hooks/useAppTheme";

type IconButtonVariant = "default" | "muted" | "destructive";
type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps {
  onPress: () => void;
  icon: (color: string, size: number) => React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  background?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  hitSlop?: { top?: number; bottom?: number; left?: number; right?: number };
  iconSize?: number;
}

const sizeStyles: Record<IconButtonSize, { button: number; icon: number; radius: number }> = {
  sm: { button: scale(32), icon: scale(16), radius: scale(16) },
  md: { button: scale(40), icon: scale(20), radius: scale(20) },
  lg: { button: scale(56), icon: scale(24), radius: scale(28) },
};

export function IconButton({
  onPress,
  icon,
  variant = "default",
  size = "md",
  background = false,
  disabled,
  style,
  hitSlop,
  iconSize,
}: IconButtonProps) {
  const { theme } = useAppTheme();
  const sizes = sizeStyles[size];

  const variantColors = {
    default: { backgroundColor: theme.foreground, iconColor: theme.background },
    muted: { backgroundColor: theme.surfaceAlt, iconColor: theme.foreground },
    destructive: { backgroundColor: "rgba(255, 68, 68, 0.08)", iconColor: colors.danger },
  }[variant];

  const iconColor = background
    ? variantColors.iconColor
    : variant === "destructive"
      ? colors.danger
      : theme.foreground;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      style={[
        {
          width: background ? sizes.button : undefined,
          height: background ? sizes.button : undefined,
          borderRadius: background ? sizes.radius : undefined,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: background ? variantColors.backgroundColor : "transparent",
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {icon(iconColor, iconSize ?? sizes.icon)}
    </Pressable>
  );
}
