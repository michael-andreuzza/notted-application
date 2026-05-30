import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BASE_WIDTH = 375; // iPhone design baseline
const MAX_SCALE = 1.3; // Cap growth so the phone layout doesn't balloon on tablets

// Width ratio, clamped so large iPad screens don't oversize the UI.
const widthRatio = Math.min(SCREEN_WIDTH / BASE_WIDTH, MAX_SCALE);

// Scale size proportionally to screen width (capped for tablets)
export const scale = (size: number): number => {
  return Math.round(widthRatio * size);
};

// For font sizes - with a cap to prevent huge text on tablets
export const fontScale = (size: number): number => {
  return Math.round(Math.min(widthRatio * size, size * 1.3)); // Cap at 130%
};
