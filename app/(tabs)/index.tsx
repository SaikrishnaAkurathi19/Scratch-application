import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, RefreshControl, ScrollView,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore } from '../../stores/taskStore';
import { TaskCard } from '../../components/tasks/TaskCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Colors } from '../../constants/colors';
import { Task } from '../../types';

export default function TodayScreen() {
  const router = useRouter();
  const { completeTask, deleteTask, loadTasks, getTodayTasks, getOverdueTasks } = useTaskStore();

  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    loadTasks();
    setTodayTasks(getTodayTasks());
    setOverdueTasks(getOverdueTasks());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    load();
    setRefreshing(false);
  }, [load]);

  const activeTodayTasks = todayTasks.filter(t => t.isCompleted === 0);
  const completedTodayTasks = todayTasks.filter(t => t.isCompleted === 1);
  const total = activeTodayTasks.length + overdueTasks.length;
  const completedToday = completedTodayTasks.length;
  const progress = (total + completedToday) > 0 ? completedToday / (total + completedToday) : 0;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Today</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/task/new')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      {(total + completedToday) > 0 && (
        <View style={styles.progressWrap}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>{completedToday} of {total + completedToday} done</Text>
            <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Overdue strip */}
        {overdueTasks.length > 0 && (
          <View style={styles.overdueStrip}>
            <Ionicons name="alert-circle" size={13} color={Colors.high} />
            <Text style={styles.overdueStripText}>
              {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''} need attention
            </Text>
          </View>
        )}

        {/* Overdue tasks */}
        {overdueTasks.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>OVERDUE</Text>
            {overdueTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={id => { completeTask(id); load(); }}
                onDelete={id => { deleteTask(id); load(); }}
                onPress={id => router.push(`/task/${id}` as any)}
              />
            ))}
          </>
        )}

        {/* Today tasks */}
        {activeTodayTasks.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>TODAY</Text>
            {activeTodayTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={id => { completeTask(id); load(); }}
                onDelete={id => { deleteTask(id); load(); }}
                onPress={id => router.push(`/task/${id}` as any)}
              />
            ))}
          </>
        )}

        {/* Completed today */}
        {completedTodayTasks.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>COMPLETED</Text>
            {completedTodayTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={id => { completeTask(id); load(); }}
                onDelete={id => { deleteTask(id); load(); }}
                onPress={id => router.push(`/task/${id}` as any)}
              />
            ))}
          </>
        )}

        {/* Empty state */}
        {total === 0 && completedToday === 0 && (
          <EmptyState
            icon="checkmark-circle-outline"
            title="All clear!"
            subtitle="Tap + to add a task for today"
          />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', paddingHorizontal: 20,
    paddingTop: 8, paddingBottom: 6,
  },
  title: { fontSize: 28, fontWeight: '500', color: Colors.text },
  date: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  fab: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  progressWrap: { paddingHorizontal: 20, paddingBottom: 10 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  progressLabel: { fontSize: 12, color: Colors.textSecondary },
  progressPct: { fontSize: 12, color: Colors.primary, fontWeight: '500' },
  progressTrack: { height: 5, backgroundColor: Colors.primaryLight, borderRadius: 3 },
  progressFill: { height: 5, backgroundColor: Colors.primary, borderRadius: 3 },
  overdueStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.highBg, marginHorizontal: 16,
    marginBottom: 8, padding: 10, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.highBorder,
  },
  overdueStripText: { fontSize: 12, color: Colors.high, fontWeight: '500', flex: 1 },
  sectionHeader: {
    fontSize: 11, fontWeight: '500', color: Colors.textSecondary,
    letterSpacing: 0.8, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4,
  },
  scroll: { flex: 1 },
});
