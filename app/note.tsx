import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Accelerometer } from "expo-sensors";
import { useNoteStore, NoteType } from "@/stores/noteStore";
import { fonts } from "@/constants/theme";
import { scale, fontScale } from "@/constants/responsive";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useHaptics } from "@/hooks/useHaptics";
import { PaywallModal } from "@/components/PaywallModal";
import { TemplatePickerModal } from "@/components/TemplatePickerModal";
import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon";
import { MoreIcon } from "@/components/icons/MoreIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";
import { CheckIcon } from "@/components/icons/CheckIcon";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function NoteScreen() {
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const { t } = useTranslation();

  const {
    notes,
    activeNoteId,
    createNote,
    createNoteFromTemplate,
    setActiveNote,
    updateNoteTitle,
    updateContent,
    toggleLine,
    deleteNote,
    clearCheckedItems,
    saveAsTemplate,
    shakeToClearEnabled,
    isPremium,
  } = useNoteStore();

  const note = notes.find((n) => n.id === activeNoteId);
  const { impact, notification, ImpactStyle, NotificationType } = useHaptics();

  // Check if note is empty
  const isNoteEmpty = (n: typeof note) => {
    if (!n) return true;
    const hasTitle = n.title.trim().length > 0;
    // For list notes, check if any items have actual text
    if (n.type === "list") {
      const hasItems = n.content.split("\n").some((line) => {
        const text = line.startsWith("- ") || line.startsWith("+ ") ? line.substring(2) : line;
        return text.trim().length > 0;
      });
      return !hasTitle && !hasItems;
    }
    const hasContent = n.content.trim().length > 0;
    return !hasTitle && !hasContent;
  };

  // Handle back navigation - delete empty notes
  const handleBack = useCallback(() => {
    if (note && isNoteEmpty(note)) {
      deleteNote(note.id);
    }
    router.replace("/");
  }, [note, deleteNote, router]);

  // Handle Android hardware back button
  useEffect(() => {
    const backAction = () => {
      handleBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [handleBack]);

  const [showPaywall, setShowPaywall] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showClearedMessage, setShowClearedMessage] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const contentInputRef = useRef<TextInput>(null);
  const itemInputRefs = useRef<Map<number, TextInput>>(new Map());
  const addItemInputRef = useRef<TextInput>(null);
  const lastShakeTime = useRef(0);

  // Shake to clear checked items
  const handleShake = useCallback(() => {
    if (!note || !shakeToClearEnabled) return;
    
    const hasCheckedItems = note.content.split("\n").some((line) => line.startsWith("+ "));
    if (!hasCheckedItems) return;

    const now = Date.now();
    if (now - lastShakeTime.current < 1000) return;
    lastShakeTime.current = now;

    notification(NotificationType.Success);
    clearCheckedItems(note.id);
    setShowClearedMessage(true);
    setTimeout(() => setShowClearedMessage(false), 1500);
  }, [note, shakeToClearEnabled, clearCheckedItems, notification, NotificationType]);

  // Accelerometer for shake detection
  useEffect(() => {
    let subscription: any;
    
    const subscribe = async () => {
      Accelerometer.setUpdateInterval(100);
      subscription = Accelerometer.addListener((data) => {
        const { x, y, z } = data;
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        
        if (acceleration > 2.5) {
          handleShake();
        }
      });
    };

    subscribe();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [handleShake]);

  const handleNewNote = () => {
    if (!isPremium && notes.length >= 1) {
      notification(NotificationType.Warning);
      setShowPaywall(true);
      return;
    }
    
    // Show template picker for premium users
    if (isPremium) {
      setShowTemplatePicker(true);
      return;
    }
    
    // Free users (with no notes) create empty note directly
    if (note && isNoteEmpty(note)) {
      deleteNote(note.id);
    }
    
    impact(ImpactStyle.Medium);
    const newNoteId = createNote();
    setActiveNote(newNoteId);
  };

  const handleStartEmpty = (type: NoteType) => {
    if (note && isNoteEmpty(note)) {
      deleteNote(note.id);
    }
    
    impact(ImpactStyle.Medium);
    const newNoteId = createNote(type);
    setActiveNote(newNoteId);
  };

  const handleSelectTemplate = (templateId: string, builtInContent?: { title: string; content: string }) => {
    if (note && isNoteEmpty(note)) {
      deleteNote(note.id);
    }
    
    impact(ImpactStyle.Medium);
    const newNoteId = createNoteFromTemplate(templateId, builtInContent);
    setActiveNote(newNoteId);
  };

  const handleSaveAsTemplate = () => {
    if (!note || isNoteEmpty(note)) return;
    
    notification(NotificationType.Success);
    saveAsTemplate(note.id);
    setShowOptionsMenu(false);
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 1500);
  };

  const handleToggleLine = (lineIndex: number) => {
    if (!note) return;
    impact(ImpactStyle.Light);
    toggleLine(note.id, lineIndex);
  };

  // Layout constants for list mode
  const CHECKBOX_SIZE = scale(24);

  // Parse content lines for list mode
  const contentLines = note?.content ? note.content.split("\n") : [];

  // For list mode: parse into items (each line is "- text" or "+ text")
  const listItems = contentLines.map((line) => {
    const isChecked = line.startsWith("+ ");
    const isItem = line.startsWith("- ") || line.startsWith("+ ");
    const text = isItem ? line.substring(2) : line;
    return { text, isChecked, isItem };
  });

  // List mode helpers
  const updateListItem = (index: number, newText: string) => {
    if (!note) return;
    const lines = note.content.split("\n");
    const prefix = lines[index]?.startsWith("+ ") ? "+ " : "- ";
    lines[index] = prefix + newText;
    updateContent(note.id, lines.join("\n"));
  };

  const addListItem = (afterIndex?: number) => {
    if (!note) return;
    const lines = note.content ? note.content.split("\n") : [];
    const insertAt = afterIndex !== undefined ? afterIndex + 1 : lines.length;
    lines.splice(insertAt, 0, "- ");
    updateContent(note.id, lines.join("\n"));
    // Focus the new item after render
    setTimeout(() => {
      itemInputRefs.current.get(insertAt)?.focus();
    }, 50);
  };

  const deleteListItem = (index: number) => {
    if (!note) return;
    const lines = note.content.split("\n");
    if (lines.length <= 1) {
      // Last item - just clear it
      updateContent(note.id, "");
      setTimeout(() => addItemInputRef.current?.focus(), 50);
      return;
    }
    lines.splice(index, 1);
    updateContent(note.id, lines.join("\n"));
    // Focus previous item or the add item input
    setTimeout(() => {
      if (index > 0) {
        itemInputRefs.current.get(index - 1)?.focus();
      } else {
        itemInputRefs.current.get(0)?.focus();
      }
    }, 50);
  };

  // Determine note type
  const noteType = note?.type || "text";
  const isListMode = noteType === "list";

  if (!note) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: scale(50) }}>
        {/* Top Navigation */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: scale(16),
            paddingVertical: 8,
            marginBottom: scale(16),
          }}
        >
          <Pressable
            onPress={handleBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeftIcon color={theme.foreground} size={scale(24)} />
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center", gap: scale(16) }}>
            <Pressable onPress={handleNewNote}>
              <Text
                style={{
                  fontSize: fontScale(16),
                  color: theme.foreground,
                  ...fonts.regular,
                }}
              >
                {t("newNote")}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/settings")}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MoreIcon color={theme.foreground} size={scale(24)} />
            </Pressable>
          </View>
        </View>

        <EmptyState
          title={t("noNotesYet")}
          subtitle={t("tipCreate")}
          onAction={handleNewNote}
        />

        <PaywallModal 
          visible={showPaywall} 
          onClose={() => setShowPaywall(false)} 
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={{ flex: 1, paddingTop: scale(50) }}>
        {/* Top Navigation */}
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
          <Pressable
            onPress={handleBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeftIcon color={theme.foreground} size={scale(24)} />
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center", gap: scale(16) }}>
            <Pressable onPress={handleNewNote}>
              <Text
                style={{
                  fontSize: fontScale(16),
                  color: theme.foreground,
                  ...fonts.regular,
                }}
              >
                {t("newNote")}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowDeleteConfirm(true)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <TrashIcon color={theme.foreground} size={scale(20)} />
            </Pressable>

            <Pressable
              onPress={() => router.push("/settings")}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MoreIcon color={theme.foreground} size={scale(24)} />
            </Pressable>
          </View>
        </View>

        {/* Title Input */}
        <View style={{ paddingHorizontal: scale(24), marginBottom: scale(16) }}>
          <TextInput
            value={note.title}
            onChangeText={(text) => updateNoteTitle(note.id, text)}
            placeholder={t("noteTitle")}
            placeholderTextColor={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"}
            style={{
              fontSize: fontScale(28),
              color: theme.foreground,
              ...fonts.semibold,
            }}
          />
        </View>

        {/* Content */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: scale(24), paddingBottom: scale(300) }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {isListMode ? (
            <>
              {/* List mode: per-item rendering */}
              {listItems.map((item, index) => (
                <View
                  key={`item-${index}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  {/* Checkbox */}
                  <Pressable
                    onPress={() => handleToggleLine(index)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    style={{
                      width: CHECKBOX_SIZE,
                      height: CHECKBOX_SIZE,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: item.isChecked ? theme.foreground : theme.disabled,
                      backgroundColor: item.isChecked ? theme.foreground : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: scale(12),
                    }}
                  >
                    {item.isChecked && (
                      <CheckIcon color={theme.background} size={scale(14)} />
                    )}
                  </Pressable>

                  {/* Item text input */}
                  <TextInput
                    ref={(ref) => {
                      if (ref) {
                        itemInputRefs.current.set(index, ref);
                      } else {
                        itemInputRefs.current.delete(index);
                      }
                    }}
                    value={item.text}
                    onChangeText={(text) => {
                      // Detect newline (Enter press) - split into current + new item
                      if (text.includes("\n")) {
                        const parts = text.split("\n");
                        updateListItem(index, parts[0]);
                        // Insert new item after this one with remaining text
                        const lines = note.content.split("\n");
                        const prefix = lines[index]?.startsWith("+ ") ? "+ " : "- ";
                        lines[index] = prefix + parts[0];
                        lines.splice(index + 1, 0, "- " + (parts[1] || ""));
                        updateContent(note.id, lines.join("\n"));
                        setTimeout(() => {
                          itemInputRefs.current.get(index + 1)?.focus();
                        }, 50);
                        return;
                      }
                      updateListItem(index, text);
                    }}
                    onSubmitEditing={() => {
                      // Enter pressed - add new item below and focus it
                      addListItem(index);
                    }}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === "Backspace" && item.text === "") {
                        deleteListItem(index);
                      }
                    }}
                    blurOnSubmit={false}
                    returnKeyType="next"
                    placeholder={t("addItem")}
                    placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"}
                    style={{
                      flex: 1,
                      fontSize: fontScale(18),
                      color: theme.foreground,
                      paddingVertical: scale(8),
                      textDecorationLine: item.isChecked ? "line-through" : "none",
                      opacity: item.isChecked ? 0.5 : 1,
                      ...fonts.regular,
                    }}
                    autoCapitalize="sentences"
                  />
                </View>
              ))}

              {/* Add new item input */}
              <Pressable
                onPress={() => addListItem()}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: scale(8),
                  opacity: 0.5,
                }}
              >
                <View
                  style={{
                    width: CHECKBOX_SIZE,
                    height: CHECKBOX_SIZE,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: theme.disabled,
                    borderStyle: "dashed",
                    marginRight: scale(12),
                  }}
                />
                <Text
                  style={{
                    fontSize: fontScale(18),
                    color: theme.foreground,
                    ...fonts.regular,
                  }}
                >
                  {t("addItem")}
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              {/* Text mode: simple multiline TextInput */}
              <TextInput
                ref={contentInputRef}
                value={note.content}
                onChangeText={(text) => updateContent(note.id, text)}
                placeholder={t("startWriting")}
                placeholderTextColor={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"}
                style={{
                  fontSize: fontScale(18),
                  color: theme.foreground,
                  lineHeight: fontScale(28),
                  minHeight: 200,
                  ...fonts.regular,
                }}
                multiline
                textAlignVertical="top"
                autoCapitalize="sentences"
              />
            </>
          )}
        </ScrollView>

        {/* Delete confirmation */}
        <ConfirmDialog
          visible={showDeleteConfirm}
          message={t("deleteNote")}
          cancelLabel={t("cancel")}
          confirmLabel={t("delete")}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            if (note) {
              notification(NotificationType.Warning);
              deleteNote(note.id);
              router.replace("/");
            }
          }}
        />
      </View>

      {/* Cleared message */}
      {showClearedMessage && (
        <View
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: [{ translateX: -60 }, { translateY: -20 }],
            backgroundColor: theme.card,
            paddingHorizontal: scale(24),
            paddingVertical: 12,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: theme.foreground, fontSize: fontScale(16), ...fonts.regular }}>
            {t("clearedItems")}
          </Text>
        </View>
      )}

      {/* Template saved message */}
      {showSavedMessage && (
        <View
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: [{ translateX: -70 }, { translateY: -20 }],
            backgroundColor: theme.card,
            paddingHorizontal: scale(24),
            paddingVertical: 12,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: theme.foreground, fontSize: fontScale(16), ...fonts.regular }}>
            {t("templateSaved")}
          </Text>
        </View>
      )}

      {/* Options Menu Modal */}
      <Modal
        visible={showOptionsMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsMenu(false)}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={() => setShowOptionsMenu(false)}
        >
          <View
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              right: 12,
              backgroundColor: theme.surface,
              borderRadius: 20,
              padding: 8,
            }}
          >
            {/* Save as Template option (premium only) */}
            {isPremium && (
              <Pressable
                onPress={handleSaveAsTemplate}
                style={{
                  paddingVertical: scale(16),
                  paddingHorizontal: scale(20),
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: fontScale(16),
                    color: theme.foreground,
                    ...fonts.regular,
                  }}
                >
                  {t("saveAsTemplate")}
                </Text>
              </Pressable>
            )}

            {/* Settings option */}
            <Pressable
              onPress={() => {
                setShowOptionsMenu(false);
                router.push("/settings");
              }}
              style={{
                paddingVertical: scale(16),
                paddingHorizontal: scale(20),
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: fontScale(16),
                  color: theme.foreground,
                  ...fonts.regular,
                }}
              >
                {t("settings")}
              </Text>
            </Pressable>

            {/* Cancel option */}
            <Pressable
              onPress={() => setShowOptionsMenu(false)}
              style={{
                paddingVertical: scale(16),
                paddingHorizontal: scale(20),
                borderRadius: 12,
                marginTop: 4,
                borderTopWidth: 1,
                borderTopColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              }}
            >
              <Text
                style={{
                  fontSize: fontScale(16),
                  color: theme.foreground,
                  opacity: 0.5,
                  textAlign: "center",
                  ...fonts.regular,
                }}
              >
                {t("cancel")}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Paywall Modal */}
      <PaywallModal 
        visible={showPaywall} 
        onClose={() => setShowPaywall(false)} 
      />

      {/* Template Picker Modal */}
      <TemplatePickerModal
        visible={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        onSelectTemplate={handleSelectTemplate}
        onStartEmpty={handleStartEmpty}
      />
    </KeyboardAvoidingView>
  );
}
