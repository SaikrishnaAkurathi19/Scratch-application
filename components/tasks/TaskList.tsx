import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { EmptyState } from '../ui/EmptyState';
import { Colors } from '../../constants/colors';
import { useTaskStore } from '../../stores/taskStore';
import { useHaptics } from '../../hooks/useHaptics';

interface Props {
  tasks: Task[];
  onRefresh?: () => void;
  refreshing?: boolean;
  emptyIcon?: any;
  emptyTitle?: string;
  emptySubtitle?: string;
  sectionTitle?: string;
}

export function TaskList({
  tasks, onRefresh, refreshing = false,
  emptyIcon = 'checkmark-circle-outline',
  emptyTitle = 'No tasks here',
  emptySubtitle = 'Tap + to add a task',
  sectionTitle,
}: Props) {
  const router = useRouter();
  const haptics = useHaptics();
  const { completeTask, deleteTask, loadTasks } = useTaskStore();

  if (tasks.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} subtitle={emptySubtitle} />;
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list}
      ListHeaderComponent={sectionTitle ? <Text style={styles.header}>{sectionTitle}</Text> : null}
      renderItem={({ item }) => (
        <TaskCard
          task={item}
          onComplete={id => { completeTask(id); loadTasks(); }}
          onDelete={id => { deleteTask(id); loadTasks(); }}
          onPress={id => router.push(`/task/${id}`)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 100, paddingTop: 4 },
  header: {
    fontSize: 11, fontWeight: '500', color: Colors.textSecondary,
    letterSpacing: 0.8, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4,
  },
});
