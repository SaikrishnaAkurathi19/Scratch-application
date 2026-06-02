import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '../types';
import { fromUnix } from '../utils/date';

// Configure how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false, // avoid badge permission issues on Android
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleReminder(task: Task): Promise<string | null> {
  if (!task.reminderAt) return null;

  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return null;

    const triggerDate = fromUnix(task.reminderAt);
    if (triggerDate <= new Date()) return null;

    let trigger: any;

    if (task.recurrence === 'daily') {
      trigger = {
        hour: triggerDate.getHours(),
        minute: triggerDate.getMinutes(),
        repeats: true,
      };
    } else if (task.recurrence === 'weekly') {
      trigger = {
        weekday: triggerDate.getDay() + 1,
        hour: triggerDate.getHours(),
        minute: triggerDate.getMinutes(),
        repeats: true,
      };
    } else {
      trigger = {
        date: triggerDate,
      };
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: task.title,
        body: task.notes ?? 'Tap to view task',
        data: { taskId: task.id },
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
      },
      trigger,
    });

    return id;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
}

export async function cancelReminder(reminderId: string | null): Promise<void> {
  if (!reminderId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(reminderId);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
}

export async function cancelAllReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.error('Failed to cancel all notifications:', e);
  }
}

export function setupNotificationListeners(
  onTap: (taskId: string) => void
): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener(response => {
    const taskId = response.notification.request.content.data?.taskId;
    if (taskId) onTap(taskId as string);
  });
  return () => sub.remove();
}

export async function scheduleSnooze(
  taskId: string,
  title: string,
  minutes: number
): Promise<void> {
  try {
    const snoozeDate = new Date(Date.now() + minutes * 60 * 1000);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${title}`,
        body: 'Snoozed reminder',
        data: { taskId },
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
      },
      trigger: { date: snoozeDate },
    });
  } catch (e) {
    console.error('Failed to schedule snooze:', e);
  }
}

export async function createAndroidChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Scratch Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6C63FF',
        sound: 'default',
      });
    } catch (e) {
      console.error('Failed to create Android channel:', e);
    }
  }
}
