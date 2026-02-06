import { useState, useMemo } from "react";
import { View, Text, Pressable, Dimensions, ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useNoteStore, Note } from "@/stores/noteStore";
import { fonts } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useHaptics } from "@/hooks/useHaptics";
import { PaywallModal } from "@/components/PaywallModal";
import { OnboardingModal } from "@/components/OnboardingModal";
import { TemplatePickerModal } from "@/components/TemplatePickerModal";
import { MoreIcon } from "@/components/icons/MoreIcon";
import { SearchIcon } from "@/components/icons/SearchIcon";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { CheckIcon } from "@/components/icons/CheckIcon";
import { PlusIcon } from "@/components/icons/PlusIcon";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";

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

const DATE_GROUP_KEYS: Record<DateGroup, string> = {
  "today": "today",
  "yesterday": "yesterday",
  "this week": "thisWeek",
  "last week": "lastWeek",
  "this month": "thisMonth",
  "older": "older",
};

interface GroupedNotes {
  group: DateGroup;
  notes: Note[];
}

export default function HomeScreen() {
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const { t } = useTranslation();

  const { notes, setActiveNote, createNote, createNoteFromTemplate, deleteNote, isPremium, hasSeenOnboarding, setHasSeenOnboarding } = useNoteStore();
  const { impact, notification, ImpactStyle, NotificationType } = useHaptics();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  
  const handleCloseOnboarding = () => {
    setHasSeenOnboarding(true);
  };

  const handleLongPress = (noteId: string) => {
    impact(ImpactStyle.Medium);
    setNoteToDelete(noteId);
  };

  const handleConfirmDelete = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete);
      notification(NotificationType.Success);
      setNoteToDelete(null);
    }
  };

  // Group notes by date (with search filtering)
  const groupedNotes = useMemo((): GroupedNotes[] => {
    // Filter notes by search query
    const query = searchQuery.toLowerCase().trim();
    const filteredNotes = query
      ? notes.filter((note) => {
          // Match title
          if (note.title.toLowerCase().includes(query)) return true;
          // Match content
          if (note.content.toLowerCase().includes(query)) return true;
          return false;
        })
      : notes;

    // Sort notes by updatedAt descending (most recent first)
    const sortedNotes = [...filteredNotes].sort((a, b) => b.updatedAt - a.updatedAt);
    
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
  }, [notes, searchQuery]);

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
    
    // Show template picker for all users
    setShowTemplatePicker(true);
  };

  const handleStartEmpty = () => {
    impact(ImpactStyle.Medium);
    const newNoteId = createNote();
    setActiveNote(newNoteId);
    router.push("/note");
  };

  const handleSelectTemplate = (templateId: string, builtInContent?: { title: string; content: string }) => {
    impact(ImpactStyle.Medium);
    const newNoteId = createNoteFromTemplate(templateId, builtInContent);
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
            paddingHorizontal: 24,
            paddingVertical: 8,
            marginBottom: 16,
          }}
        >
          {/* App name */}
          <Text
            style={{
              fontSize: 28,
              color: theme.foreground,
              ...fonts.regular,
            }}
          >
            notted
          </Text>

          {/* Right actions */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {/* Search */}
            <Pressable 
              onPress={() => {
                setShowSearch(!showSearch);
                if (showSearch) setSearchQuery("");
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <SearchIcon color={theme.foreground} size={20} />
            </Pressable>

            {/* Settings - 3 dots icon */}
            <Pressable
              onPress={() => router.push("/settings")}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MoreIcon color={theme.foreground} size={24} />
            </Pressable>
          </View>
        </View>

        {/* Search Input */}
        {showSearch && (
          <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              }}
            >
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t("search")}
                placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                autoFocus
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: theme.foreground,
                  paddingVertical: 12,
                  ...fonts.regular,
                }}
              />
              <Pressable
                onPress={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <CloseIcon color={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"} size={18} />
              </Pressable>
            </View>
          </View>
        )}

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
                  fontSize: 40,
                  color: theme.foreground,
                  letterSpacing: -1.5,
                  textTransform: "uppercase",
                  marginTop: groupIndex === 0 ? 0 : 48,
                  marginBottom: 24,
                  ...fonts.semibold,
                }}
              >
                {t(DATE_GROUP_KEYS[group])}
              </Text>
              
              {/* Notes in this section */}
              {groupNotes.map((note) => (
                <Pressable
                  key={note.id}
                  onPress={() => handleNotePress(note.id)}
                  onLongPress={() => handleLongPress(note.id)}
                  delayLongPress={500}
                  style={{ marginBottom: 28 }}
                >
                  <Text
                    style={{
                      fontSize: 28,
                      color: theme.foreground,
                      maxWidth: SCREEN_WIDTH - 48,
                      ...fonts.medium,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {note.title || t("untitled")}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))}

          {/* Empty state */}
          {groupedNotes.length === 0 && (
            <View style={{ marginTop: 40 }}>
              <EmptyState
                title={searchQuery ? t("noResults") : t("noNotesYet")}
                subtitle={searchQuery ? undefined : t("tapToStart")}
                onAction={searchQuery ? undefined : handleNewNote}
              />
            </View>
          )}

        </ScrollView>

        {/* Premium Banner - fixed at bottom, show if not premium */}
        {!isPremium && (
          <Pressable
            onPress={() => setShowPaywall(true)}
            style={{
              position: "absolute",
              bottom: 72,
              left: 24,
              right: 24,
              padding: 24,
              backgroundColor: theme.surface,
              borderRadius: 24,
            }}
          >
            {/* Table Header */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
              <View style={{ flex: 1 }} />
              <Text
                style={{
                  width: 70,
                  textAlign: "center",
                  fontSize: 13,
                  color: theme.foreground,
                  ...fonts.medium,
                }}
              >
                {t("free")}
              </Text>
              <View
                style={{
                  width: 80,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: theme.foreground,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: theme.background,
                    ...fonts.medium,
                  }}
                >
                  {t("premium")}
                </Text>
              </View>
            </View>

            {/* Feature Rows */}
            {[
              { label: t("templates"), free: false, premium: true },
              { label: t("shakeGesture"), free: false, premium: true },
              { label: t("darkMode"), free: false, premium: true },
              { label: t("unlimitedNotesFeatureShort"), free: false, premium: true },
            ].map((feature, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderTopWidth: index > 0 ? 1 : 0,
                  borderTopColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: theme.foreground,
                    ...fonts.medium,
                  }}
                >
                  {feature.label}
                </Text>
                <View style={{ width: 70, alignItems: "center" }}>
                  {feature.free && (
                    <CheckIcon color={theme.foreground} size={18} />
                  )}
                </View>
                <View style={{ width: 80, alignItems: "center" }}>
                  {feature.premium && (
                    <CheckIcon color={theme.foreground} size={18} />
                  )}
                </View>
              </View>
            ))}

            {/* CTA Button */}
            <View
              style={{
                marginTop: 20,
                backgroundColor: theme.foreground,
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: theme.background,
                  ...fonts.semibold,
                }}
              >
                {t("unlockPremium")} — $4.99
              </Text>
            </View>
            
            <Text
              style={{
                marginTop: 12,
                fontSize: 14,
                color: theme.foreground,
                textAlign: "center",
                ...fonts.regular,
              }}
            >
              {t("oneTimePurchase")}
            </Text>
          </Pressable>
        )}

        {/* Floating Add Button for Premium users (only when there are notes) */}
        {isPremium && notes.length > 0 && (
          <Pressable
            onPress={handleNewNote}
            style={{
              position: "absolute",
              bottom: 48,
              right: 24,
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: theme.foreground,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PlusIcon color={theme.background} size={24} />
          </Pressable>
        )}

      </View>

      {/* Delete confirmation */}
      <ConfirmDialog
        visible={!!noteToDelete}
        message={t("deleteNote")}
        cancelLabel={t("cancel")}
        confirmLabel={t("delete")}
        onCancel={() => setNoteToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Modals */}
      <PaywallModal 
        visible={showPaywall} 
        onClose={() => setShowPaywall(false)} 
      />
      <OnboardingModal
        visible={!hasSeenOnboarding}
        onClose={handleCloseOnboarding}
      />
      <TemplatePickerModal
        visible={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        onSelectTemplate={handleSelectTemplate}
        onStartEmpty={handleStartEmpty}
      />
    </View>
  );
}
