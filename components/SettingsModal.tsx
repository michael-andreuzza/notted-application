import React, { useState } from "react";
import { View, Text, Pressable, useColorScheme, Modal, ScrollView } from "react-native";
import { colors, fonts } from "@/constants/theme";
import { useNoteStore, ThemeMode } from "@/stores/noteStore";
import { CloseIcon } from "@/components/icons/CloseIcon";

const CARD_MARGIN_X = 12;
const CARD_MARGIN_BOTTOM = 12;

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const systemColorScheme = useColorScheme();
  const { themeMode, setThemeMode, hapticsEnabled, setHapticsEnabled, shakeToClearEnabled, setShakeToClearEnabled, setHasSeenOnboarding, resetAllData } = useNoteStore();
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
            borderRadius: 20,
            padding: 20,
            maxHeight: "70%",
          }}
        >
          {/* Close button */}
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 1,
            }}
          >
            <CloseIcon color={theme.foreground} size={20} />
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text
              style={{
                fontSize: 20,
                color: theme.foreground,
                marginBottom: 20,
                ...fonts.regular,
              }}
            >
              Settings
            </Text>

            {/* Theme Section */}
            <Text
              style={{
                fontSize: 12,
                color: theme.foreground,
                opacity: 0.4,
                marginBottom: 8,
                ...fonts.regular,
              }}
            >
              Theme
            </Text>

            <View
              style={{
                flexDirection: "row",
                backgroundColor: isDark ? "#222" : "#F0F0F0",
                borderRadius: 10,
                padding: 4,
                marginBottom: 20,
              }}
            >
              {themeOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setThemeMode(option.value)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: "center",
                    backgroundColor:
                      themeMode === option.value
                        ? isDark
                          ? "#333"
                          : "#FFFFFF"
                        : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.foreground,
                      opacity: themeMode === option.value ? 1 : 0.5,
                      ...fonts.regular,
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Feedback Section */}
            <Text
              style={{
                fontSize: 12,
                color: theme.foreground,
                opacity: 0.4,
                marginBottom: 8,
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
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 10,
                backgroundColor: hapticsEnabled
                  ? isDark
                    ? "#222"
                    : "#F0F0F0"
                  : "transparent",
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: theme.foreground,
                  ...fonts.regular,
                }}
              >
                Vibration
              </Text>
              {hapticsEnabled && (
                <Text
                  style={{
                    fontSize: 15,
                    color: theme.foreground,
                    ...fonts.regular,
                  }}
                >
                  ✓
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => setShakeToClearEnabled(!shakeToClearEnabled)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 10,
                backgroundColor: shakeToClearEnabled
                  ? isDark
                    ? "#222"
                    : "#F0F0F0"
                  : "transparent",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: theme.foreground,
                  ...fonts.regular,
                }}
              >
                Shake to clear
              </Text>
              {shakeToClearEnabled && (
                <Text
                  style={{
                    fontSize: 15,
                    color: theme.foreground,
                    ...fonts.regular,
                  }}
                >
                  ✓
                </Text>
              )}
            </Pressable>

            {/* Other options */}
            <Pressable
              onPress={() => {
                setHasSeenOnboarding(false);
                onClose();
              }}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
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
                fontSize: 12,
                color: theme.foreground,
                opacity: 0.4,
                marginBottom: 8,
                ...fonts.regular,
              }}
            >
              Data
            </Text>

            {!showDeleteConfirm ? (
              <Pressable
                onPress={() => setShowDeleteConfirm(true)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: "#FF4444",
                    ...fonts.regular,
                  }}
                >
                  Delete All Data
                </Text>
              </Pressable>
            ) : (
              <View style={{ marginBottom: 20, paddingHorizontal: 12 }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: theme.foreground,
                    opacity: 0.6,
                    marginBottom: 12,
                    ...fonts.regular,
                  }}
                >
                  This will delete all your notes permanently.
                </Text>
                <View style={{ flexDirection: "row", gap: 20 }}>
                  <Pressable onPress={() => setShowDeleteConfirm(false)}>
                    <Text style={{ color: theme.foreground, fontSize: 15, ...fonts.regular }}>
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
                    <Text style={{ color: "#FF4444", fontSize: 15, ...fonts.regular }}>
                      Delete
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Done button */}
          <Pressable
            onPress={onClose}
            style={{
              backgroundColor: theme.foreground,
              paddingVertical: 14,
              borderRadius: 24,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Text
              style={{
                color: theme.background,
                fontSize: 15,
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
