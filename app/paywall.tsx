import React from "react";
import { View, Text, Pressable, useColorScheme, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { colors, fonts } from "@/constants/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const CARD_MARGIN_X = 12;
const CARD_MARGIN_BOTTOM = 12;

export default function PaywallScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? colors.dark : colors.light;

  const handlePurchase = async () => {
    // TODO: Replace with actual Polar checkout URL
    alert("Polar checkout will open here. Set up your Polar product first!");
  };

  const handleRestore = async () => {
    // TODO: Implement restore purchases logic
    alert("Restore purchases - will check with Polar API");
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.3)" }}>
      {/* Tap outside to close */}
      <Pressable 
        onPress={() => router.back()} 
        style={{ flex: 1 }} 
      />

      {/* Floating Card */}
      <View
        style={{
          position: "absolute",
          bottom: CARD_MARGIN_BOTTOM,
          left: CARD_MARGIN_X,
          right: CARD_MARGIN_X,
          backgroundColor: theme.background,
          borderRadius: 24,
          padding: 24,
          paddingTop: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.4 : 0.15,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        {/* Drag handle */}
        <View
          style={{
            alignSelf: "center",
            width: 36,
            height: 4,
            backgroundColor: isDark ? "#333" : "#DDD",
            borderRadius: 2,
            marginBottom: 24,
          }}
        />

        {/* Title */}
        <Text
          style={{
            fontSize: 28,
            color: theme.foreground,
            marginBottom: 8,
            ...fonts.regular,
          }}
        >
          Unlock Premium
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            fontSize: 16,
            color: theme.foreground,
            opacity: 0.5,
            marginBottom: 32,
            ...fonts.regular,
          }}
        >
          One-time purchase, forever yours
        </Text>

        {/* Features */}
        <View style={{ marginBottom: 32, gap: 16 }}>
          <FeatureRow
            title="Unlimited Notes"
            description="Create as many notes as you need"
            theme={theme}
          />
          <FeatureRow
            title="Custom Colors"
            description="Personalize your notes (coming soon)"
            theme={theme}
          />
          <FeatureRow
            title="iCloud Sync"
            description="Access everywhere (coming soon)"
            theme={theme}
          />
        </View>

        {/* Price box */}
        <View
          style={{
            borderWidth: 1,
            borderColor: isDark ? "#333" : "#E5E5E5",
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: theme.foreground,
                ...fonts.regular,
              }}
            >
              Lifetime access
            </Text>
            <Text
              style={{
                fontSize: 24,
                color: theme.foreground,
                ...fonts.regular,
              }}
            >
              $4.99
            </Text>
          </View>
          <Text
            style={{
              fontSize: 13,
              color: theme.foreground,
              opacity: 0.4,
              marginTop: 4,
              ...fonts.regular,
            }}
          >
            One-time payment, no subscription
          </Text>
        </View>

        {/* Purchase button */}
        <Pressable
          onPress={handlePurchase}
          style={{
            backgroundColor: theme.foreground,
            paddingVertical: 16,
            borderRadius: 28,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              color: theme.background,
              fontSize: 16,
              ...fonts.regular,
            }}
          >
            Purchase Now
          </Text>
        </Pressable>

        {/* Restore */}
        <Pressable onPress={handleRestore} style={{ alignItems: "center", paddingVertical: 8 }}>
          <Text
            style={{
              color: theme.foreground,
              opacity: 0.4,
              fontSize: 14,
              ...fonts.regular,
            }}
          >
            Restore Purchase
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function FeatureRow({
  title,
  description,
  theme,
}: {
  title: string;
  description: string;
  theme: { foreground: string; background: string };
}) {
  return (
    <View>
      <Text
        style={{
          fontSize: 16,
          color: theme.foreground,
          ...fonts.regular,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: theme.foreground,
          opacity: 0.4,
          marginTop: 2,
          ...fonts.regular,
        }}
      >
        {description}
      </Text>
    </View>
  );
}
