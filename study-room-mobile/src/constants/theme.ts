// Theme color palettes for light and dark mode.
// Same key set so components can use theme.colors.primary, etc.

export type ThemeColors = {
  primary: string;
  green2: string;
  green3: string;
  darkAccent: string;
  white: string;
  black: string;
  neutral: string;
  offWhite: string;
  sycamore: string;
  marigold: string;
  teal: string;
  moss: string;
  rust: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray400: string;
  gray500: string;
  gray600: string;
  gray700: string;
  gray800: string;
  available: string;
  occupied: string;
  offline: string;
  almost_filled: string;
  accentBlue: string;
  success: string;
  warning: string;
  error: string;
};

export const lightColors: ThemeColors = {
  primary: "#05472A",
  green2: "#006435",
  green3: "#016C3A",
  darkAccent: "#04301D",
  white: "#FFFFFF",
  black: "#000000",
  neutral: "#756E65",
  offWhite: "#F9F7ED",
  sycamore: "#E7ECC3",
  marigold: "#AA8A00",
  teal: "#B5E3D8",
  moss: "#A4D65E",
  rust: "#FA4616",
  gray100: "#F5F5F5",
  gray200: "#E0E0E0",
  gray300: "#BDBDBD",
  gray400: "#9E9E9E",
  gray500: "#757575",
  gray600: "#616161",
  gray700: "#424242",
  gray800: "#212121",
  available: "#2EB159",
  occupied: "#CA2E2E",
  offline: "#9E9E9E",
  almost_filled: "#FFDC17",
  accentBlue: "#0078D4",
  success: "#28A745",
  warning: "#FFC107",
  error: "#DC3545",
};

export const darkColors: ThemeColors = {
  primary: "#0d6b3f",
  green2: "#008848",
  green3: "#01994a",
  darkAccent: "#05472A",
  white: "#E8E8E8",
  black: "#0a0a0a",
  neutral: "#9E9A92",
  offWhite: "#2d2a26",
  sycamore: "#3d4530",
  marigold: "#c4a020",
  teal: "#5a8a82",
  moss: "#6b8f4a",
  rust: "#FA4616",
  gray100: "#1a1a1a",
  gray200: "#2d2d2d",
  gray300: "#404040",
  gray400: "#9E9E9E",
  gray500: "#b0b0b0",
  gray600: "#c4c4c4",
  gray700: "#d8d8d8",
  gray800: "#e8e8e8",
  available: "#3dd16a",
  occupied: "#e04a4a",
  offline: "#9E9E9E",
  almost_filled: "#FFE033",
  accentBlue: "#4da3f6",
  success: "#34c759",
  warning: "#FFD43B",
  error: "#e85d5d",
};
