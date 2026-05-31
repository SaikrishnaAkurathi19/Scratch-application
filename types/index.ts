export type Priority = 'high' | 'medium' | 'low';
export type Recurrence = 'daily' | 'weekly' | 'monthly' | null;

export interface Task {
  id: string;
  title: string;
  notes: string | null;
  priority: Priority;
  listId: string;
  dueDate: number | null;       // Unix timestamp
  reminderAt: number | null;    // Unix timestamp
  reminderId: string | null;    // expo-notifications id
  recurrence: Recurrence;
  isCompleted: number;          // 0 or 1
  completedAt: number | null;
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
