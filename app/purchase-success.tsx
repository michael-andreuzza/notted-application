import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useNoteStore } from "@/stores/noteStore";
import { useAppTheme } from "@/hooks/useAppTheme";
import { fonts } from "@/constants/theme";

export default function PurchaseSuccessScreen() {
  const router = useRouter();
  const { setPremium } = useNoteStore();
  const { theme } = useAppTheme();

  useEffect(() => {
    // Unlock premium
    setPremium(true);

    // Redirect to home after a brief moment
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
        Premium unlocked. Redirecting...
      </Text>
      <ActivityIndicator color={theme.foreground} />
    </View>
  );
}
