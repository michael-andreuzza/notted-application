import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  Platform,
  useColorScheme,
  Dimensions,
} from "react-native";
import { useNoteStore } from "@/stores/noteStore";
import { NoteEditor } from "./NoteEditor";
import { colors } from "@/constants/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export function NoteDrawer() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? colors.dark : colors.light;

  const { notes, activeNoteId, createNote, setActiveNote } = useNoteStore();

  // Initialize with a note if none exists
  useEffect(() => {
    if (notes.length === 0) {
      createNote();
    } else if (!activeNoteId && notes.length > 0) {
      setActiveNote(notes[0].id);
    }
  }, [notes, activeNoteId, createNote, setActiveNote]);

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeNoteId),
    [notes, activeNoteId]
  );

  const content = activeNote ? (
    <NoteEditor note={activeNote} />
  ) : (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: theme.foreground, opacity: 0.5 }}>Loading...</Text>
    </View>
  );

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: SCREEN_HEIGHT - 100,
        backgroundColor: theme.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 10,
        paddingHorizontal: 20,
        paddingTop: 12,
      }}
    >
      {/* Drag handle */}
      <View
        style={{
          alignSelf: "center",
          width: 40,
          height: 4,
          backgroundColor: isDark ? "#333" : "#DDD",
          borderRadius: 2,
          marginBottom: 16,
        }}
      />
      {content}
    </View>
  );
}
