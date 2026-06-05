import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, Alert, TextInput,
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
  const { completeTask, uncompleteTask, trashTask, loadTasks, getTodayTasks, getOverdueTasks, getUpcomingTasks, searchTasks, sortOrder, setSortOrder } = useTaskStore();

  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Task[]>([]);
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

  const handleTaskAction = (task: Task) => {
    if (task.isCompleted === 1) uncompleteTask(task.id);
    else completeTask(task.id);
    load();
    if (query.trim()) setSearchResults(searchTasks(query.trim()));
  };

  const handleSearch = (text: string) => {
    setQuery(text);
    setSearchResults(text.trim() ? searchTasks(text.trim()) : []);
  };

  const activeTodayTasks = todayTasks.filter(t => t.isCompleted === 0);
  const completedTodayTasks = todayTasks.filter(t => t.isCompleted === 1);


  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>My Tasks</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{dateStr}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.backgroundSecondary }]}
            onPress={() => { setShowSearch(s => !s); setQuery(''); }}
          >
            <Ionicons name={showSearch ? 'close' : 'search'} size={18} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.backgroundSecondary }]}
            onPress={() => setShowSort(s => !s)}
          >
            <Ionicons name="funnel-outline" size={17} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      {showSearch && (
        <View style={[styles.searchBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Ionicons name="search" size={16} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search tasks..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={handleSearch}
            autoFocus
            returnKeyType="search"
          />
        </View>
      )}

      {showSort && (
        <SortMenu value={sortOrder} onChange={(value) => { setSortOrder(value); setShowSort(false); load(); }} />
      )}

      {/* Multi-select bar */}
      {multiSelect && selectedIds.size > 0 && (
        <View style={[styles.multiBar, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '40' }]}>
          <View style={[styles.multiCount, { backgroundColor: colors.primary }]}>
            <Text style={styles.multiCountText}>{selectedIds.size}</Text>
          </View>
          <Text style={[styles.multiBarText, { color: colors.text }]}>selected</Text>
          <TouchableOpacity style={styles.multiCancelBtn} onPress={() => { setSelectedIds(new Set()); setMultiSelect(false); }}>
            <Text style={[{ color: colors.textSecondary, fontSize: 13 }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.multiTrashBtn, { backgroundColor: colors.high }]}
            onPress={handleBulkTrash}
          >
            <Ionicons name="trash" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >

        {query.trim() === '' && (
          <>
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
                    onComplete={() => handleTaskAction(task)}
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
                    onComplete={() => handleTaskAction(task)}
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
                    onComplete={() => handleTaskAction(task)}
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
                    onComplete={() => handleTaskAction(task)}
                    onTrash={id => { trashTask(id); load(); }}
                    onPress={id => router.push(`/task/${id}` as any)}
                    onLongPress={handleLongPress}
                    isSelected={selectedIds.has(task.id)}
                    multiSelectMode={multiSelect}
                  />
                ))}
              </>
            )}

            {activeTodayTasks.length === 0 && completedTodayTasks.length === 0 && upcomingTasks.length === 0 && (
              <EmptyState icon="checkmark-circle-outline" title="All clear!" subtitle="Tap + to add a task for today" />
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.floatingFab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/task/new')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const makeStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', paddingHorizontal: 20,
    paddingTop: 8, paddingBottom: 10,
  },
  headerLeft: { flex: 1 },
  title: { fontSize: 28, fontWeight: '600', color: colors.text },
  date: { fontSize: 13, marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingTop: 4 },
  iconBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 10,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },

  // Multi-select bar
  multiBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 0.5, borderBottomWidth: 0.5,
    marginBottom: 4,
  },
  multiCount: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  multiCountText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  multiBarText: { flex: 1, fontSize: 14, fontWeight: '500' },
  multiCancelBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  multiTrashBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  // ── Progress card ──
  progressCard: {
    marginHorizontal: 16, marginBottom: 12, marginTop: 4,
    borderRadius: 16, borderWidth: 1,
    padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  progressHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  progressTitle: { fontSize: 16, fontWeight: '600' },
  progressSub: { fontSize: 12, marginTop: 3 },
  pctBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  pctBadgeText: { fontSize: 20, fontWeight: '700' },

  progressBarTrack: {
    height: 10, borderRadius: 5, marginBottom: 16, overflow: 'hidden',
  },
  progressBarFill: {
    height: 10, borderRadius: 5,
  },

  statsRow: { flexDirection: 'row', alignItems: 'flex-start' },
  statDivider: { width: 1, alignSelf: 'stretch', marginHorizontal: 4, opacity: 0.4 },

  allClearBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 14, paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 10,
  },
  allClearText: { fontSize: 13, fontWeight: '600' },

  // Task sections
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

  floatingFab: {
    position: 'absolute', right: 20, bottom: 84,
    width: 54, height: 54, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
});
