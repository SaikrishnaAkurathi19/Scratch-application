import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native';
import { useTaskStore } from '../../stores/taskStore';
import { useListStore } from '../../stores/listStore';
import { TaskCard } from '../../components/tasks/TaskCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Colors } from '../../constants/colors';
import { Task } from '../../types';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getTasksByList, getHighPriorityTasks, getUpcomingTasks, getCompletedTasks, getTodayTasks, completeTask, deleteTask, loadTasks } = useTaskStore();
  const { lists } = useListStore();
  const [tasks, setTasks] = useState<Task[]>([]);

  // Resolve list metadata
  const smartViews = {
  today:    { name: 'Today',         icon: 'home',           color: Colors.primary },
  upcoming: { name: 'Upcoming',      icon: 'calendar-sharp', color: '#3B82F6' },
  high:     { name: 'High Priority', icon: 'alert-circle', color: Colors.high },
  all:      { name: 'Completed',     icon: 'checkmark-circle', color: Colors.low },
};

  const isSmartView = id in smartViews;
  const userList = lists.find(l => l.id === id);
  const listMeta = isSmartView
    ? smartViews[id]
    : userList ? { name: userList.name, icon: userList.icon, color: userList.color } : null;

  const load = useCallback(() => {
    loadTasks();
    if (id === 'today')    setTasks(getTodayTasks());
    else if (id === 'upcoming') setTasks(getUpcomingTasks());
    else if (id === 'high')     setTasks(getHighPriorityTasks());
    else if (id === 'all')      setTasks(getCompletedTasks());
    else                        setTasks(getTasksByList(id));
  }, [id,
    getTasksByList,
    getHighPriorityTasks,
    getUpcomingTasks,
    getCompletedTasks,
    getTodayTasks,
    loadTasks,
  ]);

    useEffect(() => {
      load();
    }, [load]);
    
    console.log('LIST ICON:', listMeta?.icon);
    
  if (!listMeta) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <View style={[styles.iconWrap, { backgroundColor: listMeta.color + '18' }]}>
            <Ionicons name={listMeta.icon as any} size={16} color={listMeta.color} />
          </View>
          <Text style={styles.title}>{listMeta.name}</Text>
        </View>
        {!isSmartView && (
          <TouchableOpacity onPress={() => router.push('/task/new')} style={styles.fab} activeOpacity={0.8}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.count}>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</Text>

      {tasks.length === 0 ? (
        <EmptyState
          icon={listMeta.icon as any}
          title="No tasks here"
          subtitle={isSmartView ? 'Tasks will appear here automatically' : 'Tap + to add a task to this list'}
        />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onComplete={taskId => { completeTask(taskId); load(); }}
              onDelete={taskId => { deleteTask(taskId); load(); }}
              onPress={taskId => router.push(`/task/${taskId}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  titleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '500', color: Colors.text },
  fab: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  count: { fontSize: 13, color: Colors.textSecondary, paddingHorizontal: 20, marginBottom: 4 },
});
