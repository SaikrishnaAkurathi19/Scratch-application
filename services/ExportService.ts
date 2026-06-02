import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getDatabase } from '../db/client';

export async function exportData(): Promise<void> {
  const db = getDatabase();

  const tasks    = db.getAllSync('SELECT * FROM tasks');
  const subtasks = db.getAllSync('SELECT * FROM subtasks');
  const lists    = db.getAllSync('SELECT * FROM lists');
  const tags     = db.getAllSync('SELECT * FROM tags');
  const taskTags = db.getAllSync('SELECT * FROM task_tags');
  const stats    = db.getAllSync('SELECT * FROM stats');

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    data: { tasks, subtasks, lists, tags, taskTags, stats },
  };

  const json = JSON.stringify(exportPayload, null, 2);
  const filename = `scratch-backup-${new Date().toISOString().split('T')[0]}.json`;
  const path = `${FileSystem.documentDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(path, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(path, {
      mimeType: 'application/json',
      dialogTitle: 'Export Scratch data',
    });
  }
}
