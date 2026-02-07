import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, useColorScheme, Modal, ScrollView, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { colors, fonts } from "@/constants/theme";
import { useNoteStore, ThemeMode, LanguageCode } from "@/stores/noteStore";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { SectionLabel } from "@/components/SectionLabel";
import { ToggleRow } from "@/components/ToggleRow";
import { LANGUAGES } from "@/i18n";
import { Button } from "@/components/Button";
import { IconButton } from "@/components/IconButton";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const systemColorScheme = useColorScheme();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { themeMode, setThemeMode, language, setLanguage, hapticsEnabled, setHapticsEnabled, shakeToClearEnabled, setShakeToClearEnabled, setHasSeenOnboarding, resetAllData } = useNoteStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Determine actual theme based on mode
  const isDark = themeMode === "system" 
    ? systemColorScheme === "dark" 
    : themeMode === "dark";
  const theme = isDark ? colors.dark : colors.light;

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: "system", label: t("system") },
    { value: "light", label: t("light") },
    { value: "dark", label: t("dark") },
  ];

  // Theme tab animation - 0 = system, 1 = light, 2 = dark
  const themeIndex = themeMode === "system" ? 0 : themeMode === "light" ? 1 : 2;
  const themeAnimation = useRef(new Animated.Value(themeIndex)).current;

  useEffect(() => {
    Animated.spring(themeAnimation, {
      toValue: themeIndex,
      useNativeDriver: false,
      tension: 100,
      friction: 12,
    }).start();
  }, [themeMode]);

  // Handle language change
  const handleLanguageChange = (langCode: LanguageCode) => {
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
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
            padding: 20,
            maxHeight: "70%",
          }}
        >
          {/* Close button */}
          <IconButton
            onPress={onClose}
            size="sm"
            background={false}
            icon={(color, size) => <CloseIcon color={color} size={size} />}
            iconSize={20}
            hitSlop={12}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 1,
            }}
          />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text
              style={{
                fontSize: 20,
                color: theme.foreground,
                marginBottom: 20,
                ...fonts.medium,
              }}
            >
              {t("settings")}
            </Text>

            {/* Language Section */}
            <SectionLabel>{t("language")}</SectionLabel>

            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {LANGUAGES.map((lang) => {
                const isSelected = (language || i18n.language) === lang.code;
                return (
                  <Button
                    key={lang.code}
                    onPress={() => handleLanguageChange(lang.code as LanguageCode)}
                    title={lang.name}
                    variant="muted"
                    size="sm"
                    style={{
                      flex: 1,
                      backgroundColor: isSelected ? theme.foreground : theme.card,
                    }}
                    textStyle={{
                      color: isSelected ? theme.background : theme.foreground,
                      opacity: isSelected ? 1 : 0.7,
                      ...fonts.medium,
                    }}
                  />
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
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 4,
                }}
              >
                {themeOptions.map((option, index) => (
                  <Animated.View
                    key={option.value}
                    style={{
                      flex: themeAnimation.interpolate({
                        inputRange: [0, 1, 2],
                        outputRange: index === 0 ? [2, 1, 1] : index === 1 ? [1, 2, 1] : [1, 1, 2],
                      }),
                    }}
                  >
                    <Button
                      title={option.label}
                      onPress={() => setThemeMode(option.value)}
                      variant="muted"
                      size="sm"
                      fullWidth
                      style={{
                        backgroundColor: themeMode === option.value
                          ? theme.cardActive
                          : "transparent",
                      }}
                      textStyle={{
                        opacity: themeMode === option.value ? 1 : 0.5,
                        ...fonts.medium,
                      }}
                    />
                  </Animated.View>
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

            <View style={{ marginBottom: 20 }}>
              <ToggleRow
                label={t("shakeToClear")}
                isEnabled={shakeToClearEnabled}
                onToggle={() => setShakeToClearEnabled(!shakeToClearEnabled)}
              />
            </View>

            {/* Other options */}
            <Button
              title={t("showOnboarding")}
              onPress={() => {
                setHasSeenOnboarding(false);
                onClose();
              }}
              variant="muted"
              fullWidth
              style={{
                marginBottom: 20,
                backgroundColor: theme.card,
              }}
            />

            {/* Delete Data Section */}
            <SectionLabel>{t("data")}</SectionLabel>

            {!showDeleteConfirm ? (
              <Button
                title={t("deleteAllData")}
                onPress={() => setShowDeleteConfirm(true)}
                variant="destructive"
                fullWidth
                style={{ marginBottom: 20 }}
              />
            ) : (
              <View style={{ marginBottom: 20, paddingHorizontal: 12 }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: theme.foreground,
                    opacity: 0.6,
                    marginBottom: 12,
                    ...fonts.regular,
                  }}
                >
                  {t("deleteAllDataConfirm")}
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Button
                    title={t("cancel")}
                    onPress={() => setShowDeleteConfirm(false)}
                    variant="muted"
                    style={{ flex: 1 }}
                  />
                  <Button
                    title={t("delete")}
                    onPress={() => {
                      resetAllData();
                      setShowDeleteConfirm(false);
                      onClose();
                    }}
                    variant="destructive"
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Done button */}
          <Button
            title={t("done")}
            onPress={onClose}
            variant="default"
            size="lg"
            fullWidth
            style={{ marginTop: 8 }}
          />
        </View>
      </View>
    </Modal>
  );
}
