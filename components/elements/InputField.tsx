import React from "react";
import { View, TextInput, TextInputProps, StyleProp, ViewStyle } from "react-native";
import { fonts } from "@/constants/theme";
import { scale, fontScale } from "@/constants/responsive";
import { useAppTheme } from "@/hooks/useAppTheme";

interface InputFieldProps extends Omit<TextInputProps, "style"> {
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function InputField({ rightIcon, style, ...inputProps }: InputFieldProps) {
  const { isDark, theme } = useAppTheme();

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.surfaceAlt,
          borderRadius: 20,
          paddingLeft: scale(16),
          paddingRight: rightIcon ? scale(6) : scale(16),
        },
        style,
      ]}
    >
      <TextInput
        placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
        underlineColorAndroid="transparent"
        {...inputProps}
        style={{
          flex: 1,
          paddingVertical: 12,
          fontSize: fontScale(15),
          color: theme.foreground,
          ...fonts.regular,
        }}
      />
      {rightIcon}
    </View>
  );
}
