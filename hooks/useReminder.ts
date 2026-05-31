import { useCallback } from 'react';
import { scheduleReminder, cancelReminder, scheduleSnooze } from '../services/NotificationService';
import { updateTask } from '../db/queries/tasks';
import { Task } from '../types';

export function useReminder() {
  const schedule = useCallback(async (task: Task): Promise<void> => {
    if (task.reminderId) await cancelReminder(task.reminderId);
    const id = await scheduleReminder(task);
    if (id) updateTask(task.id, { reminderId: id });
  }, []);

  const cancel = useCallback(async (task: Task): Promise<void> => {
    if (task.reminderId) {
      await cancelReminder(task.reminderId);
      updateTask(task.id, { reminderId: null, reminderAt: null });
    }
  }, []);

  const snooze = useCallback(async (taskId: string, title: string, minutes: number): Promise<void> => {
    await scheduleSnooze(taskId, title, minutes);
  }, []);

  return { schedule, cancel, snooze };
}
