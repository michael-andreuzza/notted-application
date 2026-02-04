import React from "react";
import { View, Text, Pressable, Modal, TouchableWithoutFeedback } from "react-native";
import { fonts } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { PlusIcon } from "@/components/icons/PlusIcon";
import { CheckIcon } from "@/components/icons/CheckIcon";
import { ArrowDownIcon } from "@/components/icons/ArrowDownIcon";
import { ShakeIcon } from "@/components/icons/ShakeIcon";

const CARD_MARGIN_X = 12;
const CARD_MARGIN_BOTTOM = 12;

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
}

export function OnboardingModal({ visible, onClose }: OnboardingModalProps) {
  const { isDark, theme } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1 }}>
          <TouchableWithoutFeedback>
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
              {/* Title */}
              <Text
                style={{
                  fontSize: 20,
                  color: theme.foreground,
                  marginBottom: 20,
                  ...fonts.regular,
                }}
              >
                Welcome to notted
              </Text>

              {/* Tips */}
              <View style={{ gap: 14, marginBottom: 24 }}>
                <TipRow
                  icon={<PlusIcon color={theme.foreground} size={16} />}
                  text="Tap + to create a note"
                  theme={theme}
                />
                <TipRow
                  icon={<CheckIcon color={theme.foreground} size={16} />}
                  text="Tap checkbox to mark done"
                  theme={theme}
                />
                <TipRow
                  icon={<ArrowDownIcon color={theme.foreground} size={16} />}
                  text="Checked items move to bottom"
                  theme={theme}
                />
                <TipRow
                  icon={<ShakeIcon color={theme.foreground} size={16} />}
                  text="Shake to clear checked items"
                  theme={theme}
                />
              </View>

              {/* Get started button */}
              <Pressable
                onPress={() => {
                  console.log("Get Started pressed");
                  onClose();
                }}
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
                  Get Started
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
