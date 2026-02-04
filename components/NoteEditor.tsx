import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  useColorScheme,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useNoteStore, Note } from "@/stores/noteStore";
import { colors } from "@/constants/theme";
import { ChecklistItem } from "./ChecklistItem";
import { NoteTabs } from "./NoteTabs";
import { SettingsIcon } from "./icons/SettingsIcon";

interface NoteEditorProps {
  note: Note;
}

export function NoteEditor({ note }: NoteEditorProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? colors.dark : colors.light;

  const {
    notes,
    isPremium,
    createNote,
    updateNoteTitle,
    setNoteMode,
    updateTextContent,
    addItem,
    updateItem,
    toggleItem,
    deleteItem,
    reorderItems,
  } = useNoteStore();

  const [newItemText, setNewItemText] = useState("");
  const newItemInputRef = useRef<TextInput>(null);

  const handleAddItem = () => {
    if (newItemText.trim()) {
      addItem(note.id, newItemText.trim());
      setNewItemText("");
    }
  };

  const handleSubmitEditing = () => {
    handleAddItem();
    // Keep focus on input for continuous adding
    newItemInputRef.current?.focus();
  };

  const handleNewNote = () => {
    if (isPremium || notes.length < 1) {
      createNote();
    } else {
      router.push("/paywall");
    }
  };

  const showTabs = notes.length > 1 || isPremium;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={100}
    >
      <View style={{ flex: 1 }}>
        {/* Note tabs (only show if multiple notes or premium) */}
        {showTabs && <NoteTabs onNewNote={handleNewNote} />}

        {/* Header with title and settings */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
            paddingTop: showTabs ? 0 : 8,
          }}
        >
          <TextInput
            value={note.title}
            onChangeText={(text) => updateNoteTitle(note.id, text)}
            placeholder="Note title..."
            placeholderTextColor={isDark ? "#666" : "#999"}
            style={{
              flex: 1,
              fontSize: 20,
              fontWeight: "600",
              color: theme.foreground,
              padding: 0,
            }}
          />
          <Pressable
            onPress={() => router.push("/settings")}
            style={{ padding: 8 }}
          >
            <SettingsIcon color={theme.foreground} size={20} />
          </Pressable>
        </View>

        {/* Mode toggle */}
        <View
          style={{
            flexDirection: "row",
            marginBottom: 16,
            gap: 8,
          }}
        >
          <Pressable
            onPress={() => setNoteMode(note.id, "list")}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor:
                note.mode === "list"
                  ? isDark
                    ? "#222"
                    : "#EEE"
                  : "transparent",
            }}
          >
            <Text
              style={{
                color: theme.foreground,
                fontSize: 14,
                fontWeight: note.mode === "list" ? "600" : "400",
              }}
            >
              List
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setNoteMode(note.id, "text")}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor:
                note.mode === "text"
                  ? isDark
                    ? "#222"
                    : "#EEE"
                  : "transparent",
            }}
          >
            <Text
              style={{
                color: theme.foreground,
                fontSize: 14,
                fontWeight: note.mode === "text" ? "600" : "400",
              }}
            >
              Text
            </Text>
          </Pressable>
        </View>

        {/* Content area */}
        {note.mode === "list" ? (
          <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
            {/* Existing items */}
            {note.items.map((item, index) => (
              <ChecklistItem
                key={item.id}
                item={item}
                index={index}
                onToggle={() => toggleItem(note.id, item.id)}
                onUpdate={(text) => updateItem(note.id, item.id, text)}
                onDelete={() => deleteItem(note.id, item.id)}
                onReorder={(from, to) => reorderItems(note.id, from, to)}
                totalItems={note.items.length}
                isDark={isDark}
              />
            ))}

            {/* New item input */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: isDark ? "#444" : "#CCC",
                  marginRight: 12,
                }}
              />
              <TextInput
                ref={newItemInputRef}
                value={newItemText}
                onChangeText={setNewItemText}
                onSubmitEditing={handleSubmitEditing}
                placeholder="Add item..."
                placeholderTextColor={isDark ? "#666" : "#999"}
                returnKeyType="done"
                blurOnSubmit={false}
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: theme.foreground,
                  padding: 0,
                }}
              />
            </View>
          </ScrollView>
        ) : (
          <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
            <TextInput
              value={note.textContent}
              onChangeText={(text) => updateTextContent(note.id, text)}
              placeholder="Start writing..."
              placeholderTextColor={isDark ? "#666" : "#999"}
              multiline
              textAlignVertical="top"
              style={{
                flex: 1,
                fontSize: 16,
                color: theme.foreground,
                lineHeight: 24,
                minHeight: 200,
              }}
            />
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
