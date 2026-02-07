import React from "react";
import { View } from "react-native";
import { scale } from "@/constants/responsive";

interface TopBarProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  paddingHorizontal?: number;
  marginBottom?: number;
}

export function TopBar({
  left,
  center,
  right,
  paddingHorizontal = scale(16),
  marginBottom = scale(16),
}: TopBarProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal,
        paddingVertical: 8,
        marginBottom,
      }}
    >
      {left}
      {center}
      {right}
    </View>
  );
}
