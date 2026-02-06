import React, { useState, useRef } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { NoteItem } from "@/stores/noteStore";
import { colors, fonts } from "@/constants/theme";
import { scale, fontScale } from "@/constants/responsive";
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
        paddingVertical: 6,
        marginBottom: 2,
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
          width: scale(24),
          height: scale(24),
          borderRadius: 6,
          borderWidth: 2,
          borderColor: item.checked
            ? theme.foreground
            : theme.disabled,
          backgroundColor: item.checked ? theme.foreground : "transparent",
          marginRight: scale(14),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {item.checked && (
          <Text
            style={{
              color: theme.background,
              fontSize: fontScale(14),
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
            fontSize: fontScale(28),
            color: item.checked 
              ? (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)")
              : theme.foreground,
            padding: 0,
            textDecorationLine: item.checked ? "line-through" : "none",
            outlineStyle: "none",
            ...fonts.medium,
          }}
        />
      ) : (
        <Pressable onPress={handlePress} style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: fontScale(28),
              color: item.checked 
                ? (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)")
                : theme.foreground,
              textDecorationLine: item.checked ? "line-through" : "none",
              ...fonts.medium,
            }}
          >
            {item.text}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
