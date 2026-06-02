import * as SQLite from 'expo-sqlite';
import { Config } from '../constants/config';

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync(Config.DB_NAME);
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = getDatabase();

  database.execSync('PRAGMA journal_mode = WAL;');
  database.execSync('PRAGMA foreign_keys = ON;');

  database.execSync(`
    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#6C63FF',
      icon TEXT NOT NULL DEFAULT 'list',
      is_default INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      notes TEXT,
      priority TEXT NOT NULL DEFAULT 'medium',
      work_nature TEXT NOT NULL DEFAULT 'personal',
      list_id TEXT NOT NULL,
      due_date INTEGER,
      reminder_at INTEGER,
      reminder_id TEXT,
      recurrence TEXT,
      recurrence_end_date INTEGER,
      recurrence_days TEXT,
      is_completed INTEGER NOT NULL DEFAULT 0,
      completed_at INTEGER,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      deleted_at INTEGER,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (list_id) REFERENCES lists(id)
    );

    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY NOT NULL,
      task_id TEXT NOT NULL,
      title TEXT NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS task_tags (
      task_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (task_id, tag_id),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY DEFAULT 1,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_completed_date TEXT,
      total_completed INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_list_id ON tasks(list_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON tasks(is_completed);
    CREATE INDEX IF NOT EXISTS idx_tasks_is_deleted ON tasks(is_deleted);
    CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
  `);

  // Migrations: add new columns if they don't exist (safe to run multiple times)
  try { database.execSync(`ALTER TABLE tasks ADD COLUMN work_nature TEXT NOT NULL DEFAULT 'personal';`); } catch {}
  try { database.execSync(`ALTER TABLE tasks ADD COLUMN recurrence_end_date INTEGER;`); } catch {}
  try { database.execSync(`ALTER TABLE tasks ADD COLUMN recurrence_days TEXT;`); } catch {}
  try { database.execSync(`ALTER TABLE tasks ADD COLUMN is_deleted INTEGER NOT NULL DEFAULT 0;`); } catch {}
  try { database.execSync(`ALTER TABLE tasks ADD COLUMN deleted_at INTEGER;`); } catch {}

  const listCount = database.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM lists');
  if (!listCount || listCount.count === 0) {
    seedDefaultData(database);
  }

  const statsRow = database.getFirstSync<{ id: number }>('SELECT id FROM stats WHERE id = 1');
  if (!statsRow) {
    database.runSync(
      'INSERT INTO stats (id, current_streak, longest_streak, last_completed_date, total_completed) VALUES (1, 0, 0, NULL, 0)'
    );
  }
}

function seedDefaultData(database: SQLite.SQLiteDatabase): void {
  const now = Math.floor(Date.now() / 1000);
  const DEFAULT_LISTS = [
    { name: 'Personal', color: '#6C63FF', icon: 'person', isDefault: 1 },
    { name: 'Work', color: '#3B82F6', icon: 'briefcase', isDefault: 1 },
    { name: 'Shopping', color: '#D97706', icon: 'cart', isDefault: 1 },
  ];
  function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  DEFAULT_LISTS.forEach((list, index) => {
    database.runSync(
      'INSERT INTO lists (id, name, color, icon, is_default, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [generateId(), list.name, list.color, list.icon, list.isDefault, index, now]
    );
  });
}
