import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { fonts } from "@/constants/theme";
import { scale, fontScale } from "@/constants/responsive";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNoteStore, LanguageCode } from "@/stores/noteStore";
import { LANGUAGES } from "@/i18n";
import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon";
import { CheckIcon } from "@/components/icons/CheckIcon";
import { Button } from "@/components/Button";
import { IconButton } from "@/components/IconButton";

export default function LanguageScreen() {
  const { theme } = useAppTheme();
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useNoteStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const currentLanguage = LANGUAGES.find((l) => l.code === (language || i18n.language)) || LANGUAGES[0];

  const handleLanguageChange = (langCode: LanguageCode) => {
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: scale(50) + insets.top,
        paddingBottom: scale(24) + insets.bottom,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: scale(16),
          paddingVertical: 8,
          marginBottom: 8,
        }}
      >
        <IconButton
          onPress={() => router.back()}
          size="sm"
          background={false}
          icon={(color, size) => <ArrowLeftIcon color={color} size={size} />}
          iconSize={scale(24)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        />
        <View style={{ width: scale(24) }} />
      </View>

      <View style={{ paddingHorizontal: scale(24), marginBottom: scale(16) }}>
        <Text
          style={{
            fontSize: fontScale(28),
            color: theme.foreground,
            ...fonts.semibold,
          }}
        >
          {t("language")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: scale(24),
          paddingBottom: scale(24),
          gap: 8,
        }}
        showsVerticalScrollIndicator={false}
      >
        {LANGUAGES.map((lang) => {
          const isSelected = currentLanguage.code === lang.code;
          return (
            <Button
              key={lang.code}
              title={lang.name}
              onPress={() => handleLanguageChange(lang.code as LanguageCode)}
              variant="muted"
              fullWidth
              align="space-between"
              rightIcon={isSelected ? <CheckIcon color={theme.foreground} size={scale(18)} /> : undefined}
              style={{
                backgroundColor: isSelected ? theme.surfaceAlt : theme.surfaceAlt,
              }}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
