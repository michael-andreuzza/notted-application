import React, { useState } from "react";
import { View, Text, Pressable, useColorScheme, Modal, Alert, Platform } from "react-native";
import { colors, fonts } from "@/constants/theme";
import { useNoteStore, ThemeMode } from "@/stores/noteStore";

const CARD_MARGIN_X = 12;
const CARD_MARGIN_BOTTOM = 12;

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const systemColorScheme = useColorScheme();
  const { themeMode, setThemeMode, hapticsEnabled, setHapticsEnabled, setHasSeenOnboarding, resetAllData } = useNoteStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Determine actual theme based on mode
  const isDark = themeMode === "system" 
    ? systemColorScheme === "dark" 
    : themeMode === "dark";
  const theme = isDark ? colors.dark : colors.light;

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: "system", label: "System" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        {/* Tap outside to close */}
        <Pressable 
          onPress={onClose} 
          style={{ flex: 1 }} 
        />

        {/* Floating Card */}
        <View
          style={{
            position: "absolute",
            bottom: CARD_MARGIN_BOTTOM,
            left: CARD_MARGIN_X,
            right: CARD_MARGIN_X,
            backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
            borderRadius: 24,
            padding: 24,
            paddingTop: 16,
          }}
        >
          {/* Drag handle */}
          <View
            style={{
              alignSelf: "center",
              width: 36,
              height: 4,
              backgroundColor: isDark ? "#333" : "#DDD",
              borderRadius: 2,
              marginBottom: 24,
            }}
          />

          {/* Title */}
          <Text
            style={{
              fontSize: 28,
              color: theme.foreground,
              marginBottom: 32,
              ...fonts.regular,
            }}
          >
            Settings
          </Text>

          {/* Theme Section */}
          <Text
            style={{
              fontSize: 14,
              color: theme.foreground,
              opacity: 0.4,
              marginBottom: 16,
              ...fonts.regular,
            }}
          >
            Theme
          </Text>

          <View style={{ gap: 8, marginBottom: 32 }}>
            {themeOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setThemeMode(option.value)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor:
                    themeMode === option.value
                      ? isDark
                        ? "#222"
                        : "#F0F0F0"
                      : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.foreground,
                    ...fonts.regular,
                  }}
                >
                  {option.label}
                </Text>
                {themeMode === option.value && (
                  <Text
                    style={{
                      fontSize: 16,
                      color: theme.foreground,
                      ...fonts.regular,
                    }}
                  >
                    ✓
                  </Text>
                )}
              </Pressable>
            ))}
          </View>

          {/* Vibration Section */}
          <Text
            style={{
              fontSize: 14,
              color: theme.foreground,
              opacity: 0.4,
              marginBottom: 16,
              ...fonts.regular,
            }}
          >
            Feedback
          </Text>

          <Pressable
            onPress={() => setHapticsEnabled(!hapticsEnabled)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: hapticsEnabled
                ? isDark
                  ? "#222"
                  : "#F0F0F0"
                : "transparent",
              marginBottom: 32,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: theme.foreground,
                ...fonts.regular,
              }}
            >
              Vibration
            </Text>
            {hapticsEnabled && (
              <Text
                style={{
                  fontSize: 16,
                  color: theme.foreground,
                  ...fonts.regular,
                }}
              >
                ✓
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              setHasSeenOnboarding(false);
              onClose();
            }}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              marginBottom: 32,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: theme.foreground,
                ...fonts.regular,
              }}
            >
              Show Onboarding
            </Text>
          </Pressable>

          {/* Delete Data Section */}
          <Text
            style={{
              fontSize: 14,
              color: theme.foreground,
              opacity: 0.4,
              marginBottom: 16,
              ...fonts.regular,
            }}
          >
            Data
          </Text>

          {!showDeleteConfirm ? (
            <Pressable
              onPress={() => setShowDeleteConfirm(true)}
              style={{
                paddingVertical: 12,
                marginBottom: 32,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "#FF4444",
                  ...fonts.regular,
                }}
              >
                Delete All Data
              </Text>
            </Pressable>
          ) : (
            <View style={{ marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.foreground,
                  opacity: 0.6,
                  marginBottom: 16,
                  ...fonts.regular,
                }}
              >
                This will delete all your notes permanently.
              </Text>
              <View style={{ flexDirection: "row", gap: 24 }}>
                <Pressable onPress={() => setShowDeleteConfirm(false)}>
                  <Text style={{ color: theme.foreground, fontSize: 16, ...fonts.regular }}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    resetAllData();
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                >
                  <Text style={{ color: "#FF4444", fontSize: 16, ...fonts.regular }}>
                    Delete
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Done button */}
          <Pressable
            onPress={onClose}
            style={{
              backgroundColor: theme.foreground,
              paddingVertical: 16,
              borderRadius: 28,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: theme.background,
                fontSize: 16,
                ...fonts.regular,
              }}
            >
              Done
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
