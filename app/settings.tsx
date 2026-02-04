import React from "react";
import {
  View,
  Text,
  Pressable,
  useColorScheme,
  SafeAreaView,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useNoteStore } from "@/stores/noteStore";
import { colors } from "@/constants/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? colors.dark : colors.light;

  const { drawerPeekHeight, setDrawerPeekHeight, isPremium, notes } =
    useNoteStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, padding: 20 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{ padding: 8, marginLeft: -8 }}
          >
            <Text style={{ color: theme.foreground, fontSize: 16 }}>
              ← Back
            </Text>
          </Pressable>
          <Text
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 18,
              fontWeight: "600",
              color: theme.foreground,
              marginRight: 40,
            }}
          >
            Settings
          </Text>
        </View>

        {/* Settings sections */}
        <View style={{ gap: 24 }}>
          {/* Drawer Height */}
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.foreground,
                opacity: 0.6,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Drawer
            </Text>
            <View
              style={{
                backgroundColor: isDark ? "#111" : "#F5F5F5",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: theme.foreground,
                  marginBottom: 12,
                }}
              >
                Peek Height
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                {[60, 80, 120, 160].map((height) => (
                  <Pressable
                    key={height}
                    onPress={() => setDrawerPeekHeight(height)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor:
                        drawerPeekHeight === height
                          ? theme.foreground
                          : isDark
                          ? "#222"
                          : "#E5E5E5",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color:
                          drawerPeekHeight === height
                            ? theme.background
                            : theme.foreground,
                        fontSize: 14,
                        fontWeight: drawerPeekHeight === height ? "600" : "400",
                      }}
                    >
                      {height}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Premium Status */}
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.foreground,
                opacity: 0.6,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Premium
            </Text>
            <View
              style={{
                backgroundColor: isDark ? "#111" : "#F5F5F5",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 16, color: theme.foreground }}>
                  Status
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: isPremium ? "#22C55E" : theme.foreground,
                    fontWeight: "600",
                  }}
                >
                  {isPremium ? "Premium" : "Free"}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.foreground,
                  opacity: 0.5,
                }}
              >
                {isPremium
                  ? "Unlimited notes enabled"
                  : `${notes.length}/1 notes used`}
              </Text>
              {!isPremium && (
                <Pressable
                  onPress={() => {
                    router.push("/paywall");
                  }}
                  style={{
                    marginTop: 16,
                    backgroundColor: theme.foreground,
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: theme.background,
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Unlock Premium — $4.99
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* About */}
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.foreground,
                opacity: 0.6,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              About
            </Text>
            <View
              style={{
                backgroundColor: isDark ? "#111" : "#F5F5F5",
                borderRadius: 12,
                padding: 16,
                gap: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 16, color: theme.foreground }}>
                  Version
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.foreground,
                    opacity: 0.5,
                  }}
                >
                  1.0.0
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
