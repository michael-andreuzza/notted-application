import React from "react";
import { View, Text, Pressable, Modal, TouchableWithoutFeedback } from "react-native";
import { useTranslation } from "react-i18next";
import { fonts } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { PlusIcon } from "@/components/icons/PlusIcon";
import { CheckIcon } from "@/components/icons/CheckIcon";
import { ArrowDownIcon } from "@/components/icons/ArrowDownIcon";
import { ShakeIcon } from "@/components/icons/ShakeIcon";
import { CloseIcon } from "@/components/icons/CloseIcon";

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
}

export function OnboardingModal({ visible, onClose }: OnboardingModalProps) {
  const { isDark, theme } = useAppTheme();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1 }}>
          <TouchableWithoutFeedback>
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
                onPress={onClose}
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
                  marginBottom: 20,
                  ...fonts.medium,
                }}
              >
                {t("welcomeToNotted")}
              </Text>

              {/* Tips */}
              <View style={{ gap: 14, marginBottom: 24 }}>
                <TipRow
                  icon={<PlusIcon color={theme.foreground} size={16} />}
                  text={t("tipCreate")}
                  theme={theme}
                />
                <TipRow
                  icon={<CheckIcon color={theme.foreground} size={16} />}
                  text={t("tipCheck")}
                  theme={theme}
                />
                <TipRow
                  icon={<ArrowDownIcon color={theme.foreground} size={16} />}
                  text={t("tipMove")}
                  theme={theme}
                />
                <TipRow
                  icon={<ShakeIcon color={theme.foreground} size={16} />}
                  text={t("tipShake")}
                  theme={theme}
                />
              </View>

              {/* Get started button */}
              <Pressable
                onPress={onClose}
                style={{
                  backgroundColor: theme.foreground,
                  paddingVertical: 16,
                  borderRadius: 28,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.background,
                    fontSize: 16,
                    ...fonts.regular,
                  }}
                >
                  {t("getStarted")}
                </Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function TipRow({
  icon,
  text,
  theme,
}: {
  icon: React.ReactNode;
  text: string;
  theme: { foreground: string; background: string };
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={{ width: 28 }}>
        {icon}
      </View>
      <Text
        style={{
          fontSize: 14,
          color: theme.foreground,
          opacity: 0.7,
          flex: 1,
          ...fonts.regular,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
