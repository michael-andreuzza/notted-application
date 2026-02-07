import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { fonts } from "@/constants/theme";
import { scale, fontScale } from "@/constants/responsive";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNoteStore } from "@/stores/noteStore";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { TopBar } from "@/components/layout/TopBar";
import { PlusIcon } from "@/components/icons/PlusIcon";
import { CheckIcon } from "@/components/icons/CheckIcon";
import { ArrowDownIcon } from "@/components/icons/ArrowDownIcon";
import { ShakeIcon } from "@/components/icons/ShakeIcon";
import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon";
import { Button } from "@/components/elements/Button";
import { IconButton } from "@/components/elements/IconButton";

export default function OnboardingScreen() {
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const { setHasSeenOnboarding } = useNoteStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    setHasSeenOnboarding(true);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <ScreenWrapper style={{ paddingBottom: scale(24) + insets.bottom }}>
      <TopBar
        marginBottom={8}
        left={
          <IconButton
            onPress={handleClose}
            size="sm"
            background={false}
            icon={(color, size) => <ArrowLeftIcon color={color} size={size} />}
            iconSize={scale(24)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          />
        }
        right={<View style={{ width: scale(24) }} />}
      />

      <View style={{ flex: 1, justifyContent: "space-between", paddingHorizontal: scale(24) }}>
        <View>
          <Text
            style={{
              fontSize: fontScale(28),
              color: theme.foreground,
              marginBottom: scale(16),
              ...fonts.semibold,
            }}
          >
            {t("welcomeToNotted")}
          </Text>

          <View style={{ gap: 14 }}>
            <TipRow
              icon={<PlusIcon color={theme.foreground} size={scale(16)} />}
              text={t("tipCreate")}
              theme={theme}
            />
            <TipRow
              icon={<CheckIcon color={theme.foreground} size={scale(16)} />}
              text={t("tipCheck")}
              theme={theme}
            />
            <TipRow
              icon={<ArrowDownIcon color={theme.foreground} size={scale(16)} />}
              text={t("tipMove")}
              theme={theme}
            />
            <TipRow
              icon={<ShakeIcon color={theme.foreground} size={scale(16)} />}
              text={t("tipShake")}
              theme={theme}
            />
          </View>
        </View>

        <Button
          title={t("getStarted")}
          onPress={handleClose}
          variant="default"
          size="md"
          fullWidth
        />
      </View>
    </ScreenWrapper>
  );
}

function TipRow({
  icon,
  text,
  theme,
}: {
  icon: React.ReactNode;
  text: string;
  theme: { foreground: string; background: string };
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={{ width: scale(28) }}>
        {icon}
      </View>
      <Text
        style={{
          fontSize: fontScale(14),
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
