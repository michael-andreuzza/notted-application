import React, { useState } from "react";
import { View, Text, Pressable, Modal, Linking, TextInput, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { fonts, colors } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNoteStore } from "@/stores/noteStore";
import { RESTORE_ENDPOINT } from "@/constants/supabase";
import { CloseIcon } from "@/components/icons/CloseIcon";

const POLAR_CHECKOUT_URL = "https://buy.polar.sh/polar_cl_qCd3hFE0efbUAbSDO16d4aCtF8BJzlGCRQf8u40mrSz";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PaywallModal({ visible, onClose }: PaywallModalProps) {
  const { isDark, theme } = useAppTheme();
  const { t } = useTranslation();
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
            bottom: 12,
            left: 12,
            right: 12,
            backgroundColor: theme.surface,
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
              ...fonts.medium,
            }}
          >
            {t("unlockPremium")}
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              fontSize: 15,
              color: theme.foreground,
              marginBottom: 20,
              ...fonts.regular,
            }}
          >
            {t("oneTimePurchase")}
          </Text>

          {/* Features */}
          <View style={{ marginBottom: 20, gap: 12 }}>
            <FeatureRow
              title={t("unlimitedNotesFeature")}
              description={t("unlimitedNotesDesc")}
              theme={theme}
            />
            <FeatureRow
              title={t("offlineFirst")}
              description={t("offlineFirstDesc")}
              theme={theme}
            />
            <FeatureRow
              title={t("payOnce")}
              description={t("payOnceDesc")}
              theme={theme}
            />
          </View>

          {/* Price box */}
          <View
            style={{
              backgroundColor: theme.card,
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
                {t("lifetimeAccess")}
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
              {t("purchaseNow")}
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
                placeholder={t("enterEmail")}
                placeholderTextColor={theme.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  backgroundColor: theme.card,
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
                    color: colors.danger,
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
                    backgroundColor: theme.card,
                  }}
                >
                  <Text
                    style={{
                      color: theme.foreground,
                      fontSize: 14,
                      ...fonts.regular,
                    }}
                  >
                    {t("cancel")}
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
                      {t("restore")}
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
                {t("restorePurchase")}
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
          ...fonts.medium,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: theme.foreground,
          opacity: 0.5,
          marginTop: 2,
          ...fonts.regular,
        }}
      >
        {description}
      </Text>
    </View>
  );
}
