import { useState, useMemo, useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Linking } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useNoteStore, Note, NoteType } from "@/stores/noteStore";
import { fonts } from "@/constants/theme";
import { scale, fontScale } from "@/constants/responsive";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useHaptics } from "@/hooks/useHaptics";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { TopBar } from "@/components/layout/TopBar";
import { PaywallModal } from "@/components/modals/PaywallModal";
import { RestoreModal } from "@/components/modals/RestoreModal";
import { TemplatePickerModal } from "@/components/modals/TemplatePickerModal";
import { MoreIcon } from "@/components/icons/MoreIcon";
import { SearchIcon } from "@/components/icons/SearchIcon";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { CheckIcon } from "@/components/icons/CheckIcon";
import { PlusIcon } from "@/components/icons/PlusIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";
import { Button } from "@/components/elements/Button";
import { IconButton } from "@/components/elements/IconButton";
import { InputField } from "@/components/elements/InputField";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";

const POLAR_CHECKOUT_URL = "https://buy.polar.sh/polar_cl_qCd3hFE0efbUAbSDO16d4aCtF8BJzlGCRQf8u40mrSz";

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
  const insets = useSafeAreaInsets();

  const { notes, setActiveNote, createNote, createNoteFromTemplate, deleteNote, isPremium, hasSeenOnboarding } = useNoteStore();
  const { impact, notification, ImpactStyle, NotificationType } = useHaptics();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  
  const handleDirectPurchase = async () => {
    await Linking.openURL(POLAR_CHECKOUT_URL);
  };
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  
  useEffect(() => {
    if (!hasSeenOnboarding) {
      router.replace("/onboarding");
    }
  }, [hasSeenOnboarding, router]);

  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);
  const lastSwipeCloseAt = useRef(0);

  const closeOpenSwipe = () => {
    if (openSwipeId) {
      swipeableRefs.current.get(openSwipeId)?.close();
      setOpenSwipeId(null);
      lastSwipeCloseAt.current = Date.now();
    }
  };

  const handleSwipeDelete = (noteId: string) => {
    impact(ImpactStyle.Medium);
    setNoteToDelete(noteId);
  };

  const handleConfirmDelete = () => {
    if (noteToDelete) {
      swipeableRefs.current.get(noteToDelete)?.close();
      deleteNote(noteToDelete);
      notification(NotificationType.Success);
      setNoteToDelete(null);
      setOpenSwipeId(null);
    }
  };

  const renderRightActions = (noteId: string) => (
    <View style={{ width: scale(44), justifyContent: "center", alignItems: "center" }}>
      <IconButton
        onPress={() => handleSwipeDelete(noteId)}
        size="sm"
        variant="destructive"
        background={false}
        icon={(color, size) => <TrashIcon color={color} size={size} />}
        iconSize={scale(18)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      />
    </View>
  );

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
    if (openSwipeId) {
      closeOpenSwipe();
      return;
    }
    if (Date.now() - lastSwipeCloseAt.current < 250) {
      return;
    }
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

  const handleStartEmpty = (type: NoteType) => {
    impact(ImpactStyle.Medium);
    const newNoteId = createNote(type);
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
    <ScreenWrapper>
      <TopBar
        paddingHorizontal={scale(24)}
        left={
          <Text
            style={{
              fontSize: fontScale(28),
              color: theme.foreground,
              letterSpacing: -0.5,
              ...fonts.semibold,
            }}
          >
            notted
          </Text>
        }
        right={
          <View style={{ flexDirection: "row", alignItems: "center", gap: scale(16) }}>
            <IconButton
              onPress={() => {
                setShowSearch(!showSearch);
                if (showSearch) setSearchQuery("");
              }}
              size="md"
              background={false}
              icon={(color, size) => <SearchIcon color={color} size={size} />}
              iconSize={scale(20)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            />
            <IconButton
              onPress={() => router.push("/settings")}
              size="sm"
              background={false}
              icon={(color, size) => <MoreIcon color={color} size={size} />}
              iconSize={scale(24)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            />
          </View>
        }
      />

        {/* Search Input */}
        {showSearch && (
          <View style={{ paddingHorizontal: scale(24), marginBottom: scale(24) }}>
            <InputField
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t("search")}
              autoFocus
              rightIcon={
                <IconButton
                  onPress={() => {
                    setShowSearch(false);
                    setSearchQuery("");
                  }}
                  size="sm"
                  variant="default"
                  background
                  icon={(color, size) => (
                    <CloseIcon color={color} size={size} />
                  )}
                  iconSize={scale(12)}
                  style={{ width: scale(26), height: scale(26) }}
                />
              }
            />
          </View>
        )}

        {/* Notes List */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: scale(24), paddingBottom: scale(160) + insets.bottom }}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={closeOpenSwipe}
          onTouchStart={closeOpenSwipe}
        >
          {groupedNotes.map(({ group, notes: groupNotes }, groupIndex) => (
            <View key={group}>
              {/* Section Header */}
              <Text
                style={{
                  fontSize: fontScale(40),
                  color: theme.foreground,
                  letterSpacing: -1.5,
                  textTransform: "uppercase",
                  marginTop: groupIndex === 0 ? 0 : scale(48),
                  marginBottom: scale(24),
                  ...fonts.semibold,
                }}
              >
                {t(DATE_GROUP_KEYS[group])}
              </Text>
              
              {/* Notes in this section */}
              {groupNotes.map((note) => (
                <Swipeable
                  key={note.id}
                  ref={(ref) => {
                    if (ref) swipeableRefs.current.set(note.id, ref);
                    else swipeableRefs.current.delete(note.id);
                  }}
                  renderRightActions={() => renderRightActions(note.id)}
                  overshootRight={false}
                  rightThreshold={scale(20)}
                  friction={2}
                  onSwipeableOpen={() => {
                    if (openSwipeId && openSwipeId !== note.id) {
                      swipeableRefs.current.get(openSwipeId)?.close();
                    }
                    setOpenSwipeId(note.id);
                  }}
                  onSwipeableClose={() => {
                    if (openSwipeId === note.id) {
                      setOpenSwipeId(null);
                    }
                  }}
                >
                  <Pressable
                    onPress={() => handleNotePress(note.id)}
                    style={{
                      marginBottom: scale(2),
                      backgroundColor: theme.background,
                      width: "100%",
                      paddingRight: scale(44),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: fontScale(28),
                        color: theme.foreground,
                        ...fonts.medium,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {note.title || t("untitled")}
                    </Text>
                  </Pressable>
                </Swipeable>
              ))}
            </View>
          ))}

          {/* Empty state */}
          {groupedNotes.length === 0 && (
            <View style={{ marginTop: scale(40) }}>
              <EmptyState
                title={searchQuery ? t("noResults") : t("noNotesYet")}
                subtitle={searchQuery ? undefined : t("tapToStart")}
                onAction={searchQuery ? undefined : handleNewNote}
              />
            </View>
          )}

          {/* Premium Banner - inside scroll so it never overlaps content */}
          {!isPremium && (
            <View
              style={{
                marginTop: scale(40),
                padding: scale(24),
                backgroundColor: theme.surface,
                borderRadius: scale(24),
              }}
            >
              {/* Table Header */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: scale(20) }}>
                <View style={{ flex: 1 }} />
                <Text
                  style={{
                    width: scale(70),
                    textAlign: "center",
                    fontSize: fontScale(13),
                    color: theme.foreground,
                    ...fonts.medium,
                  }}
                >
                  {t("free")}
                </Text>
                <View
                  style={{
                    width: scale(80),
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: theme.foreground,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: fontScale(13),
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
                      fontSize: fontScale(15),
                      color: theme.foreground,
                      ...fonts.medium,
                    }}
                  >
                    {feature.label}
                  </Text>
                  <View style={{ width: scale(70), alignItems: "center" }}>
                    {feature.free && (
                      <CheckIcon color={theme.foreground} size={scale(18)} />
                    )}
                  </View>
                  <View style={{ width: scale(80), alignItems: "center" }}>
                    {feature.premium && (
                      <CheckIcon color={theme.foreground} size={scale(18)} />
                    )}
                  </View>
                </View>
              ))}

              <Text
                style={{
                  marginTop: scale(20),
                  fontSize: fontScale(14),
                  color: theme.foreground,
                  textAlign: "center",
                  ...fonts.regular,
                }}
              >
                {t("oneTimePurchase")}
              </Text>

              {/* CTA Button - goes directly to payment */}
              <Button
                title={`${t("unlockPremium")} — $4.99`}
                onPress={handleDirectPurchase}
                variant="default"
                fullWidth
                style={{ marginTop: 8 }}
              />

              {/* Restore purchase link */}
              <Button
                title={t("restorePurchase")}
                onPress={() => setShowRestore(true)}
                variant="muted"
                fullWidth
                style={{ marginTop: 8 }}
              />
            </View>
          )}

        </ScrollView>

        {/* Floating Add Button for Premium users (only when there are notes) */}
        {isPremium && notes.length > 0 && (
          <IconButton
            onPress={handleNewNote}
            size="lg"
            variant="default"
            background
            style={{
              position: "absolute",
              bottom: scale(60) + insets.bottom,
              alignSelf: "center",
              left: "50%",
              marginLeft: -scale(28),
            }}
            icon={(color, size) => <PlusIcon color={color} size={size} />}
          />
        )}

      {/* Delete confirmation */}
      <ConfirmDialog
        visible={!!noteToDelete}
        message={t("deleteNote")}
        description={t("deleteNoteConfirm")}
        cancelLabel={t("cancel")}
        confirmLabel={t("delete")}
        onCancel={() => setNoteToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Modals */}
      <PaywallModal 
        visible={showPaywall} 
        onClose={() => setShowPaywall(false)}
        onRestore={() => setShowRestore(true)}
      />
      <RestoreModal
        visible={showRestore}
        onClose={() => setShowRestore(false)}
      />
      <TemplatePickerModal
        visible={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        onSelectTemplate={handleSelectTemplate}
        onStartEmpty={handleStartEmpty}
      />
    </ScreenWrapper>
  );
}
