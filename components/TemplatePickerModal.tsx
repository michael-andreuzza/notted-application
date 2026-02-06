import React from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { fonts } from "@/constants/theme";
import { scale, fontScale } from "@/constants/responsive";
import { useAppTheme } from "@/hooks/useAppTheme";
import { NoteType } from "@/stores/noteStore";
import { CloseIcon } from "@/components/icons/CloseIcon";

interface TemplatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string, builtInContent?: { title: string; content: string }) => void;
  onStartEmpty: (type: NoteType) => void;
}

export function TemplatePickerModal({
  visible,
  onClose,
  onStartEmpty,
}: TemplatePickerModalProps) {
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const handleSelect = (type: NoteType) => {
    onStartEmpty(type);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1 }}
        onPress={onClose}
      >
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
          <Pressable
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{
              position: "absolute",
              top: scale(16),
              right: scale(16),
              zIndex: 1,
            }}
          >
            <CloseIcon color={theme.foreground} size={scale(20)} />
          </Pressable>

          {/* Title */}
          <Text
            style={{
              fontSize: fontScale(20),
              color: theme.foreground,
              marginBottom: scale(20),
              ...fonts.medium,
            }}
          >
            {t("chooseNoteType")}
          </Text>

          {/* Options */}
          <View style={{ gap: 4 }}>
            <Pressable
              onPress={() => handleSelect("text")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: scale(16),
                borderRadius: 12,
                backgroundColor: theme.surfaceAlt,
              }}
            >
              <Text
                style={{
                  fontSize: fontScale(16),
                  color: theme.foreground,
                  ...fonts.regular,
                }}
              >
                {t("textNote")}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleSelect("list")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: scale(16),
                borderRadius: 12,
                backgroundColor: theme.surfaceAlt,
              }}
            >
              <Text
                style={{
                  fontSize: fontScale(16),
                  color: theme.foreground,
                  ...fonts.regular,
                }}
              >
                {t("listNote")}
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
