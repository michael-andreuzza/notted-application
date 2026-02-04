import React from "react";
import { View, Text, Pressable, Modal, Linking } from "react-native";
import { fonts } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

const POLAR_CHECKOUT_URL = "https://buy.polar.sh/polar_cl_qCd3hFE0efbUAbSDO16d4aCtF8BJzlGCRQf8u40mrSz";

const CARD_MARGIN_X = 12;
const CARD_MARGIN_BOTTOM = 12;

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PaywallModal({ visible, onClose }: PaywallModalProps) {
  const { isDark, theme } = useAppTheme();

  const handlePurchase = async () => {
    await Linking.openURL(POLAR_CHECKOUT_URL);
    onClose();
  };

  const handleRestore = async () => {
    // TODO: Implement restore purchases logic
    alert("Restore purchases - will check with Polar API");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        {/* Tap outside to close */}
        <Pressable 
          onPress={onClose} 
          style={{ flex: 1 }} 
        />

        {/* Floating Card */}
        <View
          style={{
            position: "absolute",
            bottom: CARD_MARGIN_BOTTOM,
            left: CARD_MARGIN_X,
            right: CARD_MARGIN_X,
            backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
            borderRadius: 24,
            padding: 24,
            paddingTop: 16,
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
              description="Create as many lists as you need"
              theme={theme}
            />
            <FeatureRow
              title="Offline-First"
              description="No account, no sync, no BS"
              theme={theme}
            />
            <FeatureRow
              title="Pay Once, Own Forever"
              description="No subscriptions, no ads, no tracking"
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
    </Modal>
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
