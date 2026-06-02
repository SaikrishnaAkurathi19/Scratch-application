import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore } from '../../stores/taskStore';
import { TaskCard } from '../../components/tasks/TaskCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { useTheme } from '../../hooks/useTheme';
import { Task } from '../../types';
import { formatDate } from '../../utils/date';
import { SortMenu } from '../../components/tasks/SortMenu';

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
  const { colors } = useTheme();
  const { getUpcomingTasks, completeTask, trashTask, loadTasks, sortOrder, setSortOrder } = useTaskStore();
  const [sections, setSections] = useState<{ title: string; data: Task[] }[]>([]);
  const [showSort, setShowSort] = useState(false);

  const load = useCallback(() => {
    loadTasks();
    const tasks = getUpcomingTasks();
    setSections(groupByDate(tasks));
  }, [sortOrder]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Upcoming</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>Next 7 days</Text>
        </View>
        <TouchableOpacity
          style={[styles.sortBtn, { backgroundColor: colors.primaryLight }]}
          onPress={() => setShowSort(!showSort)}
        >
          <Ionicons name="funnel-outline" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {showSort && (
        <SortMenu value={sortOrder} onChange={(value) => { setSortOrder(value); setShowSort(false); load(); }} />
      )}

      {sections.length === 0 ? (
        <EmptyState icon="calendar-outline" title="Nothing coming up" subtitle="Tasks with due dates in the next 7 days will appear here" />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title.toUpperCase()}</Text>
              <Text style={[styles.sectionCount, { color: colors.primary, backgroundColor: colors.primaryLight }]}>{section.data.length}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onComplete={id => { completeTask(id); load(); }}
              onTrash={id => { trashTask(id); load(); }}
              onPress={id => router.push(`/task/${id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: '500', color: colors.text },
  sub: { fontSize: 13, marginTop: 2 },
  sortBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  sortBar: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 0.5 },
  sortOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  sortOptionText: { fontSize: 13, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 },
  sectionTitle: { fontSize: 11, fontWeight: '500', letterSpacing: 0.8 },
  sectionCount: { fontSize: 11, paddingHorizontal: 7, paddingVertical: 1, borderRadius: 8, fontWeight: '500' },
});
