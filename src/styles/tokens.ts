// src/styles/tokens.ts

// Color Palette - Modern/Friendly Blue Theme
export const colors = {
  // Primary Colors
  primary: "#1677ff",
  primaryLight: "#40a9ff",
  primaryDark: "#0050b3",

  // Secondary Colors
  secondary: "#52c41a",
  secondaryLight: "#85ce61",
  secondaryDark: "#389e0d",

  // Status Colors
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  info: "#1677ff",

  // Neutral Colors
  white: "#ffffff",
  black: "#000000",
  gray100: "#fafafa",
  gray200: "#f5f5f5",
  gray300: "#f0f0f0",
  gray400: "#d9d9d9",
  gray500: "#bfbfbf",
  gray600: "#8c8c8c",
  gray700: "#595959",
  gray800: "#262626",
  gray900: "#141414",

  // Text Colors
  text: {
    primary: "#262626",
    secondary: "#8c8c8c",
    tertiary: "#bfbfbf",
    inverse: "#ffffff",
  },

  // Background Colors
  bg: {
    primary: "#ffffff",
    secondary: "#fafafa",
    tertiary: "#f5f5f5",
    overlay: "rgba(0, 0, 0, 0.45)",
  },

  // Interactive Colors
  hover: "#e6f7ff",
  active: "#bae0ff",
  disabled: "#f5f5f5",

  // Drag & Drop Feedback
  dragFeedback: "#1677ff",
  dragFeedbackBg: "rgba(22, 119, 255, 0.08)",
  dragFeedbackBorder: "#1677ff",
};

// Spacing Scale (8px base)
export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  xxl: "32px",
  xxxl: "48px",
};

// Typography
export const typography = {
  // Font Families
  fontFamily: {
    base: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    mono: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
  },

  // Font Sizes
  fontSize: {
    xs: "12px",
    sm: "13px",
    base: "14px",
    md: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "32px",
  },

  // Font Weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Border Radius
export const borderRadius = {
  none: "0",
  sm: "2px",
  md: "4px",
  lg: "8px",
  xl: "12px",
  full: "9999px",
};

// Shadows
export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
  dragOver:
    "0 0 0 2px rgba(22, 119, 255, 0.2), inset 0 0 0 1px rgba(22, 119, 255, 0.2)",
};

// Transitions
export const transitions = {
  fast: "0.15s ease-in-out",
  base: "0.3s ease-in-out",
  slow: "0.5s ease-in-out",

  // Common properties
  color: "color 0.3s ease-in-out",
  background: "background-color 0.3s ease-in-out",
  border: "border-color 0.3s ease-in-out",
  all: "all 0.3s ease-in-out",
};

// Breakpoints
export const breakpoints = {
  xs: "320px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

// Z-Index Scale
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  notification: 800,
  drag: 1000,
};

// Export all tokens as a single theme object
export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  zIndex,
};

export default theme;
