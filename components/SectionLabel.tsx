import React from "react";
import { Text } from "react-native";
import { fonts } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

interface SectionLabelProps {
  children: string;
}

export function SectionLabel({ children }: SectionLabelProps) {
  const { theme } = useAppTheme();

  return (
    <Text
      style={{
        fontSize: 12,
        color: theme.foreground,
        opacity: 0.4,
        marginBottom: 8,
        ...fonts.regular,
      }}
    >
      {children}
    </Text>
  );
}
