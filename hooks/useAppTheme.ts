import { useColorScheme } from "react-native";
import { useNoteStore } from "@/stores/noteStore";
import { colors } from "@/constants/theme";

export function useAppTheme() {
  const systemColorScheme = useColorScheme();
  const { themeMode } = useNoteStore();

  const isDark = themeMode === "system"
    ? systemColorScheme === "dark"
    : themeMode === "dark";

  return {
    isDark,
    theme: isDark ? colors.dark : colors.light,
    colors, // expose full colors object for semantic colors (danger, success)
  };
}
