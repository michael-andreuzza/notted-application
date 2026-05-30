import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { fonts, colors } from "@/constants/theme";
import { scale, fontScale } from "@/constants/responsive";
import { useAppTheme } from "@/hooks/useAppTheme";
import { CloseIcon } from "../icons/CloseIcon";
import { Button } from "../elements/Button";
import { IconButton } from "../elements/IconButton";
import { getPremiumProduct, startPremiumPurchase } from "@/services/playBilling";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onRestore?: () => void;
}

export function PaywallModal({ visible, onClose, onRestore }: PaywallModalProps) {
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [premiumPriceLabel, setPremiumPriceLabel] = useState("$4.99");
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const handlePurchase = async () => {
    if (isPurchasing) {
      return;
    }
    setIsPurchasing(true);
    setFeedback(null);
    try {
      const outcome = await startPremiumPurchase();
      if (outcome === "purchased") {
        onClose();
      } else if (outcome === "pending") {
        setFeedback({
          text: "Your purchase is being processed. It will unlock automatically once confirmed.",
          isError: false,
        });
      }
    } catch (error) {
      setFeedback({
        text:
          error instanceof Error
            ? error.message
            : "Something went wrong with the purchase. Please try again.",
        isError: true,
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  useEffect(() => {
    if (!visible) {
      return;
    }

    setFeedback(null);

    let cancelled = false;

    const loadProduct = async () => {
      try {
        const product = await getPremiumProduct();
        if (!cancelled && product?.displayPrice) {
          setPremiumPriceLabel(product.displayPrice);
        }
      } catch (error) {
        console.warn("Failed loading Play product", error);
      }
    };

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [visible]);

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
            bottom: 12 + insets.bottom,
            left: 12,
            right: 12,
            backgroundColor: theme.surface,
            borderRadius: 20,
            padding: scale(20),
          }}
        >
          {/* Close button */}
          <IconButton
            onPress={onClose}
            size="sm"
            background={false}
            style={{
              position: "absolute",
              top: scale(16),
              right: scale(16),
              zIndex: 1,
            }}
            icon={(color, size) => <CloseIcon color={color} size={size} />}
            iconSize={scale(20)}
          />

          {/* Title */}
          <Text
            style={{
              fontSize: fontScale(20),
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
              fontSize: fontScale(15),
              color: theme.foreground,
              marginBottom: scale(20),
              ...fonts.regular,
            }}
          >
            {t("oneTimePurchase")}
          </Text>

          {/* Features */}
          <View style={{ marginBottom: scale(20), gap: 12 }}>
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
              padding: scale(14),
              marginBottom: scale(16),
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
                  fontSize: fontScale(14),
                  color: theme.foreground,
                  ...fonts.regular,
                }}
              >
                {t("lifetimeAccess")}
              </Text>
              <Text
                style={{
                  fontSize: fontScale(20),
                  color: theme.foreground,
                  ...fonts.regular,
                }}
              >
                {premiumPriceLabel}
              </Text>
            </View>
          </View>

          {/* Purchase button */}
          <Button
            title={t("purchaseNow")}
            onPress={handlePurchase}
            variant="default"
            size="lg"
            fullWidth
            style={{ marginBottom: 8 }}
            loading={isPurchasing}
          />

          {/* Inline purchase feedback */}
          {feedback && (
            <Text
              style={{
                color: feedback.isError ? colors.danger : theme.foreground,
                opacity: feedback.isError ? 1 : 0.7,
                fontSize: fontScale(13),
                textAlign: "center",
                marginBottom: 8,
                ...fonts.regular,
              }}
            >
              {feedback.text}
            </Text>
          )}

          {/* Restore purchase button */}
          {onRestore && (
            <Button
              title={t("restorePurchase")}
              onPress={() => {
                onClose();
                onRestore();
              }}
              variant="muted"
              fullWidth
            />
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
          fontSize: fontScale(14),
          color: theme.foreground,
          ...fonts.medium,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: fontScale(12),
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
