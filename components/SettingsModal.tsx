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
                    <Pressable
                      onPress={() => setThemeMode(option.value)}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 20,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
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
            <Pressable
              onPress={() => {
                setHasSeenOnboarding(false);
                onClose();
              }}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                marginBottom: 20,
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

            {/* Delete Data Section */}
            <SectionLabel>{t("data")}</SectionLabel>

            {!showDeleteConfirm ? (
              <Pressable
                onPress={() => setShowDeleteConfirm(true)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  marginBottom: 20,
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
                <View style={{ flexDirection: "row", gap: 20 }}>
                  <Pressable onPress={() => setShowDeleteConfirm(false)}>
                    <Text style={{ color: theme.foreground, fontSize: 15, ...fonts.regular }}>
                      {t("cancel")}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      resetAllData();
                      setShowDeleteConfirm(false);
                      onClose();
                    }}
                  >
                    <Text style={{ color: colors.danger, fontSize: 15, ...fonts.regular }}>
                      {t("delete")}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Done button */}
          <Pressable
            onPress={onClose}
            style={{
              backgroundColor: theme.foreground,
              paddingVertical: 14,
              borderRadius: 24,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Text
              style={{
                color: theme.background,
                fontSize: 15,
                ...fonts.regular,
              }}
            >
              {t("done")}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
