import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Linking,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, fonts } from "@/constants/theme";
import { useNoteStore, ThemeMode, LanguageCode } from "@/stores/noteStore";
import { useAppTheme } from "@/hooks/useAppTheme";
import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon";
import { ChevronRightIcon } from "@/components/icons/ChevronRightIcon";
import { CheckIcon } from "@/components/icons/CheckIcon";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { ExternalLinkIcon } from "@/components/icons/ExternalLinkIcon";
import { SectionLabel } from "@/components/SectionLabel";
import { ToggleRow } from "@/components/ToggleRow";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LANGUAGES } from "@/i18n";

export default function SettingsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  
  const {
    themeMode,
    setThemeMode,
    language,
    setLanguage,
    hapticsEnabled,
    setHapticsEnabled,
    shakeToClearEnabled,
    setShakeToClearEnabled,
    setHasSeenOnboarding,
    resetAllData,
  } = useNoteStore();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const currentLanguage = LANGUAGES.find((l) => l.code === (language || i18n.language)) || LANGUAGES[0];

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: "system", label: t("system") },
    { value: "light", label: t("light") },
    { value: "dark", label: t("dark") },
  ];

  const handleLanguageChange = (langCode: LanguageCode) => {
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
  };

  const handleDeleteAllData = () => {
    resetAllData();
    setShowDeleteConfirm(false);
    router.replace("/");
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: 50 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 8,
          marginBottom: 16,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeftIcon color={theme.foreground} size={24} />
        </Pressable>

        <Text
          style={{
            fontSize: 18,
            color: theme.foreground,
            ...fonts.medium,
          }}
        >
          {t("settings")}
        </Text>

        {/* Spacer for centering */}
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Section */}
        <SectionLabel>{t("language")}</SectionLabel>

        <Pressable
          onPress={() => setShowLanguagePicker(true)}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 20,
            backgroundColor: theme.surfaceAlt,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              color: theme.foreground,
              ...fonts.regular,
            }}
          >
            {currentLanguage.name}
          </Text>
          <ChevronRightIcon color={theme.foreground} size={18} />
        </Pressable>

        {/* Theme Section */}
        <SectionLabel>{t("theme")}</SectionLabel>

        <View
          style={{
            backgroundColor: theme.surfaceAlt,
            borderRadius: 24,
            padding: 4,
            marginBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 4,
            }}
          >
            {themeOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setThemeMode(option.value)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  alignItems: "center",
                  backgroundColor: themeMode === option.value
                    ? theme.cardActive
                    : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.foreground,
                    opacity: themeMode === option.value ? 1 : 0.5,
                    ...fonts.medium,
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Feedback Section */}
        <SectionLabel>{t("feedback")}</SectionLabel>

        <View style={{ marginBottom: 4 }}>
          <ToggleRow
            label={t("vibration")}
            isEnabled={hapticsEnabled}
            onToggle={() => setHapticsEnabled(!hapticsEnabled)}
          />
        </View>

        <View style={{ marginBottom: 24 }}>
          <ToggleRow
            label={t("shakeToClear")}
            isEnabled={shakeToClearEnabled}
            onToggle={() => setShakeToClearEnabled(!shakeToClearEnabled)}
          />
        </View>

        {/* Help Section */}
        <SectionLabel>{t("help")}</SectionLabel>

        <Pressable
          onPress={() => {
            setHasSeenOnboarding(false);
            router.replace("/");
          }}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginBottom: 24,
            borderRadius: 20,
            backgroundColor: theme.surfaceAlt,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              color: theme.foreground,
              ...fonts.regular,
            }}
          >
            {t("showOnboarding")}
          </Text>
        </Pressable>

        {/* Legal Section */}
        <SectionLabel>{t("legal")}</SectionLabel>

        <View style={{ gap: 8, marginBottom: 24 }}>
          <Pressable
            onPress={() => Linking.openURL("https://notted.app/legal/privacy/")}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor: theme.surfaceAlt,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                color: theme.foreground,
                ...fonts.regular,
              }}
            >
              {t("privacyPolicy")}
            </Text>
            <ExternalLinkIcon color={theme.foreground} size={16} />
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL("https://notted.app/legal/terms/")}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor: theme.surfaceAlt,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                color: theme.foreground,
                ...fonts.regular,
              }}
            >
              {t("termsOfService")}
            </Text>
            <ExternalLinkIcon color={theme.foreground} size={16} />
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL("https://notted.app/legal/faq/")}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor: theme.surfaceAlt,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                color: theme.foreground,
                ...fonts.regular,
              }}
            >
              {t("faq")}
            </Text>
            <ExternalLinkIcon color={theme.foreground} size={16} />
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL("https://notted.app/support/")}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor: theme.surfaceAlt,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                color: theme.foreground,
                ...fonts.regular,
              }}
            >
              {t("support")}
            </Text>
            <ExternalLinkIcon color={theme.foreground} size={16} />
          </Pressable>
        </View>

        {/* Data Section */}
        <SectionLabel>{t("data")}</SectionLabel>

        <Pressable
          onPress={() => setShowDeleteConfirm(true)}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 20,
            backgroundColor: "rgba(255, 68, 68, 0.15)",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 15,
              color: colors.danger,
              ...fonts.regular,
            }}
          >
            {t("deleteAllData")}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        visible={showDeleteConfirm}
        message={t("deleteAllDataConfirm")}
        cancelLabel={t("cancel")}
        confirmLabel={t("delete")}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAllData}
      />

      {/* Language Picker Modal */}
      <Modal
        visible={showLanguagePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguagePicker(false)}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={() => setShowLanguagePicker(false)}
        >
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
              onPress={() => setShowLanguagePicker(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 1,
              }}
            >
              <CloseIcon color={theme.foreground} size={20} />
            </Pressable>

            <Text
              style={{
                fontSize: 20,
                color: theme.foreground,
                marginBottom: 20,
                ...fonts.medium,
              }}
            >
              {t("language")}
            </Text>
            
            <View style={{ gap: 4 }}>
              {LANGUAGES.map((lang) => {
                const isSelected = currentLanguage.code === lang.code;
                return (
                  <Pressable
                    key={lang.code}
                    onPress={() => {
                      handleLanguageChange(lang.code as LanguageCode);
                      setShowLanguagePicker(false);
                    }}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      backgroundColor: isSelected ? theme.surfaceAlt : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: theme.foreground,
                        ...fonts.regular,
                      }}
                    >
                      {lang.name}
                    </Text>
                    {isSelected && (
                      <CheckIcon color={theme.foreground} size={18} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
