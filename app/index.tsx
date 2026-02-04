import { useState } from "react";
import { View, Text, Pressable, Dimensions, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { useNoteStore } from "@/stores/noteStore";
import { fonts } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useHaptics } from "@/hooks/useHaptics";
import { PaywallModal } from "@/components/PaywallModal";
import { SettingsModal } from "@/components/SettingsModal";
import { OnboardingModal } from "@/components/OnboardingModal";
import { SettingsIcon } from "@/components/icons/SettingsIcon";
import { PlusIcon } from "@/components/icons/PlusIcon";
import { MoreIcon } from "@/components/icons/MoreIcon";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const { isDark, theme } = useAppTheme();

  const { notes, setActiveNote, createNote, isPremium, hasSeenOnboarding, setHasSeenOnboarding } = useNoteStore();
  const { impact, notification, ImpactStyle, NotificationType } = useHaptics();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const handleCloseOnboarding = () => {
    setHasSeenOnboarding(true);
  };

  const handleNotePress = (noteId: string) => {
    setActiveNote(noteId);
    router.push("/note");
  };

  const handleNewNote = () => {
    if (!isPremium && notes.length >= 1) {
      notification(NotificationType.Warning);
      setShowPaywall(true);
      return;
    }
    
    impact(ImpactStyle.Medium);
    const newNoteId = createNote();
    setActiveNote(newNoteId);
    router.push("/note");
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Content */}
      <View style={{ flex: 1, paddingTop: 50 }}>
        {/* Top Navigation */}
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
          {/* Logo and name */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={require("@/assets/icon.png")}
              style={{
                width: 16,
                height: 16,
                marginRight: 6,
                opacity: isDark ? 0.5 : 0.4,
              }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 16,
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
                lineHeight: 16,
                ...fonts.regular,
              }}
            >
              notted
            </Text>
          </View>

          {/* Settings */}
          <Pressable onPress={() => setShowSettings(true)}>
            <Text
              style={{
                fontSize: 16,
                color: theme.foreground,
                opacity: 0.6,
                ...fonts.regular,
              }}
            >
              Settings
            </Text>
          </Pressable>
        </View>

        {/* Notes List */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
        >
          {notes.map((note) => (
            <Pressable
              key={note.id}
              onPress={() => handleNotePress(note.id)}
              style={{ marginBottom: 20 }}
            >
              <Text
                style={{
                  fontSize: 28,
                  color: theme.foreground,
                  maxWidth: SCREEN_WIDTH - 48,
                  ...fonts.regular,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {note.title || "untitled"}
              </Text>
              {note.items.length > 0 && (
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
                    marginTop: 4,
                    ...fonts.regular,
                  }}
                >
                  {note.items.length} item{note.items.length !== 1 ? "s" : ""}
                </Text>
              )}
            </Pressable>
          ))}

          {/* Empty state */}
          {notes.length === 0 && (
            <View style={{ marginTop: 40 }}>
              <Text
                style={{
                  fontSize: 28,
                  color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                  ...fonts.regular,
                }}
              >
                no notes yet
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
                  marginTop: 8,
                  ...fonts.regular,
                }}
              >
                tap + to get started
              </Text>
            </View>
          )}

          {/* Premium Banner - show only if not premium and has at least 1 note */}
          {!isPremium && notes.length >= 1 && (
            <Pressable
              onPress={() => setShowPaywall(true)}
              style={{
                marginTop: 32,
                padding: 16,
                backgroundColor: isDark ? "#1A1A1A" : "#F5F5F5",
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: theme.foreground,
                  ...fonts.regular,
                }}
              >
                Unlimited notes
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: theme.foreground,
                  opacity: 0.5,
                  marginTop: 4,
                  ...fonts.regular,
                }}
              >
                Upgrade for $4.99 — lifetime access
              </Text>
            </Pressable>
          )}
        </ScrollView>

        {/* Add Note Button - Bottom Right */}
        <Pressable
          onPress={handleNewNote}
          style={{
            position: "absolute",
            bottom: 40,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: isDark ? "#222" : "#F0F0F0",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PlusIcon color={theme.foreground} size={24} />
        </Pressable>
      </View>

      {/* Modals */}
      <PaywallModal 
        visible={showPaywall} 
        onClose={() => setShowPaywall(false)} 
      />
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <OnboardingModal
        visible={!hasSeenOnboarding}
        onClose={handleCloseOnboarding}
      />
    </View>
  );
}
