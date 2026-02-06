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
import { useNoteStore } from "@/stores/noteStore";
import { fonts } from "@/constants/theme";
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

  // Clean empty lines when note loads
  useEffect(() => {
    if (note && note.content) {
      const lines = note.content.split("\n");
      const cleanedLines = lines.filter(line => line.trim() !== "");
      if (cleanedLines.length !== lines.length) {
        updateContent(note.id, cleanedLines.join("\n"));
      }
    }
  }, [note?.id]);

  const [showPaywall, setShowPaywall] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showClearedMessage, setShowClearedMessage] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newLineText, setNewLineText] = useState("");
  const newLineInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
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

  const handleStartEmpty = () => {
    if (note && isNoteEmpty(note)) {
      deleteNote(note.id);
    }
    
    impact(ImpactStyle.Medium);
    const newNoteId = createNote();
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

  const handleAddLine = () => {
    if (!note || !newLineText.trim()) return;
    
    // Clean existing content and add new line
    const existingLines = note.content 
      ? note.content.split("\n").filter(line => line.trim() !== "")
      : [];
    existingLines.push(newLineText);
    
    updateContent(note.id, existingLines.join("\n"));
    setNewLineText("");
    
    // Scroll to bottom after adding new line
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleUpdateLine = (lineIndex: number, newText: string) => {
    if (!note) return;
    const lines = note.content.split("\n");
    
    // If the line becomes empty, delete it
    if (newText.trim() === "" || newText === "- " || newText === "+ ") {
      lines.splice(lineIndex, 1);
    } else {
      lines[lineIndex] = newText;
    }
    
    // Filter out any remaining empty lines
    const cleanedLines = lines.filter(line => line.trim() !== "");
    updateContent(note.id, cleanedLines.join("\n"));
  };

  // Parse content into lines
  const contentLines = note?.content ? note.content.split("\n") : [];

  if (!note) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: 50 }}>
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
          <Pressable
            onPress={handleBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeftIcon color={theme.foreground} size={24} />
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <Pressable onPress={handleNewNote}>
              <Text
                style={{
                  fontSize: 16,
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
              <MoreIcon color={theme.foreground} size={24} />
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
      <View style={{ flex: 1, paddingTop: 50 }}>
        {/* Top Navigation */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginBottom: 8,
          }}
        >
          <Pressable
            onPress={handleBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeftIcon color={theme.foreground} size={24} />
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <Pressable onPress={handleNewNote}>
              <Text
                style={{
                  fontSize: 16,
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
              <TrashIcon color={theme.foreground} size={20} />
            </Pressable>

            <Pressable
              onPress={() => router.push("/settings")}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MoreIcon color={theme.foreground} size={24} />
            </Pressable>
          </View>
        </View>

        {/* Title Input */}
        <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
          <TextInput
            value={note.title}
            onChangeText={(text) => updateNoteTitle(note.id, text)}
            placeholder={t("noteTitle")}
            placeholderTextColor={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"}
            style={{
              fontSize: 28,
              color: theme.foreground,
              ...fonts.semibold,
            }}
          />
        </View>

        {/* Content */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 300 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {/* Hint at top */}
          {!newLineText && (
            <Text
              style={{
                fontSize: 18,
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
                marginBottom: 16,
                ...fonts.regular,
              }}
            >
              Tip: Type - and press enter to create a checklist item
            </Text>
          )}

          {/* Rendered lines */}
          {contentLines.map((line, index) => {
            const isChecklist = line.startsWith("- ") || line.startsWith("+ ");
            const isChecked = line.startsWith("+ ");
            const text = isChecklist ? line.substring(2) : line;

            if (isChecklist) {
              return (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  {/* Checkbox */}
                  <Pressable
                    onPress={() => handleToggleLine(index)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: isChecked 
                        ? theme.foreground
                        : theme.disabled,
                      backgroundColor: isChecked ? theme.foreground : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 14,
                      marginTop: 4,
                    }}
                  >
                    {isChecked && (
                      <CheckIcon color={theme.background} size={14} />
                    )}
                  </Pressable>

                  {/* Text */}
                  <TextInput
                    value={text}
                    onChangeText={(newText) => {
                      const prefix = isChecked ? "+ " : "- ";
                      handleUpdateLine(index, prefix + newText);
                    }}
                    onKeyPress={({ nativeEvent }) => {
                      // Delete line when backspace is pressed on empty text
                      if (nativeEvent.key === 'Backspace' && text === '') {
                        handleUpdateLine(index, '');
                      }
                    }}
                    style={{
                      flex: 1,
                      fontSize: 28,
                      color: isChecked 
                        ? (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)")
                        : theme.foreground,
                      textDecorationLine: isChecked ? "line-through" : "none",
                      lineHeight: 36,
                      padding: 0,
                      ...fonts.medium,
                    }}
                    multiline
                  />
                </View>
              );
            }

            // Regular text line
            return (
              <TextInput
                key={index}
                value={line}
                onChangeText={(newText) => handleUpdateLine(index, newText)}
                onKeyPress={({ nativeEvent }) => {
                  // Delete line when backspace is pressed on empty text
                  if (nativeEvent.key === 'Backspace' && line === '') {
                    handleUpdateLine(index, '');
                  }
                }}
                style={{
                  fontSize: 28,
                  color: theme.foreground,
                  lineHeight: 36,
                  marginBottom: 8,
                  padding: 0,
                  ...fonts.medium,
                }}
                multiline
              />
            );
          })}

          {/* Add new line input */}
          <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 8 }}>
            <TextInput
              ref={newLineInputRef}
              value={newLineText}
              onChangeText={setNewLineText}
              onSubmitEditing={handleAddLine}
              placeholder={contentLines.length === 0 ? t("startWriting") : t("addItem")}
              placeholderTextColor={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"}
              style={{
                flex: 1,
                fontSize: 28,
                color: theme.foreground,
                lineHeight: 36,
                padding: 0,
                ...fonts.medium,
              }}
              blurOnSubmit={false}
              returnKeyType="done"
            />
          </View>
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
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: theme.foreground, fontSize: 16, ...fonts.regular }}>
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
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: theme.foreground, fontSize: 16, ...fonts.regular }}>
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
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
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
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
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
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderRadius: 12,
                marginTop: 4,
                borderTopWidth: 1,
                borderTopColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
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
