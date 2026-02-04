import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Accelerometer } from "expo-sensors";
import { useNoteStore } from "@/stores/noteStore";
import { fonts } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useHaptics } from "@/hooks/useHaptics";
import { ChecklistItem } from "@/components/ChecklistItem";
import { SettingsModal } from "@/components/SettingsModal";
import { PaywallModal } from "@/components/PaywallModal";
import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon";
import { MoreIcon } from "@/components/icons/MoreIcon";

export default function NoteScreen() {
  const router = useRouter();
  const { isDark, theme } = useAppTheme();

  const {
    notes,
    activeNoteId,
    isPremium,
    createNote,
    setActiveNote,
    updateNoteTitle,
    setNoteMode,
    updateTextContent,
    addItem,
    updateItem,
    toggleItem,
    deleteItem,
    clearCheckedItems,
    deleteNote,
    shakeToClearEnabled,
  } = useNoteStore();

  const note = notes.find((n) => n.id === activeNoteId);
  const { impact, notification, ImpactStyle, NotificationType } = useHaptics();

  // Sort items: unchecked first, checked at bottom
  const sortedItems = note
    ? [...note.items.filter((item) => !item.checked), ...note.items.filter((item) => item.checked)]
    : [];

  const [newItemText, setNewItemText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showClearedMessage, setShowClearedMessage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const newItemInputRef = useRef<TextInput>(null);
  const textContentRef = useRef<TextInput>(null);
  const lastShakeTime = useRef(0);

  // Tab animation - 0 = list active, 1 = text active
  const tabAnimation = useRef(new Animated.Value(note?.mode === "text" ? 1 : 0)).current;

  // Animate tabs when mode changes
  useEffect(() => {
    if (note) {
      Animated.spring(tabAnimation, {
        toValue: note.mode === "text" ? 1 : 0,
        useNativeDriver: false,
        tension: 100,
        friction: 12,
      }).start();
    }
  }, [note?.mode]);

  // Removed auto-focus - let users view notes without keyboard popping up
  // They can tap on the input field when they want to type

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

  // Shake detection - only on native platforms and if enabled
  useEffect(() => {
    if (Platform.OS === "web" || !shakeToClearEnabled) return;

    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let shakeCount = 0;
    let lastShakeDetect = 0;
    const SHAKE_THRESHOLD = 4.0; // Requires vigorous shaking
    const SHAKES_REQUIRED = 3; // Need 3 shake motions within 1 second

    Accelerometer.setUpdateInterval(100);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);
      const now = Date.now();

      if (deltaX + deltaY + deltaZ > SHAKE_THRESHOLD) {
        // Reset count if more than 1 second since last shake motion
        if (now - lastShakeDetect > 1000) {
          shakeCount = 0;
        }
        shakeCount++;
        lastShakeDetect = now;

        // Only trigger after multiple shake motions
        if (shakeCount >= SHAKES_REQUIRED) {
          handleShake();
          shakeCount = 0;
        }
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    });

    return () => subscription.remove();
  }, [handleShake, shakeToClearEnabled]);

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

  const handleNewNote = () => {
    if (!isPremium && notes.length >= 1) {
      notification(NotificationType.Warning);
      setShowPaywall(true);
      return;
    }
    
    impact(ImpactStyle.Medium);
    const newNoteId = createNote();
    setActiveNote(newNoteId);
  };

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
          {/* Back Button */}
          <Pressable
            onPress={() => router.replace("/")}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeftIcon color={theme.foreground} size={24} />
          </Pressable>

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

        {/* Empty state message */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text
            style={{
              fontSize: 28,
              color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
              ...fonts.regular,
            }}
          >
            No note selected
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)",
              marginTop: 8,
              ...fonts.regular,
            }}
          >
            tap "New note" to create one
          </Text>
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
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.background }}
      keyboardVerticalOffset={0}
    >
      <View style={{ flex: 1, paddingTop: 50 }}>
        {/* Top Navigation - 3 column grid */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginBottom: 16,
          }}
        >
          {/* Left column */}
          <View style={{ width: 80, alignItems: "flex-start" }}>
            <Pressable
              onPress={() => router.replace("/")}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ArrowLeftIcon color={theme.foreground} size={24} />
            </Pressable>
          </View>

          {/* Center column - Title */}
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginHorizontal: 8 }}>
            <TextInput
              value={note.title}
              onChangeText={(text) => {
                // Always capitalize first letter
                const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
                updateNoteTitle(note.id, capitalized);
              }}
              placeholder="Note title..."
              placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
              textAlign="center"
              autoCapitalize="sentences"
              numberOfLines={1}
              maxLength={20}
              // @ts-ignore - web only
              style={{
                fontSize: 20,
                color: theme.foreground,
                padding: 0,
                outlineStyle: "none",
                textAlign: "center",
                maxWidth: 120,
                ...fonts.medium,
              }}
            />
          </View>

          {/* Right column */}
          <View style={{ width: 80, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 16 }}>
            <Pressable onPress={() => setShowDeleteConfirm(true)}>
              <Text
                style={{
                  fontSize: 16,
                  color: "#FF4444",
                  ...fonts.regular,
                }}
              >
                Delete
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowSettings(true)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MoreIcon color={theme.foreground} size={24} />
            </Pressable>
          </View>
        </View>

        {/* Mode toggle - separate pills with animation */}
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 24,
            marginBottom: 24,
            gap: 8,
          }}
        >
          <Animated.View
            style={{
              flex: tabAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [2, 1],
              }),
            }}
          >
            <Pressable 
              onPress={() => setNoteMode(note.id, "list")} 
              style={{ 
                flexDirection: "row", 
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: isDark ? "#1A1A1A" : "#F0F0F0",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: theme.foreground,
                  opacity: note.mode === "list" ? 1 : 0.5,
                  ...fonts.medium,
                }}
              >
                List
              </Text>
              {note.items.length > 0 && (
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: theme.foreground,
                    opacity: note.mode === "list" ? 1 : 0.4,
                  }}
                />
              )}
            </Pressable>
          </Animated.View>
          <Animated.View
            style={{
              flex: tabAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 2],
              }),
            }}
          >
            <Pressable 
              onPress={() => setNoteMode(note.id, "text")} 
              style={{ 
                flexDirection: "row", 
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: isDark ? "#1A1A1A" : "#F0F0F0",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: theme.foreground,
                  opacity: note.mode === "text" ? 1 : 0.5,
                  ...fonts.medium,
                }}
              >
                Text
              </Text>
              {note.textContent.trim().length > 0 && (
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: theme.foreground,
                    opacity: note.mode === "text" ? 1 : 0.4,
                  }}
                />
              )}
            </Pressable>
          </Animated.View>
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
                  fontSize: 16,
                  color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
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
                fontSize: 16,
                color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                lineHeight: 24,
                minHeight: 300,
                outlineStyle: "none",
                ...fonts.regular,
              }}
            />
          </ScrollView>
        )}

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <View
            style={{
              position: "absolute",
              top: 100,
              right: 16,
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
