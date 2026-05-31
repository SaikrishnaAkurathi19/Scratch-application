import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

import { initDatabase } from '../db/client';
import {
  createAndroidChannel,
  setupNotificationListeners,
} from '../services/NotificationService';

import { useTaskStore } from '../stores/taskStore';
import { useListStore } from '../stores/listStore';

export default function RootLayout() {
  const { loadTasks } = useTaskStore();
  const { loadLists } = useListStore();

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
        await createAndroidChannel();

        loadTasks();
        loadLists();
      } catch (e) {
        console.error('Init error:', e);
      }
    }

    init();

    const cleanup = setupNotificationListeners((taskId: string) => {
      router.push(`/task/${taskId}` as any);
    });

    return cleanup;
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />

        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />

          <Stack.Screen
            name="task/new"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />

          <Stack.Screen
            name="task/[id]"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />

          <Stack.Screen
            name="list/new"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />

          <Stack.Screen
            name="list/[id]"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}