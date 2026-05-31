import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SectionList } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore } from '../../stores/taskStore';
import { TaskCard } from '../../components/tasks/TaskCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Colors } from '../../constants/colors';
import { Task } from '../../types';
import { formatDate, fromUnix } from '../../utils/date';

function groupByDate(tasks: Task[]): { title: string; data: Task[] }[] {
  const map = new Map<string, Task[]>();
  tasks.forEach(task => {
    const key = task.dueDate ? formatDate(task.dueDate) : 'No date';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(task);
  });
  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
}

export default function UpcomingScreen() {
  const router = useRouter();
  const { getUpcomingTasks, completeTask, deleteTask, loadTasks } = useTaskStore();
  const [sections, setSections] = useState<{ title: string; data: Task[] }[]>([]);

  const load = useCallback(() => {
    loadTasks();
    const tasks = getUpcomingTasks();
    setSections(groupByDate(tasks));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming</Text>
        <Text style={styles.sub}>Next 7 days</Text>
      </View>

      {sections.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="Nothing coming up"
          subtitle="Tasks with due dates in the next 7 days will appear here"
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
              <Text style={styles.sectionCount}>{section.data.length}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onComplete={id => { completeTask(id); load(); }}
              onDelete={id => { deleteTask(id); load(); }}
              onPress={id => router.push(`/task/${id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: '500', color: Colors.text },
  sub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6,
  },
  sectionTitle: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary, letterSpacing: 0.8 },
  sectionCount: {
    fontSize: 11, color: Colors.primary, backgroundColor: Colors.primaryLight,
    paddingHorizontal: 7, paddingVertical: 1, borderRadius: 8, fontWeight: '500',
  },
});
