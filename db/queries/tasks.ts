import { getDatabase } from '../client';
import { Task, TaskWithExtras, SortOrder } from '../../types';
import { generateId } from '../../utils/uuid';
import { todayStart, todayEnd, tomorrowStart, nextWeekEnd } from '../../utils/date';

function rowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    priority: row.priority ?? 'none',
    workNature: row.work_nature ?? 'personal',
    listId: row.list_id,
    dueDate: row.due_date,
    reminderAt: row.reminder_at,
    reminderId: row.reminder_id,
    recurrence: row.recurrence,
    recurrenceEndDate: row.recurrence_end_date ?? null,
    recurrenceDays: row.recurrence_days ?? null,
    isCompleted: row.is_completed,
    completedAt: row.completed_at,
    isDeleted: row.is_deleted ?? 0,
    deletedAt: row.deleted_at ?? null,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    listName: row.list_name,
    listColor: row.list_color,
    listIcon: row.list_icon,
  };
}

function getSortSQL(sortOrder: SortOrder = 'priority'): string {
  switch (sortOrder) {
    case 'priority':
      return `CASE t.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 ELSE 3 END, t.due_date ASC NULLS LAST`;
    case 'dueDate':
      return `t.due_date ASC NULLS LAST, CASE t.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 ELSE 3 END`;
    case 'createdAt':
      return `t.created_at DESC`;
    case 'title':
      return `t.title ASC`;
    default:
      return `t.sort_order ASC, t.created_at DESC`;
  }
}

const TASK_SELECT = `
  SELECT t.*, l.name as list_name, l.color as list_color, l.icon as list_icon
  FROM tasks t
  LEFT JOIN lists l ON l.id = t.list_id
`;

export function getAllTasks(sortOrder?: SortOrder): Task[] {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    `${TASK_SELECT} WHERE t.is_deleted = 0 ORDER BY ${getSortSQL(sortOrder)}`
  );
  return rows.map(rowToTask);
}

export function getTaskById(id: string): TaskWithExtras | null {
  const db = getDatabase();
  const row = db.getFirstSync<any>(`${TASK_SELECT} WHERE t.id = ?`, [id]);
  if (!row) return null;
  const task = rowToTask(row) as TaskWithExtras;

  task.subtasks = db.getAllSync<any>(
    'SELECT * FROM subtasks WHERE task_id = ? ORDER BY sort_order ASC',
    [id]
  ).map(s => ({
    id: s.id, taskId: s.task_id, title: s.title,
    isCompleted: s.is_completed, sortOrder: s.sort_order, createdAt: s.created_at,
  }));

  return task;
}

export function getTodayTasks(sortOrder?: SortOrder): Task[] {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    `${TASK_SELECT}
     WHERE t.is_completed = 0 AND t.is_deleted = 0
       AND (t.due_date <= ? OR (t.due_date IS NULL AND t.created_at >= ?))
     ORDER BY ${getSortSQL(sortOrder)}`,
    [todayEnd(), todayStart()]
  );
  return rows.map(rowToTask);
}

export function getOverdueTasks(): Task[] {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    `${TASK_SELECT}
     WHERE t.is_completed = 0 AND t.is_deleted = 0 AND t.due_date < ?
     ORDER BY t.due_date ASC`,
    [todayStart()]
  );
  return rows.map(rowToTask);
}

export function getUpcomingTasks(sortOrder?: SortOrder): Task[] {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    `${TASK_SELECT}
     WHERE t.is_completed = 0 AND t.is_deleted = 0 AND t.due_date >= ? AND t.due_date <= ?
     ORDER BY ${getSortSQL(sortOrder ?? 'dueDate')}`,
    [tomorrowStart(), nextWeekEnd()]
  );
  return rows.map(rowToTask);
}

export function getCalendarTasks(sortOrder?: SortOrder): Task[] {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    `${TASK_SELECT}
     WHERE t.is_deleted = 0 AND t.due_date IS NOT NULL
     ORDER BY ${getSortSQL(sortOrder ?? 'dueDate')}`
  );
  return rows.map(rowToTask);
}

export function getTasksByList(listId: string, sortOrder?: SortOrder): Task[] {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    `${TASK_SELECT} WHERE t.list_id = ? AND t.is_completed = 0 AND t.is_deleted = 0
     ORDER BY ${getSortSQL(sortOrder)}`,
    [listId]
  );
  return rows.map(rowToTask);
}

export function getHighPriorityTasks(): Task[] {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    `${TASK_SELECT} WHERE t.priority = 'high' AND t.is_completed = 0 AND t.is_deleted = 0
     ORDER BY t.due_date ASC NULLS LAST`
  );
  return rows.map(rowToTask);
}

export function getCompletedTasks(): Task[] {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    `${TASK_SELECT} WHERE t.is_completed = 1 AND t.is_deleted = 0
     ORDER BY t.completed_at DESC LIMIT 100`
  );
  return rows.map(rowToTask);
}

export function getTrashedTasks(): Task[] {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    `${TASK_SELECT} WHERE t.is_deleted = 1
     ORDER BY t.deleted_at DESC`
  );
  return rows.map(rowToTask);
}

export function searchTasks(query: string, sortOrder?: SortOrder): Task[] {
  const db = getDatabase();
  const q = `%${query.toLowerCase()}%`;
  const rows = db.getAllSync<any>(
    `${TASK_SELECT}
     WHERE (LOWER(t.title) LIKE ? OR LOWER(t.notes) LIKE ?) AND t.is_completed = 0 AND t.is_deleted = 0
     ORDER BY ${getSortSQL(sortOrder)}`,
    [q, q]
  );
  return rows.map(rowToTask);
}

