import { getDatabase } from '../client';
import { List, Stats } from '../../types';
import { generateId } from '../../utils/uuid';
import { todayISO, daysAgo } from '../../utils/date';

function rowToList(row: any): List {
  return {
    id: row.id, name: row.name, color: row.color,
    icon: row.icon, isDefault: row.is_default,
    sortOrder: row.sort_order, createdAt: row.created_at,
  };
}

export function getAllLists(): List[] {
  const db = getDatabase();
  return db.getAllSync<any>('SELECT * FROM lists ORDER BY sort_order ASC, created_at ASC')
    .map(rowToList);
}

export function getListById(id: string): List | null {
  const db = getDatabase();
  const row = db.getFirstSync<any>('SELECT * FROM lists WHERE id = ?', [id]);
  return row ? rowToList(row) : null;
}

export function createList(data: { name: string; color: string; icon: string }): List {
  const db = getDatabase();
  const now = Math.floor(Date.now() / 1000);
  const id = generateId();
  const max = db.getFirstSync<{ max_order: number }>('SELECT MAX(sort_order) as max_order FROM lists');
  db.runSync(
    'INSERT INTO lists (id, name, color, icon, is_default, sort_order, created_at) VALUES (?, ?, ?, ?, 0, ?, ?)',
    [id, data.name, data.color, data.icon, (max?.max_order ?? -1) + 1, now]
  );
  return getListById(id)!;
}

export function updateList(id: string, data: Partial<Pick<List, 'name' | 'color' | 'icon'>>): void {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  if (data.name)  { fields.push('name = ?');  values.push(data.name); }
  if (data.color) { fields.push('color = ?'); values.push(data.color); }
  if (data.icon)  { fields.push('icon = ?');  values.push(data.icon); }
  if (!fields.length) return;
  values.push(id);
  db.runSync(`UPDATE lists SET ${fields.join(', ')} WHERE id = ?`, values);
}

export function deleteList(id: string): void {
  const db = getDatabase();
  // Move tasks to first default list
  const defaultList = db.getFirstSync<{ id: string }>(
    'SELECT id FROM lists WHERE is_default = 1 AND id != ? LIMIT 1', [id]
  );
  if (defaultList) {
    db.runSync('UPDATE tasks SET list_id = ? WHERE list_id = ?', [defaultList.id, id]);
  }
  db.runSync('DELETE FROM lists WHERE id = ? AND is_default = 0', [id]);
}

// Stats queries
export function getStats(): Stats {
  const db = getDatabase();
  const row = db.getFirstSync<any>('SELECT * FROM stats WHERE id = 1');
  return {
    id: 1,
    currentStreak: row?.current_streak ?? 0,
    longestStreak: row?.longest_streak ?? 0,
    lastCompletedDate: row?.last_completed_date ?? null,
    totalCompleted: row?.total_completed ?? 0,
  };
}

export function recordTaskCompletion(): void {
  const db = getDatabase();
  const stats = getStats();
  const today = todayISO();

  if (stats.lastCompletedDate === today) {
    // Already recorded today
    db.runSync('UPDATE stats SET total_completed = total_completed + 1 WHERE id = 1');
    return;
  }

  let newStreak = 1;
  if (stats.lastCompletedDate) {
    const daysSince = daysAgo(stats.lastCompletedDate);
    newStreak = daysSince === 1 ? stats.currentStreak + 1 : 1;
  }

  const newLongest = Math.max(newStreak, stats.longestStreak);

  db.runSync(
    `UPDATE stats SET 
      current_streak = ?, longest_streak = ?,
      last_completed_date = ?, total_completed = total_completed + 1
     WHERE id = 1`,
    [newStreak, newLongest, today]
  );
}

export function getTodayCompletedCount(): number {
  const db = getDatabase();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
  const end = start + 86400;
  const result = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM tasks WHERE is_completed = 1 AND completed_at >= ? AND completed_at < ?',
    [start, end]
  );
  return result?.count ?? 0;
}

export function getWeekCompletedCount(): number {
  const db = getDatabase();
  const start = Date.now() / 1000 - 7 * 86400;
  const result = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM tasks WHERE is_completed = 1 AND completed_at >= ?',
    [start]
  );
  return result?.count ?? 0;
}
