import { useEffect, useCallback, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, View, Platform } from "react-native";
import * as Linking from "expo-linking";
import * as SplashScreen from "expo-splash-screen";
import * as NavigationBar from "expo-navigation-bar";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useNoteStore } from "@/stores/noteStore";
import { initI18n } from "@/i18n";
import { colors } from "@/constants/theme";

// Keep splash screen visible while fonts load (only on native)
if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const { themeMode, language, setPremium } = useNoteStore();
  const [i18nReady, setI18nReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Initialize i18n with stored language preference
  useEffect(() => {
    initI18n(language);
    setI18nReady(true);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && Platform.OS !== "web") {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

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
  const theme = isDark ? colors.dark : colors.light;

  // Set Android navigation bar color to match app background
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(theme.background);
      NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark");
    }
  }, [isDark, theme.background]);

  // On native, wait for fonts and i18n. On web, render immediately (font will apply when loaded)
  if ((!fontsLoaded || !i18nReady) && Platform.OS !== "web") {
    return null;
  }

  const content = (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );

  // On web, render directly. On native, wrap with View for splash screen callback.
  if (Platform.OS === "web") {
    return content;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {content}
    </View>
  );
}
