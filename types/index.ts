export type Priority = 'high' | 'medium' | 'low';
export type Recurrence = 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
export type WorkNature = 'personal' | 'work' | 'shopping' | 'health' | 'other';
export type SortOrder = 'priority' | 'dueDate' | 'createdAt' | 'title';

export interface Task {
  id: string;
  title: string;
  notes: string | null;
  priority: Priority;
  workNature: WorkNature;
  listId: string;
  dueDate: number | null;
  reminderAt: number | null;
  reminderId: string | null;
  recurrence: Recurrence;
  recurrenceEndDate: number | null;
  recurrenceDays: string | null; // JSON array of weekday numbers e.g. "[1,3,5]"
  isCompleted: number;
  completedAt: number | null;
  isDeleted: number; // soft delete → trash
  deletedAt: number | null;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: number;
  sortOrder: number;
  createdAt: number;
}

export interface List {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault: number;
  sortOrder: number;
  createdAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface TaskTag {
  taskId: string;
  tagId: string;
}

export interface Stats {
  id: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  totalCompleted: number;
}

export interface TaskWithExtras extends Task {
  subtasks?: Subtask[];
  tags?: Tag[];
  listName?: string;
  listColor?: string;
}
