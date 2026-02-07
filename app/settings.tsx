import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { fonts } from "@/constants/theme";
import { scale, fontScale } from "@/constants/responsive";
import { useNoteStore, ThemeMode } from "@/stores/noteStore";
import { useAppTheme } from "@/hooks/useAppTheme";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { TopBar } from "@/components/layout/TopBar";
import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon";
import { ChevronRightIcon } from "@/components/icons/ChevronRightIcon";
import { ExternalLinkIcon } from "@/components/icons/ExternalLinkIcon";
import { SectionLabel } from "@/components/elements/SectionLabel";
import { ToggleRow } from "@/components/elements/ToggleRow";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Button } from "@/components/elements/Button";
import { IconButton } from "@/components/elements/IconButton";
import { LANGUAGES } from "@/i18n";

export default function SettingsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  
  const {
    themeMode,
    setThemeMode,
    language,
    hapticsEnabled,
    setHapticsEnabled,
    shakeToClearEnabled,
    setShakeToClearEnabled,
    setHasSeenOnboarding,
    resetAllData,
  } = useNoteStore();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentLanguage = LANGUAGES.find((l) => l.code === (language || i18n.language)) || LANGUAGES[0];

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: "system", label: t("system") },
    { value: "light", label: t("light") },
    { value: "dark", label: t("dark") },
  ];

  const handleDeleteAllData = () => {
    resetAllData();
    setShowDeleteConfirm(false);
    router.replace("/");
  };

  return (
    <ScreenWrapper>
      <TopBar
        left={
          <IconButton
            onPress={() => router.back()}
            size="sm"
            background={false}
            icon={(color, size) => <ArrowLeftIcon color={color} size={size} />}
            iconSize={scale(24)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          />
        }
        center={
          <Text
            style={{
              fontSize: fontScale(18),
              color: theme.foreground,
              ...fonts.medium,
            }}
          >
            {t("settings")}
          </Text>
        }
        right={<View style={{ width: scale(24) }} />}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: scale(20), paddingBottom: scale(40) + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Section */}
        <SectionLabel>{t("language")}</SectionLabel>

        <Button
          title={currentLanguage.name}
          onPress={() => router.push("/language")}
          variant="muted"
          fullWidth
          align="space-between"
          style={{ marginBottom: scale(24) }}
          rightIcon={<ChevronRightIcon color={theme.foreground} size={scale(18)} />}
        />

        {/* Theme Section */}
        <SectionLabel>{t("theme")}</SectionLabel>

        <View
          style={{
            backgroundColor: theme.surfaceAlt,
            borderRadius: scale(24),
            padding: 4,
            marginBottom: scale(24),
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 4,
            }}
          >
            {themeOptions.map((option) => (
              <Button
                key={option.value}
                title={option.label}
                onPress={() => setThemeMode(option.value)}
                variant="muted"
                size="sm"
                fullWidth
                style={{
                  flex: 1,
                  backgroundColor: themeMode === option.value
                    ? theme.cardActive
                    : "transparent",
                }}
                textStyle={{
                  opacity: themeMode === option.value ? 1 : 0.5,
                  ...fonts.medium,
                }}
              />
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

        <View style={{ marginBottom: scale(24) }}>
          <ToggleRow
            label={t("shakeToClear")}
            isEnabled={shakeToClearEnabled}
            onToggle={() => setShakeToClearEnabled(!shakeToClearEnabled)}
          />
        </View>

        {/* Help Section */}
        <SectionLabel>{t("help")}</SectionLabel>

        <Button
          title={t("showOnboarding")}
          onPress={() => {
            setHasSeenOnboarding(false);
            router.push("/onboarding");
          }}
          variant="muted"
          fullWidth
          align="space-between"
          rightIcon={<ChevronRightIcon color={theme.foreground} size={scale(18)} />}
          style={{ marginBottom: scale(24) }}
        />

        {/* Legal Section */}
        <SectionLabel>{t("legal")}</SectionLabel>

        <View style={{ gap: 8, marginBottom: scale(24) }}>
          <Button
            title={t("privacyPolicy")}
            onPress={() => Linking.openURL("https://notted.app/legal/privacy/")}
            variant="muted"
            fullWidth
            align="space-between"
            rightIcon={<ExternalLinkIcon color={theme.foreground} size={scale(16)} />}
          />

          <Button
            title={t("termsOfService")}
            onPress={() => Linking.openURL("https://notted.app/legal/terms/")}
            variant="muted"
            fullWidth
            align="space-between"
            rightIcon={<ExternalLinkIcon color={theme.foreground} size={scale(16)} />}
          />

          <Button
            title={t("faq")}
            onPress={() => Linking.openURL("https://notted.app/legal/faq/")}
            variant="muted"
            fullWidth
            align="space-between"
            rightIcon={<ExternalLinkIcon color={theme.foreground} size={scale(16)} />}
          />

          <Button
            title={t("support")}
            onPress={() => Linking.openURL("https://notted.app/support/")}
            variant="muted"
            fullWidth
            align="space-between"
            rightIcon={<ExternalLinkIcon color={theme.foreground} size={scale(16)} />}
          />
        </View>

        {/* Data Section */}
        <SectionLabel>{t("data")}</SectionLabel>

        <Button
          title={t("deleteAllData")}
          onPress={() => setShowDeleteConfirm(true)}
          variant="destructive"
          fullWidth
        />
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
    </ScreenWrapper>
  );
}
