import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore } from '../../stores/taskStore';
import { TaskCard } from '../../components/tasks/TaskCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { useTheme } from '../../hooks/useTheme';
import { Task } from '../../types';
import { SortMenu } from '../../components/tasks/SortMenu';

export default function TodayScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { completeTask, trashTask, loadTasks, getTodayTasks, getOverdueTasks, getUpcomingTasks, sortOrder, setSortOrder } = useTaskStore();

  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [multiSelect, setMultiSelect] = useState(false);

  const load = useCallback(() => {
    loadTasks();
    setTodayTasks(getTodayTasks());
    setOverdueTasks(getOverdueTasks());
    setUpcomingTasks(getUpcomingTasks().slice(0, 5));
  }, [sortOrder]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    load();
    setRefreshing(false);
  }, [load]);

  const handleLongPress = (id: string) => {
    if (!multiSelect) setMultiSelect(true);
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      if (next.size === 0) setMultiSelect(false);
      return next;
    });
  };

  const handleBulkTrash = async () => {
    Alert.alert('Move to trash', `Move ${selectedIds.size} task(s) to trash?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Trash all', style: 'destructive', onPress: async () => {
          for (const id of selectedIds) await trashTask(id);
          setSelectedIds(new Set());
          setMultiSelect(false);
          load();
        },
      },
    ]);
  };

  const activeTodayTasks = todayTasks.filter(t => t.isCompleted === 0);
  const completedTodayTasks = todayTasks.filter(t => t.isCompleted === 1);
  const total = activeTodayTasks.length + overdueTasks.length;
  const completedToday = completedTodayTasks.length;
  const progress = (total + completedToday) > 0 ? completedToday / (total + completedToday) : 0;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Today</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowSort(!showSort)}
          >
            <Ionicons name="funnel-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push('/task/new')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sort picker */}
      {showSort && (
        <SortMenu value={sortOrder} onChange={(value) => { setSortOrder(value); setShowSort(false); load(); }} />
      )}

      {/* Multi-select bar */}
      {multiSelect && selectedIds.size > 0 && (
        <View style={[styles.multiBar, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Text style={[styles.multiBarText, { color: colors.text }]}>{selectedIds.size} selected</Text>
          <TouchableOpacity style={[styles.trashBtn, { backgroundColor: colors.highBg }]} onPress={handleBulkTrash}>
            <Ionicons name="trash" size={14} color={colors.high} />
            <Text style={[styles.trashBtnText, { color: colors.high }]}>Trash</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Progress bar */}
      {(total + completedToday) > 0 && (
        <View style={styles.progressWrap}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>{completedToday} of {total + completedToday} done</Text>
            <Text style={[styles.progressPct, { color: colors.primary }]}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.primaryLight }]}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any, backgroundColor: colors.primary }]} />
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {overdueTasks.length > 0 && (
          <View style={[styles.overdueStrip, { backgroundColor: colors.highBg, borderColor: colors.highBorder }]}>
            <Ionicons name="alert-circle" size={13} color={colors.high} />
            <Text style={[styles.overdueStripText, { color: colors.high }]}>
              {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''} need attention
            </Text>
          </View>
        )}

        {overdueTasks.length > 0 && (
          <>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>OVERDUE</Text>
            {overdueTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={id => { completeTask(id); load(); }}
                onTrash={id => { trashTask(id); load(); }}
                onPress={id => router.push(`/task/${id}` as any)}
                onLongPress={handleLongPress}
                isSelected={selectedIds.has(task.id)}
                multiSelectMode={multiSelect}
              />
            ))}
          </>
        )}

        {activeTodayTasks.length > 0 && (
          <>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>TODAY</Text>
            {activeTodayTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={id => { completeTask(id); load(); }}
                onTrash={id => { trashTask(id); load(); }}
                onPress={id => router.push(`/task/${id}` as any)}
                onLongPress={handleLongPress}
                isSelected={selectedIds.has(task.id)}
                multiSelectMode={multiSelect}
              />
            ))}
          </>
        )}

        {completedTodayTasks.length > 0 && (
          <>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>COMPLETED</Text>
            {completedTodayTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={id => { completeTask(id); load(); }}
                onTrash={id => { trashTask(id); load(); }}
                onPress={id => router.push(`/task/${id}` as any)}
                onLongPress={handleLongPress}
                isSelected={selectedIds.has(task.id)}
                multiSelectMode={multiSelect}
              />
            ))}
          </>
        )}

        {upcomingTasks.length > 0 && (
          <>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>UPCOMING</Text>
            {upcomingTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={id => { completeTask(id); load(); }}
                onTrash={id => { trashTask(id); load(); }}
                onPress={id => router.push(`/task/${id}` as any)}
                onLongPress={handleLongPress}
                isSelected={selectedIds.has(task.id)}
                multiSelectMode={multiSelect}
              />
            ))}
          </>
        )}

        {total === 0 && completedToday === 0 && upcomingTasks.length === 0 && (
          <EmptyState icon="checkmark-circle-outline" title="All clear!" subtitle="Tap + to add a task for today" />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', paddingHorizontal: 20,
    paddingTop: 8, paddingBottom: 6,
  },
  title: { fontSize: 28, fontWeight: '500', color: colors.text },
  date: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight },
  fab: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  sortBar: {
    flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  sortBtnText: { fontSize: 13, fontWeight: '500' },
  multiBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 0.5,
  },
  multiBarText: { flex: 1, fontSize: 14, fontWeight: '500' },
  trashBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  trashBtnText: { fontSize: 13, fontWeight: '500' },
  progressWrap: { paddingHorizontal: 20, paddingBottom: 10 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  progressLabel: { fontSize: 12 },
  progressPct: { fontSize: 12, fontWeight: '500' },
  progressTrack: { height: 6, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  overdueStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 16, marginBottom: 8, padding: 10, borderRadius: 10,
    borderWidth: 1,
  },
  overdueStripText: { fontSize: 12, fontWeight: '500', flex: 1 },
  sectionHeader: {
    fontSize: 11, fontWeight: '500', letterSpacing: 0.8,
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4,
  },
  scroll: { flex: 1 },
});
