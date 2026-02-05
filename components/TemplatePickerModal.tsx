import React from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { fonts } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNoteStore, Template } from "@/stores/noteStore";
import { BUILT_IN_TEMPLATES, getBuiltInTemplateContent } from "@/constants/templates";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { PlusIcon } from "@/components/icons/PlusIcon";

interface TemplatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string, builtInContent?: { title: string; content: string }) => void;
  onStartEmpty: () => void;
}

export function TemplatePickerModal({
  visible,
  onClose,
  onSelectTemplate,
  onStartEmpty,
}: TemplatePickerModalProps) {
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const { templates: userTemplates, isPremium } = useNoteStore();

  const handleBuiltInSelect = (templateId: string) => {
    const content = getBuiltInTemplateContent(templateId, t);
    if (content) {
      onSelectTemplate(templateId, content);
    }
    onClose();
  };

  const handleUserTemplateSelect = (template: Template) => {
    onSelectTemplate(template.id);
    onClose();
  };

  const handleStartEmpty = () => {
    onStartEmpty();
    onClose();
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
        <Pressable onPress={onClose} style={{ flex: 1 }} />

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
            maxHeight: "70%",
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
            {t("chooseTemplate")}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ marginBottom: 16 }}
          >
            {/* Start Empty Option */}
            <Pressable
              onPress={handleStartEmpty}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.card,
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: theme.foreground,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <PlusIcon color={theme.background} size={18} />
              </View>
              <Text
                style={{
                  fontSize: 15,
                  color: theme.foreground,
                  ...fonts.regular,
                }}
              >
                {t("startEmpty")}
              </Text>
            </Pressable>

            {/* Built-in Templates */}
            <Text
              style={{
                fontSize: 12,
                color: theme.foreground,
                opacity: 0.5,
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                ...fonts.regular,
              }}
            >
              {t("builtInTemplates")}
            </Text>
            <View style={{ gap: 8, marginBottom: 16 }}>
              {BUILT_IN_TEMPLATES.map((template) => {
                const content = getBuiltInTemplateContent(template.id, t);
                return (
                  <Pressable
                    key={template.id}
                    onPress={() => handleBuiltInSelect(template.id)}
                    style={{
                      backgroundColor: theme.card,
                      borderRadius: 12,
                      padding: 14,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color: theme.foreground,
                        ...fonts.regular,
                      }}
                    >
                      {content?.title || ""}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: theme.foreground,
                        opacity: 0.5,
                        marginTop: 4,
                        ...fonts.regular,
                      }}
                      numberOfLines={1}
                    >
                      {content?.content.split("\n").slice(0, 3).join(", ").replace(/^- /g, "").replace(/, - /g, ", ")}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* User Templates (only show if premium and has templates) */}
            {isPremium && userTemplates.length > 0 && (
              <>
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.foreground,
                    opacity: 0.5,
                    marginBottom: 10,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    ...fonts.regular,
                  }}
                >
                  {t("yourTemplates")}
                </Text>
                <View style={{ gap: 8 }}>
                  {userTemplates.map((template) => (
                    <Pressable
                      key={template.id}
                      onPress={() => handleUserTemplateSelect(template)}
                      style={{
                        backgroundColor: theme.card,
                        borderRadius: 12,
                        padding: 14,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          color: theme.foreground,
                          ...fonts.regular,
                        }}
                      >
                        {template.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: theme.foreground,
                          opacity: 0.5,
                          marginTop: 4,
                          ...fonts.regular,
                        }}
                        numberOfLines={1}
                      >
                        {template.content.split("\n").slice(0, 3).join(", ").replace(/^- /g, "").replace(/, - /g, ", ")}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
