import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import * as Linking from "expo-linking";
import { useNoteStore } from "@/stores/noteStore";

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const { themeMode, setPremium } = useNoteStore();

  // Listen for deep link to unlock premium after purchase
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      if (url.includes("purchase-success")) {
        setPremium(true);
      }
    };

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url && url.includes("purchase-success")) {
        setPremium(true);
      }
    });

    // Listen for deep links while app is open
    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [setPremium]);

  const isDark = themeMode === "system"
    ? systemColorScheme === "dark"
    : themeMode === "dark";

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: isDark ? "#010101" : "#FAFAFA",
          },
        }}
      />
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}
