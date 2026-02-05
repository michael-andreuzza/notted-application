import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, fonts } from "@/constants/theme";
import { useNoteStore, ThemeMode, LanguageCode } from "@/stores/noteStore";
import { useAppTheme } from "@/hooks/useAppTheme";
import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon";
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

        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginBottom: 24,
          }}
        >
          {LANGUAGES.map((lang) => {
            const isSelected = (language || i18n.language) === lang.code;
            return (
              <Pressable
                key={lang.code}
                onPress={() => handleLanguageChange(lang.code as LanguageCode)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: isSelected
                    ? theme.foreground
                    : theme.card,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: isSelected ? theme.background : theme.foreground,
                    opacity: isSelected ? 1 : 0.7,
                    ...fonts.medium,
                  }}
                >
                  {lang.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

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
            paddingVertical: 10,
            paddingHorizontal: 12,
            marginBottom: 24,
            borderRadius: 20,
            backgroundColor: theme.card,
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

        <View style={{ gap: 4, marginBottom: 24 }}>
          <Pressable
            onPress={() => Linking.openURL("https://notted.app/legal/privacy/")}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 20,
              backgroundColor: theme.card,
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
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL("https://notted.app/legal/terms/")}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 20,
              backgroundColor: theme.card,
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
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL("https://notted.app/legal/faq/")}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 20,
              backgroundColor: theme.card,
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
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL("https://notted.app/support/")}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 20,
              backgroundColor: theme.card,
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
          </Pressable>
        </View>

        {/* Data Section */}
        <SectionLabel>{t("data")}</SectionLabel>

        <Pressable
          onPress={() => setShowDeleteConfirm(true)}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 12,
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
    </View>
  );
}
