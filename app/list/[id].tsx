import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore } from '../../stores/taskStore';
import { useListStore } from '../../stores/listStore';
import { TaskCard } from '../../components/tasks/TaskCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { useTheme } from '../../hooks/useTheme';
import { Task } from '../../types';
import { restoreTask, deleteTask as permanentDelete, emptyTrash } from '../../db/queries/tasks';
import { SortMenu } from '../../components/tasks/SortMenu';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { getTasksByList, getHighPriorityTasks, getUpcomingTasks, getCompletedTasks, getTodayTasks, getTrashedTasks, completeTask, trashTask, restoreTask: storeRestore, emptyTrash: storeEmptyTrash, loadTasks, sortOrder, setSortOrder } = useTaskStore();
  const { lists } = useListStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showSort, setShowSort] = useState(false);

  const SMART_VIEWS: Record<string, { name: string; icon: string; color: string }> = {
    today: { name: 'Today', icon: 'home', color: colors.primary },
    upcoming: { name: 'Upcoming', icon: 'calendar-sharp', color: '#3B82F6' },
    high: { name: 'High Priority', icon: 'alert-circle', color: colors.high },
    all: { name: 'Completed', icon: 'checkmark-circle', color: colors.low },
    trash: { name: 'Trash', icon: 'trash', color: colors.textSecondary },
  };

  const isSmartView = id in SMART_VIEWS;
  const userList = lists.find(l => l.id === id);
  const listMeta = isSmartView
    ? SMART_VIEWS[id]
    : userList ? { name: userList.name, icon: userList.icon, color: userList.color } : null;

  const load = useCallback(() => {
    loadTasks();
    if (id === 'today') setTasks(getTodayTasks());
    else if (id === 'upcoming') setTasks(getUpcomingTasks());
    else if (id === 'high') setTasks(getHighPriorityTasks());
    else if (id === 'all') setTasks(getCompletedTasks());
    else if (id === 'trash') setTasks(getTrashedTasks());
    else setTasks(getTasksByList(id));
  }, [id, sortOrder]);

  useEffect(() => { load(); }, [load]);

  if (!listMeta) return null;

  const isTrash = id === 'trash';

  const handleEmptyTrash = () => {
    Alert.alert('Empty trash', 'Permanently delete all trashed tasks?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Empty', style: 'destructive', onPress: () => { storeEmptyTrash(); load(); } },
    ]);
  };

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.navRight}>
          {isTrash && tasks.length > 0 && (
            <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: colors.highBg }]} onPress={handleEmptyTrash}>
              <Ionicons name="trash" size={14} color={colors.high} />
              <Text style={[styles.emptyBtnText, { color: colors.high }]}>Empty</Text>
            </TouchableOpacity>
          )}
          {!isTrash && (
            <TouchableOpacity onPress={() => setShowSort(!showSort)}>
              <Ionicons name="funnel-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
          {!isSmartView && (
            <TouchableOpacity onPress={() => router.push('/task/new')} style={styles.addBtn}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sort bar */}
      {showSort && !isTrash && (
        <SortMenu value={sortOrder} onChange={(value) => { setSortOrder(value); setShowSort(false); load(); }} />
      )}

      <View style={styles.listHeader}>
        <View style={[styles.listIcon, { backgroundColor: listMeta.color + '20' }]}>
          <Ionicons name={listMeta.icon as any} size={18} color={listMeta.color} />
        </View>
        <View>
          <Text style={styles.listTitle}>{listMeta.name}</Text>
          <Text style={[styles.listCount, { color: colors.textSecondary }]}>{tasks.length} tasks</Text>
        </View>
      </View>

      {tasks.length === 0 ? (
        <EmptyState
          icon={isTrash ? "trash-outline" : "checkmark-circle-outline"}
          title={isTrash ? "Trash is empty" : "No tasks here"}
          subtitle={isTrash ? "Trashed tasks will appear here" : "Swipe right on any task to complete, left to trash"}
        />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => {
            if (isTrash) {
              return (
                <View style={[styles.trashCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.trashCardContent}>
                    <Ionicons name="trash-outline" size={16} color={colors.textTertiary} />
                    <Text style={[styles.trashTitle, { color: colors.textSecondary }]} numberOfLines={1}>{item.title}</Text>
                  </View>
                  <View style={styles.trashActions}>
                    <TouchableOpacity
                      style={[styles.trashActionBtn, { backgroundColor: colors.primaryLight }]}
                      onPress={() => { storeRestore(item.id); load(); }}
                    >
                      <Ionicons name="refresh" size={14} color={colors.primary} />
                      <Text style={[styles.trashActionText, { color: colors.primary }]}>Restore</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.trashActionBtn, { backgroundColor: colors.highBg }]}
                      onPress={() => {
                        Alert.alert('Delete forever', 'This cannot be undone.', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => { permanentDelete(item.id); load(); } },
                        ]);
                      }}
                    >
                      <Ionicons name="close" size={14} color={colors.high} />
                      <Text style={[styles.trashActionText, { color: colors.high }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }

            return (
              <TaskCard
                task={item}
                onComplete={itemId => { completeTask(itemId); load(); }}
                onTrash={itemId => { trashTask(itemId); load(); }}
                onPress={itemId => router.push(`/task/${itemId}` as any)}
              />
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  emptyBtnText: { fontSize: 13, fontWeight: '500' },
  sortBar: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 0.5 },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  sortBtnText: { fontSize: 13, fontWeight: '500' },
  listHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 16 },
  listIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  listTitle: { fontSize: 22, fontWeight: '600', color: colors.text },
  listCount: { fontSize: 13, marginTop: 2 },
  trashCard: {
    marginHorizontal: 16, marginVertical: 4, borderRadius: 12, borderWidth: 1,
    padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  trashCardContent: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  trashTitle: { fontSize: 14, flex: 1 },
  trashActions: { flexDirection: 'row', gap: 6 },
  trashActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7 },
  trashActionText: { fontSize: 12, fontWeight: '500' },
});
