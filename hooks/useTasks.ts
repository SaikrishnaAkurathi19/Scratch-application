import { useTaskStore } from '../stores/taskStore';

// Convenience hook that exposes everything from taskStore
// Components can use this instead of importing the store directly
export function useTasks() {
  return useTaskStore();
}
