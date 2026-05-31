import { create } from 'zustand';
import { Task, TaskWithExtras } from '../types';
import * as TaskQueries from '../db/queries/tasks';
import { scheduleReminder, cancelReminder } from '../services/NotificationService';
import { recordTaskCompletion } from '../db/queries/lists';

interface TaskStore {
  tasks: Task[];
  loading: boolean;

  loadTasks: () => void;
  getTodayTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getUpcomingTasks: () => Task[];
  getTasksByList: (listId: string) => Task[];
  getHighPriorityTasks: () => Task[];
  getCompletedTasks: () => Task[];
  searchTasks: (query: string) => Task[];

  createTask: (data: Parameters<typeof TaskQueries.createTask>[0]) => Promise<Task>;
  updateTask: (id: string, data: Parameters<typeof TaskQueries.updateTask>[1]) => void;
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => TaskWithExtras | null;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,

  loadTasks: () => {
    try {
      const tasks = TaskQueries.getAllTasks();
      set({ tasks, loading: false });
    } catch (e) {
      console.error('loadTasks error:', e);
      set({ loading: false });
    }
  },

  getTodayTasks: () => {
    try { return TaskQueries.getTodayTasks(); } catch { return []; }
  },
  getOverdueTasks: () => {
    try { return TaskQueries.getOverdueTasks(); } catch { return []; }
  },
  getUpcomingTasks: () => {
    try { return TaskQueries.getUpcomingTasks(); } catch { return []; }
  },
  getTasksByList: (listId) => {
    try { return TaskQueries.getTasksByList(listId); } catch { return []; }
  },
  getHighPriorityTasks: () => {
    try { return TaskQueries.getHighPriorityTasks(); } catch { return []; }
  },
  getCompletedTasks: () => {
    try { return TaskQueries.getCompletedTasks(); } catch { return []; }
  },
  searchTasks: (query) => {
    try { return TaskQueries.searchTasks(query); } catch { return []; }
  },

  createTask: async (data) => {
    const task = TaskQueries.createTask(data);
    if (task.reminderAt) {
      try {
        const reminderId = await scheduleReminder(task);
        if (reminderId) TaskQueries.updateTask(task.id, { reminderId });
      } catch (e) {
        console.error('Reminder scheduling error:', e);
      }
    }
    get().loadTasks();
    return task;
  },

  updateTask: (id, data) => {
    try {
      TaskQueries.updateTask(id, data);
      get().loadTasks();
    } catch (e) {
      console.error('updateTask error:', e);
    }
  },

  completeTask: (id) => {
    try {
      TaskQueries.completeTask(id);
      recordTaskCompletion();
      get().loadTasks();
    } catch (e) {
      console.error('completeTask error:', e);
    }
  },

  uncompleteTask: (id) => {
    try {
      TaskQueries.uncompleteTask(id);
      get().loadTasks();
    } catch (e) {
      console.error('uncompleteTask error:', e);
    }
  },

  deleteTask: async (id) => {
    try {
      const task = TaskQueries.getTaskById(id);
      if (task?.reminderId) await cancelReminder(task.reminderId);
      TaskQueries.deleteTask(id);
      get().loadTasks();
    } catch (e) {
      console.error('deleteTask error:', e);
    }
  },

  getTaskById: (id) => {
    try { return TaskQueries.getTaskById(id); } catch { return null; }
  },
}));