export function createTask(data: {
  title: string;
  notes?: string;
  priority?: Task['priority'];
  workNature?: Task['workNature'];
  listId: string;
  dueDate?: number | null;
  reminderAt?: number | null;
  reminderId?: string | null;
  recurrence?: Task['recurrence'];
  recurrenceEndDate?: number | null;
  recurrenceDays?: string | null;
}): Task {
  const db = getDatabase();
  const now = Math.floor(Date.now() / 1000);
  const id = generateId();

  const maxOrder = db.getFirstSync<{ max_order: number }>(
    'SELECT MAX(sort_order) as max_order FROM tasks WHERE list_id = ?',
    [data.listId]
  );

  db.runSync(
    `INSERT INTO tasks 
     (id, title, notes, priority, work_nature, list_id, due_date, reminder_at, reminder_id, recurrence,
      recurrence_end_date, recurrence_days, is_completed, completed_at, is_deleted, deleted_at,
      sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, 0, NULL, ?, ?, ?)`,
    [
      id, data.title, data.notes ?? null,
      data.priority ?? 'none', data.workNature ?? 'personal', data.listId,
      data.dueDate ?? null, data.reminderAt ?? null,
      data.reminderId ?? null, data.recurrence ?? null,
      data.recurrenceEndDate ?? null, data.recurrenceDays ?? null,
      (maxOrder?.max_order ?? -1) + 1, now, now,
    ]
  );

  return getTaskById(id) as Task;
}

export function updateTask(id: string, data: Partial<Omit<Task, 'id' | 'createdAt'>>): void {
  const db = getDatabase();
  const now = Math.floor(Date.now() / 1000);

  const fields: string[] = [];
  const values: any[] = [];

  if (data.title !== undefined)               { fields.push('title = ?');                values.push(data.title); }
  if (data.notes !== undefined)               { fields.push('notes = ?');                values.push(data.notes); }
  if (data.priority !== undefined)            { fields.push('priority = ?');             values.push(data.priority); }
  if (data.workNature !== undefined)          { fields.push('work_nature = ?');          values.push(data.workNature); }
  if (data.listId !== undefined)              { fields.push('list_id = ?');              values.push(data.listId); }
  if (data.dueDate !== undefined)             { fields.push('due_date = ?');             values.push(data.dueDate); }
  if (data.reminderAt !== undefined)          { fields.push('reminder_at = ?');          values.push(data.reminderAt); }
  if (data.reminderId !== undefined)          { fields.push('reminder_id = ?');          values.push(data.reminderId); }
  if (data.recurrence !== undefined)          { fields.push('recurrence = ?');           values.push(data.recurrence); }
  if (data.recurrenceEndDate !== undefined)   { fields.push('recurrence_end_date = ?');  values.push(data.recurrenceEndDate); }
  if (data.recurrenceDays !== undefined)      { fields.push('recurrence_days = ?');      values.push(data.recurrenceDays); }
  if (data.isCompleted !== undefined)         { fields.push('is_completed = ?');         values.push(data.isCompleted); }
  if (data.completedAt !== undefined)         { fields.push('completed_at = ?');         values.push(data.completedAt); }
  if (data.isDeleted !== undefined)           { fields.push('is_deleted = ?');           values.push(data.isDeleted); }
  if (data.deletedAt !== undefined)           { fields.push('deleted_at = ?');           values.push(data.deletedAt); }
  if (data.sortOrder !== undefined)           { fields.push('sort_order = ?');           values.push(data.sortOrder); }

  if (fields.length === 0) return;
  fields.push('updated_at = ?');
  values.push(now, id);

  db.runSync(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
}

export function completeTask(id: string): void {
  const now = Math.floor(Date.now() / 1000);
  updateTask(id, { isCompleted: 1, completedAt: now });
}

export function uncompleteTask(id: string): void {
  updateTask(id, { isCompleted: 0, completedAt: null });
}

// Soft delete → trash
export function trashTask(id: string): void {
  const now = Math.floor(Date.now() / 1000);
  updateTask(id, { isDeleted: 1, deletedAt: now });
}

// Restore from trash
export function restoreTask(id: string): void {
  updateTask(id, { isDeleted: 0, deletedAt: null });
}

// Permanent delete
export function deleteTask(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM tasks WHERE id = ?', [id]);
}

// Bulk delete all trashed tasks
export function emptyTrash(): void {
  const db = getDatabase();
  db.runSync('DELETE FROM tasks WHERE is_deleted = 1');
}

export function getTaskCountByList(listId: string): number {
  const db = getDatabase();
  const result = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM tasks WHERE list_id = ? AND is_completed = 0 AND is_deleted = 0',
    [listId]
  );
  return result?.count ?? 0;
}

// Subtask queries
export function addSubtask(taskId: string, title: string) {
  const db = getDatabase();
  const now = Math.floor(Date.now() / 1000);
  const id = generateId();
  const max = db.getFirstSync<{ max_order: number }>(
    'SELECT MAX(sort_order) as max_order FROM subtasks WHERE task_id = ?', [taskId]
  );
  db.runSync(
    'INSERT INTO subtasks (id, task_id, title, is_completed, sort_order, created_at) VALUES (?, ?, ?, 0, ?, ?)',
    [id, taskId, title, (max?.max_order ?? -1) + 1, now]
  );
}

export function toggleSubtask(id: string, isCompleted: number) {
  const db = getDatabase();
  db.runSync('UPDATE subtasks SET is_completed = ? WHERE id = ?', [isCompleted, id]);
}

export function deleteSubtask(id: string) {
  const db = getDatabase();
  db.runSync('DELETE FROM subtasks WHERE id = ?', [id]);
}
