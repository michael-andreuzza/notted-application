import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useColorScheme,
} from "react-native";
import { useNoteStore, Note } from "@/stores/noteStore";
import { colors } from "@/constants/theme";

interface NoteTabsProps {
  onNewNote: () => void;
}

export function NoteTabs({ onNewNote }: NoteTabsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? colors.dark : colors.light;

  const { notes, activeNoteId, setActiveNote, isPremium } = useNoteStore();

  const canAddNote = isPremium || notes.length < 1;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {notes.map((note) => (
          <Pressable
            key={note.id}
            onPress={() => setActiveNote(note.id)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 16,
              backgroundColor:
                activeNoteId === note.id
                  ? theme.muted
                  : "transparent",
            }}
          >
            <Text
              style={{
                color: theme.foreground,
                fontSize: 14,
                fontWeight: activeNoteId === note.id ? "600" : "400",
                opacity: activeNoteId === note.id ? 1 : 0.6,
              }}
              numberOfLines={1}
            >
              {note.title || "Untitled"}
            </Text>
          </Pressable>
        ))}

        {/* Add new note button */}
        <Pressable
          onPress={canAddNote ? onNewNote : undefined}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 16,
            opacity: canAddNote ? 1 : 0.3,
          }}
        >
          <Text
            style={{
              color: theme.foreground,
              fontSize: 14,
              fontWeight: "400",
            }}
          >
            + New
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
