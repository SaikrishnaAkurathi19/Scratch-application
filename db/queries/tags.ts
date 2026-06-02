import { getDatabase } from '../client';
import { Tag } from '../../types';
import { generateId } from '../../utils/uuid';

export function getAllTags(): Tag[] {
  const db = getDatabase();
  return db.getAllSync<any>('SELECT * FROM tags ORDER BY name ASC').map(r => ({
    id: r.id, name: r.name, color: r.color, createdAt: r.created_at,
  }));
}

export function createTag(name: string, color: string): Tag {
  const db = getDatabase();
  const now = Math.floor(Date.now() / 1000);
  const id = generateId();
  db.runSync('INSERT INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)', [id, name, color, now]);
  return { id, name, color, createdAt: now };
}

export function deleteTag(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM tags WHERE id = ?', [id]);
}

export function addTagToTask(taskId: string, tagId: string): void {
  const db = getDatabase();
  db.runSync('INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)', [taskId, tagId]);
}

export function removeTagFromTask(taskId: string, tagId: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?', [taskId, tagId]);
}

export function getTagsForTask(taskId: string): Tag[] {
  const db = getDatabase();
  return db.getAllSync<any>(
    `SELECT t.* FROM tags t INNER JOIN task_tags tt ON t.id = tt.tag_id WHERE tt.task_id = ?`,
    [taskId]
  ).map(r => ({ id: r.id, name: r.name, color: r.color, createdAt: r.created_at }));
}
