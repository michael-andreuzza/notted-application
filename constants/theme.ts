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
    fontFamily: "System",
    fontWeight: "400" as const,
  },
  medium: {
    fontFamily: "System",
    fontWeight: "500" as const,
  },
  semibold: {
    fontFamily: "System",
    fontWeight: "600" as const,
  },
  bold: {
    fontFamily: "System",
    fontWeight: "700" as const,
  },
};

export type ThemeColors = typeof colors.light;
