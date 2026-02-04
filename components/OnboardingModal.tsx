import React from "react";
import { View, Text, Pressable, Modal, TouchableWithoutFeedback } from "react-native";
import { fonts } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

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
                borderRadius: 24,
                padding: 24,
                paddingTop: 32,
              }}
            >
              {/* Title */}
              <Text
                style={{
                  fontSize: 28,
                  color: theme.foreground,
                  marginBottom: 24,
                  ...fonts.regular,
                }}
              >
                Welcome to notted
              </Text>

              {/* Tips */}
              <View style={{ gap: 20, marginBottom: 32 }}>
                <TipRow
                  emoji="+"
                  text="Tap + to create a note"
                  theme={theme}
                />
                <TipRow
                  emoji="✓"
                  text="Tap checkbox to mark done"
                  theme={theme}
                />
                <TipRow
                  emoji="↓"
                  text="Checked items move to bottom"
                  theme={theme}
                />
                <TipRow
                  emoji="📱"
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
  emoji,
  text,
  theme,
}: {
  emoji: string;
  text: string;
  theme: { foreground: string; background: string };
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text
        style={{
          fontSize: 18,
          color: theme.foreground,
          width: 32,
          ...fonts.regular,
        }}
      >
        {emoji}
      </Text>
      <Text
        style={{
          fontSize: 16,
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
