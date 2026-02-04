import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useNoteStore } from "@/stores/noteStore";

export function useHaptics() {
  const { hapticsEnabled } = useNoteStore();

  const impact = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== "web" && hapticsEnabled) {
      Haptics.impactAsync(style);
    }
  };

  const notification = (type: Haptics.NotificationFeedbackType) => {
    if (Platform.OS !== "web" && hapticsEnabled) {
      Haptics.notificationAsync(type);
    }
  };

  const selection = () => {
    if (Platform.OS !== "web" && hapticsEnabled) {
      Haptics.selectionAsync();
    }
  };

  return {
    impact,
    notification,
    selection,
    ImpactStyle: Haptics.ImpactFeedbackStyle,
    NotificationType: Haptics.NotificationFeedbackType,
  };
}
