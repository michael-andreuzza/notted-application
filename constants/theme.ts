import { Platform } from "react-native";

export const colors = {
  light: {
    background: "#F2F2F2",
    foreground: "#010101",
    surface: "#FFFFFF",
    surfaceAlt: "#E8E8E8", // wrapper backgrounds (tabs container)
    card: "#F0F0F0", // pill/card backgrounds
    cardActive: "#FFFFFF", // active tab/pill
    muted: "#E5E5E5", // subtle borders, inactive states
    border: "#DDDDDD", // borders
    placeholder: "#BBBBBB", // placeholder text
    disabled: "#CCCCCC", // disabled states
  },
  dark: {
    background: "#121212",
    foreground: "#FAFAFA",
    surface: "#1E1E1E",
    surfaceAlt: "#1A1A1A", // wrapper backgrounds (tabs container)
    card: "#222222", // pill/card backgrounds
    cardActive: "#2A2A2A", // active tab/pill
    muted: "#333333", // subtle borders, inactive states
    border: "#333333", // borders
    placeholder: "#444444", // placeholder text
    disabled: "#444444", // disabled states
  },
  // Semantic colors (same for both themes)
  danger: "#FF4444",
  success: "#22C55E",
} as const;

const isWeb = Platform.OS === "web";

export const fonts = {
  regular: {
    fontFamily: isWeb ? "Inter, sans-serif" : "Inter_400Regular",
    fontWeight: "400" as const,
  },
  medium: {
    fontFamily: isWeb ? "Inter, sans-serif" : "Inter_500Medium",
    fontWeight: "500" as const,
  },
  semibold: {
    fontFamily: isWeb ? "Inter, sans-serif" : "Inter_600SemiBold",
    fontWeight: "600" as const,
  },
  bold: {
    fontFamily: isWeb ? "Inter, sans-serif" : "Inter_700Bold",
    fontWeight: "700" as const,
  },
};

export type ThemeColors = typeof colors.light;
