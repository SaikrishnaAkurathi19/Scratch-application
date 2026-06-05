import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsStore {
  defaultReminderHour: number;
  defaultReminderMinute: number;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  darkModeOverride: 'system' | 'dark' | 'light';
  setDefaultReminderTime: (hour: number, minute: number) => void;
  setHapticsEnabled: (val: boolean) => void;
  setSoundEnabled: (val: boolean) => void;
  setDarkModeOverride: (val: 'system' | 'dark' | 'light') => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      defaultReminderHour: 9,
      defaultReminderMinute: 0,
      hapticsEnabled: true,
      soundEnabled: true,
      darkModeOverride: 'system' as 'system' | 'dark' | 'light',
      setDefaultReminderTime: (hour, minute) => set({ defaultReminderHour: hour, defaultReminderMinute: minute }),
      setHapticsEnabled: (val) => set({ hapticsEnabled: val }),
      setSoundEnabled: (val) => set({ soundEnabled: val }),
      setDarkModeOverride: (val) => set({ darkModeOverride: val }),
    }),
    {
      name: 'scratch-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
