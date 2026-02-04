import React, { useState, useRef } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { NoteItem } from "@/stores/noteStore";
import { colors, fonts } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";

interface ChecklistItemProps {
  item: NoteItem;
  onToggle: () => void;
  onUpdate: (text: string) => void;
  onDelete: () => void;
  isDark: boolean;
}

export function ChecklistItem({
  item,
  onToggle,
  onUpdate,
  onDelete,
  isDark,
}: ChecklistItemProps) {
  const theme = isDark ? colors.dark : colors.light;
  const { impact, notification, ImpactStyle, NotificationType } = useHaptics();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const inputRef = useRef<TextInput>(null);

  const handlePress = () => {
    setIsEditing(true);
    setEditText(item.text);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editText.trim() === "") {
      notification(NotificationType.Warning);
      onDelete();
    } else if (editText !== item.text) {
      onUpdate(editText);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === "Backspace" && editText === "") {
      onDelete();
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        marginBottom: 4,
      }}
    >
      {/* Checkbox */}
      <Pressable
        onPress={() => {
          impact(ImpactStyle.Light);
          onToggle();
        }}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: item.checked
            ? theme.foreground
            : isDark
            ? "#444"
            : "#CCC",
          backgroundColor: item.checked ? theme.foreground : "transparent",
          marginRight: 12,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {item.checked && (
          <Text
            style={{
              color: theme.background,
              fontSize: 12,
              ...fonts.regular,
            }}
          >
            ✓
          </Text>
        )}
      </Pressable>

      {/* Text */}
      {isEditing ? (
        <TextInput
          ref={inputRef}
          value={editText}
          onChangeText={setEditText}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          returnKeyType="done"
          onSubmitEditing={handleBlur}
          autoCapitalize="sentences"
          // @ts-ignore - web only
          style={{
            flex: 1,
            fontSize: 18,
            color: theme.foreground,
            padding: 0,
            opacity: item.checked ? 0.3 : 1,
            textDecorationLine: item.checked ? "line-through" : "none",
            outlineStyle: "none",
            textTransform: "capitalize",
            ...fonts.regular,
          }}
        />
      ) : (
        <Pressable onPress={handlePress} style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              color: theme.foreground,
              opacity: item.checked ? 0.3 : 1,
              textDecorationLine: item.checked ? "line-through" : "none",
              textTransform: "capitalize",
              ...fonts.regular,
            }}
          >
            {item.text}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
