import React from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { useTranslation } from "react-i18next";
import { fonts } from "@/constants/theme";
import { scale, fontScale } from "@/constants/responsive";
import { useAppTheme } from "@/hooks/useAppTheme";
import { NoteType } from "@/stores/noteStore";
import { Button } from "../elements/Button";

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

  const handleSelect = (type: NoteType) => {
    onStartEmpty(type);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
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
            width: "85%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          {/* Title */}
          <Text
            style={{
              fontSize: fontScale(18),
              color: theme.foreground,
              marginBottom: scale(16),
              textAlign: "center",
              ...fonts.medium,
            }}
          >
            {t("chooseNoteType")}
          </Text>

          {/* Options */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button
              title={t("textNote")}
              onPress={() => handleSelect("text")}
              variant="muted"
              style={{ flex: 1 }}
            />
            <Button
              title={t("listNote")}
              onPress={() => handleSelect("list")}
              variant="muted"
              style={{ flex: 1 }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
