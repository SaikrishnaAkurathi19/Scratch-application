import { useColorScheme } from 'react-native';
import { LightColors, DarkColors, PriorityColors } from '../constants/colors';
import { Priority } from '../types';
import { useSettingsStore } from '../stores/settingsStore';

export function useTheme() {
  const scheme = useColorScheme();
  const darkModeOverride = useSettingsStore(s => s.darkModeOverride);

  const isDark =
    darkModeOverride === 'dark' ? true :
    darkModeOverride === 'light' ? false :
    scheme === 'dark';

  const colors = isDark ? DarkColors : LightColors;
  const priorityColors = isDark ? PriorityColors.dark : PriorityColors.light;

  function getPriorityColors(priority: Priority) {
    return priorityColors[priority];
  }

  return { colors, isDark, getPriorityColors };
}
