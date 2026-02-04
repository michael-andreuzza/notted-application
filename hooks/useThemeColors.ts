import { useColorScheme } from "react-native";
import { colors } from "@/constants/theme";

export function useThemeColors() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    isDark,
    colors: isDark ? colors.dark : colors.light,
  };
}
