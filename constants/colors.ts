// Light mode
export const LightColors = {
  primary: '#6C63FF',
  primaryLight: '#f0eeff',
  primaryMid: '#ede9ff',

  high: '#E24B4A',
  highBg: '#fff0f0',
  highBorder: '#fcc',

  medium: '#F59E0B',
  mediumBg: '#fffbeb',
  mediumBorder: '#fde68a',

  low: '#16A34A',
  lowBg: '#f0fdf4',
  lowBorder: '#bbf7d0',

  text: '#1a1a2e',
  textSecondary: '#9b9bb4',
  textTertiary: '#bbb',

  background: '#ffffff',
  backgroundSecondary: '#f8f7ff',
  backgroundTertiary: '#f0eef8',

  border: '#f0f0f6',
  borderMid: '#ede9ff',

  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#E24B4A',

  white: '#ffffff',
  black: '#000000',

  streakGold: '#F59E0B',
  streakGradientStart: '#6C63FF',
  streakGradientEnd: '#a78bfa',

  tabInactive: '#ccc',
  tabActive: '#6C63FF',
  
  card: '#ffffff',
  cardBorder: '#f0f0f6',
  overlay: 'rgba(0,0,0,0.4)',
  trashBg: '#fff5f5',
};

// Dark mode
export const DarkColors = {
  primary: '#7C74FF',
  primaryLight: '#1e1a3a',
  primaryMid: '#252040',

  high: '#FF6B6B',
  highBg: '#2d1a1a',
  highBorder: '#5c2020',

  medium: '#FFC947',
  mediumBg: '#2d2510',
  mediumBorder: '#5c4a10',

  low: '#4ADE80',
  lowBg: '#132010',
  lowBorder: '#1f4a20',

  text: '#f0f0ff',
  textSecondary: '#8080a0',
  textTertiary: '#555570',

  background: '#0f0f1a',
  backgroundSecondary: '#161625',
  backgroundTertiary: '#1c1c30',

  border: '#252535',
  borderMid: '#2a2a40',

  success: '#4ADE80',
  warning: '#FFC947',
  danger: '#FF6B6B',

  white: '#ffffff',
  black: '#000000',

  streakGold: '#FFC947',
  streakGradientStart: '#7C74FF',
  streakGradientEnd: '#b8aaff',

  tabInactive: '#404060',
  tabActive: '#7C74FF',
  
  card: '#161625',
  cardBorder: '#252535',
  overlay: 'rgba(0,0,0,0.7)',
  trashBg: '#200f0f',
};

// Default export - will be overridden by theme context
export let Colors = LightColors;

export function setColorScheme(dark: boolean) {
  Colors = dark ? DarkColors : LightColors;
}

export const PriorityColors = {
  light: {
    none: { text: LightColors.textSecondary, bg: LightColors.backgroundSecondary, border: LightColors.border, checkBorder: LightColors.border },
    high: { text: LightColors.high, bg: LightColors.highBg, border: LightColors.high, checkBorder: LightColors.high },
    medium: { text: LightColors.medium, bg: LightColors.mediumBg, border: LightColors.medium, checkBorder: LightColors.medium },
    low: { text: LightColors.low, bg: LightColors.lowBg, border: LightColors.low, checkBorder: LightColors.border },
  },
  dark: {
    none: { text: DarkColors.textSecondary, bg: DarkColors.backgroundSecondary, border: DarkColors.border, checkBorder: DarkColors.border },
    high: { text: DarkColors.high, bg: DarkColors.highBg, border: DarkColors.high, checkBorder: DarkColors.high },
    medium: { text: DarkColors.medium, bg: DarkColors.mediumBg, border: DarkColors.medium, checkBorder: DarkColors.medium },
    low: { text: DarkColors.low, bg: DarkColors.lowBg, border: DarkColors.low, checkBorder: DarkColors.border },
  },
};

export const ListColors = [
  '#6C63FF', '#3B82F6', '#D97706', '#16A34A',
  '#E24B4A', '#D946EF', '#0891B2', '#EA580C',
];

export const ListIcons = [
  'person', 'briefcase', 'cart', 'heart',
  'home', 'book', 'star', 'bulb',
  'fitness', 'school', 'restaurant', 'wallet',
  'car', 'airplane', 'calendar-outline', 'sparkles',
];

export const WorkNatureColors: Record<string, string> = {
  personal: '#6C63FF',
  work: '#3B82F6',
  shopping: '#D97706',
  health: '#16A34A',
  other: '#9B9BB4',
};

export const WorkNatureIcons: Record<string, string> = {
  personal: 'person',
  work: 'briefcase',
  shopping: 'cart',
  health: 'fitness',
  other: 'ellipsis-horizontal',
};
