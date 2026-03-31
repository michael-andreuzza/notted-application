import React, { useState } from "react";
import { View, Text, Pressable, Modal, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { fonts, colors } from "@/constants/theme";
import { scale, fontScale } from "@/constants/responsive";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNoteStore } from "@/stores/noteStore";
import { restorePremiumFromStore } from "@/services/playBilling";
import { Button } from "../elements/Button";

interface RestoreModalProps {
  visible: boolean;
  onClose: () => void;
}

export function RestoreModal({ visible, onClose }: RestoreModalProps) {
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const { setPremium } = useNoteStore();

  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const isAndroid = Platform.OS === "android";
  const isIOS = Platform.OS === "ios";

  const handleRestore = async () => {
    if (!isAndroid && !isIOS) {
      setRestoreError("Restore is only supported on Android and iOS.");
      return;
    }

    setIsRestoring(true);
    setRestoreError(null);

    try {
      const restored = await restorePremiumFromStore();
      if (restored) {
        setPremium(true);
        handleClose();
      } else {
        setRestoreError(
          isIOS
            ? "No App Store purchase found for this account."
            : "No Google Play purchase found for this account.",
        );
      }
    } catch (error) {
      console.error("Restore error:", error);
      setRestoreError("Failed to restore. Please try again.");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClose = () => {
    setRestoreError(null);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        onPress={handleClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: theme.surface,
            borderRadius: 20,
            padding: scale(24),
            marginHorizontal: scale(40),
            width: "85%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Text
            style={{
              fontSize: fontScale(18),
              color: theme.foreground,
              marginBottom: scale(16),
              textAlign: "center",
              ...fonts.medium,
            }}
          >
            {t("restorePurchase")}
          </Text>

          <Text
            style={{
              color: theme.foreground,
              opacity: 0.7,
              fontSize: fontScale(14),
              textAlign: "center",
              ...fonts.regular,
            }}
          >
            {isIOS
              ? "Restores your premium purchase from the App Store account on this device."
              : "Restores your premium purchase from the Google Play account on this device."}
          </Text>
          {restoreError && (
            <Text
              style={{
                color: colors.danger,
                fontSize: fontScale(13),
                marginTop: 8,
                ...fonts.regular,
              }}
            >
              {restoreError}
            </Text>
          )}

          <View style={{ flexDirection: "row", gap: 8, marginTop: scale(20) }}>
            <Button
              title={t("cancel")}
              onPress={handleClose}
              variant="muted"
              style={{ flex: 1 }}
            />
            <Button
              title={t("restore")}
              onPress={handleRestore}
              variant="default"
              style={{ flex: 1 }}
              loading={isRestoring}
              textStyle={fonts.medium}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
