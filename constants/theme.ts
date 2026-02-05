export const colors = {
  light: {
    background: "#FAFAFA",
    foreground: "#010101",
  },
  dark: {
    background: "#010101",
    foreground: "#FAFAFA",
  },
} as const;

export const fonts = {
  regular: {
    fontFamily: "Inter_400Regular",
  },
  medium: {
    fontFamily: "Inter_500Medium",
  },
  semibold: {
    fontFamily: "Inter_600SemiBold",
  },
  bold: {
    fontFamily: "Inter_700Bold",
  },
};

export type ThemeColors = typeof colors.light;
