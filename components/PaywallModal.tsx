import React, { useState } from "react";
import { View, Text, Pressable, Modal, Linking, TextInput, ActivityIndicator } from "react-native";
import { fonts } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { useNoteStore } from "@/stores/noteStore";
import { RESTORE_ENDPOINT } from "@/constants/supabase";

const POLAR_CHECKOUT_URL = "https://buy.polar.sh/polar_cl_qCd3hFE0efbUAbSDO16d4aCtF8BJzlGCRQf8u40mrSz";

const CARD_MARGIN_X = 12;
const CARD_MARGIN_BOTTOM = 12;

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PaywallModal({ visible, onClose }: PaywallModalProps) {
  const { isDark, theme } = useAppTheme();
  const { setPremium, purchaseEmail } = useNoteStore();
  
  const [showRestoreInput, setShowRestoreInput] = useState(false);
  const [email, setEmail] = useState(purchaseEmail || "");
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const handlePurchase = async () => {
    await Linking.openURL(POLAR_CHECKOUT_URL);
    onClose();
  };

  const handleRestore = async () => {
    if (!email.trim()) {
      setRestoreError("Please enter your email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setRestoreError("Please enter a valid email");
      return;
    }

    setIsRestoring(true);
    setRestoreError(null);

    try {
      const response = await fetch(`${RESTORE_ENDPOINT}?email=${encodeURIComponent(email.trim())}`);
      const data = await response.json();

      if (data.isPremium) {
        setPremium(true, email.trim().toLowerCase());
        onClose();
      } else {
        setRestoreError("No purchase found for this email");
      }
    } catch (error) {
      console.error("Restore error:", error);
      setRestoreError("Failed to restore. Please try again.");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClose = () => {
    setShowRestoreInput(false);
    setRestoreError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1 }}>
        {/* Tap outside to close */}
        <Pressable 
          onPress={handleClose} 
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
            borderRadius: 20,
            padding: 20,
          }}
        >
          {/* Close button */}
          <Pressable
            onPress={handleClose}
            hitSlop={12}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 1,
            }}
          >
            <CloseIcon color={theme.foreground} size={20} />
          </Pressable>

          {/* Title */}
          <Text
            style={{
              fontSize: 20,
              color: theme.foreground,
              marginBottom: 4,
              ...fonts.regular,
            }}
          >
            Unlock Premium
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              fontSize: 14,
              color: theme.foreground,
              opacity: 0.5,
              marginBottom: 20,
              ...fonts.regular,
            }}
          >
            One-time purchase, forever yours
          </Text>

          {/* Features */}
          <View style={{ marginBottom: 20, gap: 12 }}>
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
              backgroundColor: isDark ? "#222" : "#F5F5F5",
              borderRadius: 10,
              padding: 14,
              marginBottom: 16,
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
                  fontSize: 14,
                  color: theme.foreground,
                  ...fonts.regular,
                }}
              >
                Lifetime access
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  color: theme.foreground,
                  ...fonts.regular,
                }}
              >
                $4.99
              </Text>
            </View>
          </View>

          {/* Purchase button */}
          <Pressable
            onPress={handlePurchase}
            style={{
              backgroundColor: theme.foreground,
              paddingVertical: 14,
              borderRadius: 24,
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                color: theme.background,
                fontSize: 15,
                ...fonts.regular,
              }}
            >
              Purchase Now
            </Text>
          </Pressable>

          {/* Restore section */}
          {showRestoreInput ? (
            <View style={{ marginTop: 8 }}>
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setRestoreError(null);
                }}
                placeholder="Enter your purchase email"
                placeholderTextColor={isDark ? "#666" : "#999"}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  backgroundColor: isDark ? "#222" : "#F5F5F5",
                  borderRadius: 10,
                  padding: 14,
                  color: theme.foreground,
                  fontSize: 15,
                  ...fonts.regular,
                }}
              />
              {restoreError && (
                <Text
                  style={{
                    color: "#FF4444",
                    fontSize: 13,
                    marginTop: 8,
                    ...fonts.regular,
                  }}
                >
                  {restoreError}
                </Text>
              )}
              <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
                <Pressable
                  onPress={() => {
                    setShowRestoreInput(false);
                    setRestoreError(null);
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 20,
                    alignItems: "center",
                    backgroundColor: isDark ? "#222" : "#F5F5F5",
                  }}
                >
                  <Text
                    style={{
                      color: theme.foreground,
                      fontSize: 14,
                      ...fonts.regular,
                    }}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleRestore}
                  disabled={isRestoring}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 20,
                    alignItems: "center",
                    backgroundColor: theme.foreground,
                    opacity: isRestoring ? 0.6 : 1,
                  }}
                >
                  {isRestoring ? (
                    <ActivityIndicator color={theme.background} size="small" />
                  ) : (
                    <Text
                      style={{
                        color: theme.background,
                        fontSize: 14,
                        ...fonts.regular,
                      }}
                    >
                      Restore
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable 
              onPress={() => setShowRestoreInput(true)} 
              style={{ alignItems: "center", paddingVertical: 8 }}
            >
              <Text
                style={{
                  color: theme.foreground,
                  opacity: 0.4,
                  fontSize: 13,
                  ...fonts.regular,
                }}
              >
                Restore Purchase
              </Text>
            </Pressable>
          )}
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
          fontSize: 14,
          color: theme.foreground,
          ...fonts.regular,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 12,
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
