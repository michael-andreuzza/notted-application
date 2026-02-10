import React from "react";
import { Text } from "react-native";
import { fonts } from "@/constants/theme";
import { fontScale } from "@/constants/responsive";
import { useAppTheme } from "@/hooks/useAppTheme";

interface SectionLabelProps {
  children: string;
}

export function SectionLabel({ children }: SectionLabelProps) {
  const { theme } = useAppTheme();

  return (
    <Text
      style={{
        fontSize: fontScale(12),
        color: theme.foreground,
        opacity: 0.7,
        marginBottom: 8,
        ...fonts.medium,
      }}
    >
      {children}
    </Text>
  );
}
