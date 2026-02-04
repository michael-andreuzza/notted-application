import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Accelerometer } from "expo-sensors";
import { useNoteStore } from "@/stores/noteStore";
import { fonts } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useHaptics } from "@/hooks/useHaptics";
import { ChecklistItem } from "@/components/ChecklistItem";
import { SettingsModal } from "@/components/SettingsModal";

export default function NoteScreen() {
  const router = useRouter();
  const { isDark, theme } = useAppTheme();

  const {
    notes,
    activeNoteId,
    updateNoteTitle,
    setNoteMode,
    updateTextContent,
    addItem,
    updateItem,
    toggleItem,
    deleteItem,
    clearCheckedItems,
    deleteNote,
  } = useNoteStore();

  const note = notes.find((n) => n.id === activeNoteId);
  const { notification, NotificationType } = useHaptics();

  // Sort items: unchecked first, checked at bottom
  const sortedItems = note
    ? [...note.items.filter((item) => !item.checked), ...note.items.filter((item) => item.checked)]
    : [];

  const [newItemText, setNewItemText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showClearedMessage, setShowClearedMessage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const newItemInputRef = useRef<TextInput>(null);
  const textContentRef = useRef<TextInput>(null);
  const lastShakeTime = useRef(0);

  // Auto-focus on the input when entering the note
  useEffect(() => {
    if (!note) return;
    const timer = setTimeout(() => {
      if (note.mode === "list") {
        // Only auto-focus when the list is empty
        if (note.items.length === 0) {
          newItemInputRef.current?.focus();
        }
      } else {
        textContentRef.current?.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [note?.id, note?.mode, note?.items.length]);

  // Shake to clear checked items
  const handleShake = useCallback(() => {
    const now = Date.now();
    if (now - lastShakeTime.current < 1000) return; // Debounce
    lastShakeTime.current = now;

    if (note && note.items.some((item) => item.checked)) {
      clearCheckedItems(note.id);
      notification(NotificationType.Success);
      setShowClearedMessage(true);
      setTimeout(() => setShowClearedMessage(false), 1500);
    }
  }, [note, clearCheckedItems]);

  // Shake detection - only on native platforms
  useEffect(() => {
    if (Platform.OS === "web") return;

    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    const SHAKE_THRESHOLD = 1.5;

    Accelerometer.setUpdateInterval(100);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      if (deltaX + deltaY + deltaZ > SHAKE_THRESHOLD) {
        handleShake();
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    });

    return () => subscription.remove();
  }, [handleShake]);

  const handleAddItem = () => {
    if (note && newItemText.trim()) {
      addItem(note.id, newItemText.trim());
      setNewItemText("");
    }
  };

  const handleSubmitEditing = () => {
    handleAddItem();
    newItemInputRef.current?.focus();
  };

  if (!note) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: theme.foreground, opacity: 0.5, ...fonts.regular }}>
          No note selected
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.background }}
      keyboardVerticalOffset={0}
    >
      <View style={{ flex: 1, paddingTop: 60 }}>
        {/* Header - note title */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <TextInput
            value={note.title}
            onChangeText={(text) => updateNoteTitle(note.id, text)}
            placeholder="note title..."
            placeholderTextColor={isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}
            // @ts-ignore - web only
            style={{
              fontSize: 28,
              color: theme.foreground,
              padding: 0,
              outlineStyle: "none",
              ...fonts.regular,
            }}
          />
        </View>

        {/* Mode toggle */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 24,
            marginBottom: 24,
            gap: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#222" : "#E5E5E5",
          }}
        >
          <Pressable 
            onPress={() => setNoteMode(note.id, "list")} 
            style={{ 
              flexDirection: "row", 
              alignItems: "center",
              paddingBottom: 8,
              borderBottomWidth: 2,
              borderBottomColor: note.mode === "list" ? theme.foreground : "transparent",
            }}
          >
            {note.items.length > 0 && (
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: theme.foreground,
                  opacity: note.mode === "list" ? 1 : 0.3,
                  marginRight: 8,
                }}
              />
            )}
            <Text
              style={{
                fontSize: 20,
                color: theme.foreground,
                opacity: note.mode === "list" ? 1 : 0.3,
                ...fonts.regular,
              }}
            >
              List
            </Text>
          </Pressable>
          <Pressable 
            onPress={() => setNoteMode(note.id, "text")} 
            style={{ 
              flexDirection: "row", 
              alignItems: "center",
              paddingBottom: 8,
              borderBottomWidth: 2,
              borderBottomColor: note.mode === "text" ? theme.foreground : "transparent",
            }}
          >
            {note.textContent.trim().length > 0 && (
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: theme.foreground,
                  opacity: note.mode === "text" ? 1 : 0.3,
                  marginRight: 8,
                }}
              />
            )}
            <Text
              style={{
                fontSize: 20,
                color: theme.foreground,
                opacity: note.mode === "text" ? 1 : 0.3,
                ...fonts.regular,
              }}
            >
              Text
            </Text>
          </Pressable>
        </View>

        {/* Content area */}
        {note.mode === "list" ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 160 }}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
          >
            {/* New item input - at top */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: isDark ? "#333" : "#DDD",
                  marginRight: 12,
                }}
              />
              <TextInput
                ref={newItemInputRef}
                value={newItemText}
                onChangeText={setNewItemText}
                onSubmitEditing={handleSubmitEditing}
                placeholder="add item..."
                placeholderTextColor={isDark ? "#444" : "#BBB"}
                returnKeyType="done"
                blurOnSubmit={false}
                autoCapitalize="sentences"
                // @ts-ignore - web only
                style={{
                  flex: 1,
                  fontSize: 18,
                  color: theme.foreground,
                  padding: 0,
                  outlineStyle: "none",
                  ...fonts.regular,
                }}
              />
            </View>

            {sortedItems.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                onToggle={() => toggleItem(note.id, item.id)}
                onUpdate={(text) => updateItem(note.id, item.id, text)}
                onDelete={() => deleteItem(note.id, item.id)}
                isDark={isDark}
              />
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 160 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TextInput
              ref={textContentRef}
              value={note.textContent}
              onChangeText={(text) => updateTextContent(note.id, text)}
              placeholder="start writing..."
              placeholderTextColor={isDark ? "#444" : "#BBB"}
              multiline
              textAlignVertical="top"
              // @ts-ignore - web only
              style={{
                flex: 1,
                fontSize: 18,
                color: theme.foreground,
                lineHeight: 26,
                minHeight: 300,
                outlineStyle: "none",
                ...fonts.regular,
              }}
            />
          </ScrollView>
        )}

        {/* Buttons */}
        <View
          style={{
            position: "absolute",
            bottom: 40,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "center",
            gap: 12,
          }}
        >
          {/* Delete Button */}
          <Pressable
            onPress={() => setShowDeleteConfirm(true)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: isDark ? "#331111" : "#FFE5E5",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                color: "#FF4444",
                ...fonts.regular,
              }}
            >
              ✕
            </Text>
          </Pressable>

          {/* Settings Button */}
          <Pressable
            onPress={() => setShowSettings(true)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: isDark ? "#222" : "#F0F0F0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 28,
                color: theme.foreground,
                ...fonts.regular,
              }}
            >
              ⚙
            </Text>
          </Pressable>

          {/* Back Button */}
          <Pressable
            onPress={() => router.replace("/")}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: theme.foreground,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                color: theme.background,
                ...fonts.regular,
              }}
            >
              ←
            </Text>
          </Pressable>
        </View>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <View
            style={{
              position: "absolute",
              bottom: 120,
              right: 24,
              backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              width: 200,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: theme.foreground,
                marginBottom: 12,
                ...fonts.regular,
              }}
            >
              Delete this note?
            </Text>
            <View style={{ flexDirection: "row", gap: 16 }}>
              <Pressable onPress={() => setShowDeleteConfirm(false)}>
                <Text style={{ color: theme.foreground, fontSize: 16, ...fonts.regular }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (note) {
                    notification(NotificationType.Warning);
                    deleteNote(note.id);
                    router.replace("/");
                  }
                }}
              >
                <Text style={{ color: "#FF4444", fontSize: 16, ...fonts.regular }}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Cleared message */}
      {showClearedMessage && (
        <View
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: [{ translateX: -60 }, { translateY: -20 }],
            backgroundColor: isDark ? "#222" : "#333",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "#FFF", fontSize: 16, ...fonts.regular }}>
            Cleared!
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
