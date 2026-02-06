import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BASE_WIDTH = 375; // iPhone design baseline

// Scale size proportionally to screen width
export const scale = (size: number): number => {
  return Math.round((SCREEN_WIDTH / BASE_WIDTH) * size);
};

// For font sizes - with a cap to prevent huge text on tablets
export const fontScale = (size: number): number => {
  const scaled = (SCREEN_WIDTH / BASE_WIDTH) * size;
  return Math.round(Math.min(scaled, size * 1.3)); // Cap at 130%
};
