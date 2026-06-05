import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../stores/settingsStore';

export function useHaptics() {
  const hapticsEnabled = useSettingsStore(s => s.hapticsEnabled);

  const light = useCallback(() => {
    if (!hapticsEnabled) return;
    Haptics.selectionAsync().catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [hapticsEnabled]);

  const medium = useCallback(() => {
    if (!hapticsEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  }, [hapticsEnabled]);

  const success = useCallback(() => {
    if (!hapticsEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [hapticsEnabled]);

  return { light, medium, success };
}
