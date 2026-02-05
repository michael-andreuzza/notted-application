import { useState, useMemo } from "react";
import { View, Text, Pressable, Dimensions, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { useNoteStore, Note } from "@/stores/noteStore";
import { fonts } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useHaptics } from "@/hooks/useHaptics";
import { PaywallModal } from "@/components/PaywallModal";
import { SettingsModal } from "@/components/SettingsModal";
import { OnboardingModal } from "@/components/OnboardingModal";
import { MoreIcon } from "@/components/icons/MoreIcon";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Date categorization helper
type DateGroup = "today" | "yesterday" | "this week" | "last week" | "this month" | "older";

const getDateGroup = (timestamp: number): DateGroup => {
  const now = new Date();
  const date = new Date(timestamp);
  
  // Reset times to midnight for accurate day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const noteDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = today.getTime() - noteDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return "this week";
  if (diffDays < 14) return "last week";
  
  // Check if same month
  if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    return "this month";
  }
  
  return "older";
};

const DATE_GROUP_ORDER: DateGroup[] = ["today", "yesterday", "this week", "last week", "this month", "older"];

const DATE_GROUP_LABELS: Record<DateGroup, string> = {
  "today": "Today",
  "yesterday": "Yesterday",
  "this week": "This Week",
  "last week": "Last Week",
  "this month": "This Month",
  "older": "Older",
};

interface GroupedNotes {
  group: DateGroup;
  notes: Note[];
}

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

  // Group notes by date
  const groupedNotes = useMemo((): GroupedNotes[] => {
    // Sort notes by updatedAt descending (most recent first)
    const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
    
    // Group notes by date category
    const groups: Map<DateGroup, Note[]> = new Map();
    
    for (const note of sortedNotes) {
      const group = getDateGroup(note.updatedAt);
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group)!.push(note);
    }
    
    // Return groups in order, filtering out empty groups
    return DATE_GROUP_ORDER
      .filter(group => groups.has(group))
      .map(group => ({
        group,
        notes: groups.get(group)!,
      }));
  }, [notes]);

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
                opacity: isDark ? 0.7 : 0.6,
              }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 16,
                color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                lineHeight: 16,
                ...fonts.regular,
              }}
            >
              notted
            </Text>
          </View>

          {/* Right actions */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            {/* New Note */}
            <Pressable onPress={handleNewNote}>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.foreground,
                  ...fonts.regular,
                }}
              >
                New note
              </Text>
            </Pressable>

            {/* Settings - 3 dots icon */}
            <Pressable
              onPress={() => setShowSettings(true)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MoreIcon color={theme.foreground} size={24} />
            </Pressable>
          </View>
        </View>

        {/* Notes List */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
        >
          {groupedNotes.map(({ group, notes: groupNotes }, groupIndex) => (
            <View key={group}>
              {/* Section Header */}
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)",
                  marginTop: groupIndex === 0 ? 0 : 24,
                  marginBottom: 12,
                  ...fonts.regular,
                }}
              >
                {DATE_GROUP_LABELS[group]}
              </Text>
              
              {/* Notes in this section */}
              {groupNotes.map((note) => (
                <Pressable
                  key={note.id}
                  onPress={() => handleNotePress(note.id)}
                  style={{ marginBottom: 28 }}
                >
                      <Text
                        style={{
                          fontSize: 14,
                          color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
                          ...fonts.regular,
                        }}
                        >
                        {note.mode === "list" ? "List" : "Text"}
                      </Text>
                  <Text
                    style={{
                      fontSize: 28,
                      color: theme.foreground,
                      marginTop: 8,
                      maxWidth: SCREEN_WIDTH - 48,
                      ...fonts.regular,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {note.title || "untitled"}
                  </Text>
                </Pressable>
              ))}
            </View>
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
                tap "New note" to get started
              </Text>
            </View>
          )}

        </ScrollView>

        {/* Premium Banner - fixed at bottom, show if not premium */}
        {!isPremium && (
          <Pressable
            onPress={() => setShowPaywall(true)}
            style={{
              position: "absolute",
              bottom: 24,
              left: 24,
              right: 24,
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
