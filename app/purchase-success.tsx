import { useEffect } from "react";
import { View, Text, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useNoteStore } from "@/stores/noteStore";
import { useAppTheme } from "@/hooks/useAppTheme";
import { fonts } from "@/constants/theme";

export default function PurchaseSuccessScreen() {
  const router = useRouter();
  const { setPremium } = useNoteStore();
  const { theme } = useAppTheme();

  useEffect(() => {
    // Web-only legacy unlock (no App Store / Play billing on web in this app).
    // iOS/Android: never grant premium from a URL/deep link — only StoreKit / Play Billing + Restore.
    if (Platform.OS === "web") {
      setPremium(true);
    }

    const timeout = setTimeout(() => {
      router.replace("/");
    }, 1500);

    return () => clearTimeout(timeout);
  }, [setPremium, router]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.background,
        padding: 24,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          color: theme.foreground,
          marginBottom: 8,
          ...fonts.regular,
        }}
      >
        Thank you!
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: theme.foreground,
          opacity: 0.6,
          marginBottom: 24,
          textAlign: "center",
          ...fonts.regular,
        }}
      >
        {Platform.OS === "web"
          ? "Lifetime access unlocked. Redirecting..."
          : "Redirecting… Premium must be unlocked via in-app purchase or Restore Purchases."}
      </Text>
      <ActivityIndicator color={theme.foreground} />
    </View>
  );
}
