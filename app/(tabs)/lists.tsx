import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useListStore } from '../../stores/listStore';
import { Colors } from '../../constants/colors';
import { List } from '../../types';
import {
  getTodayTasks,
  getUpcomingTasks,
  getHighPriorityTasks,
  getCompletedTasks,
  getTaskCountByList,
} from '../../db/queries/tasks';

const SMART_VIEWS = [
  {
    id: 'today',
    name: 'Today',
    icon: 'home',
    iconColor: Colors.primary,
    bgColor: Colors.primaryLight,
    badgeStyle: 'red',
  },
  {
    id: 'upcoming',
    name: 'Upcoming',
    icon: 'calendar-sharp',
    iconColor: '#3B82F6',
    bgColor: '#e8f4ff',
    badgeStyle: 'blue',
  },
  {
    id: 'high',
    name: 'High Priority',
    icon: 'alert-circle',
    iconColor: Colors.high,
    bgColor: Colors.highBg,
    badgeStyle: 'red',
  },
  {
    id: 'all',
    name: 'Completed',
    icon: 'checkmark-circle',
    iconColor: Colors.low,
    bgColor: Colors.lowBg,
    badgeStyle: 'green',
  },
] as const;

export default function ListsScreen() {
  const router = useRouter();
  const { lists, loadLists, deleteList } = useListStore();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadLists();
  }, []);

  const load = useCallback(() => {
    try {
      const c: Record<string, number> = {};

      c.today = getTodayTasks().filter(t => t.isCompleted === 0).length;
      c.upcoming = getUpcomingTasks().length;
      c.high = getHighPriorityTasks().length;
      c.all = getCompletedTasks().length;

      lists.forEach(list => {
        c[list.id] = getTaskCountByList(list.id);
      });

      setCounts(prev => {
        const oldValue = JSON.stringify(prev);
        const newValue = JSON.stringify(c);
        return oldValue === newValue ? prev : c;
      });
    } catch (error) {
      console.log('Error loading counts:', error);
    }
  }, [lists]);

  useEffect(() => {
    load();
  }, [lists]);

  const handleDeleteList = (list: List) => {
    if (list.isDefault) {
      Alert.alert('Cannot delete', 'Default lists cannot be deleted.');
      return;
    }

    Alert.alert(
      'Delete list',
      `Delete "${list.name}"? Tasks will move to Personal.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteList(list.id);
            loadLists();
          },
        },
      ]
    );
  };

  const getBadgeColors = (style: string) => {
    if (style === 'red') {
      return { bg: Colors.highBg, text: Colors.high };
    }

    if (style === 'blue') {
      return { bg: '#e8f4ff', text: '#3B82F6' };
    }

    if (style === 'green') {
      return { bg: Colors.lowBg, text: Colors.low };
    }

    return { bg: Colors.primaryLight, text: Colors.primary };
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Lists</Text>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/list/new')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text style={styles.section}>SMART VIEWS</Text>

        {SMART_VIEWS.map(view => {
          const badge = getBadgeColors(view.badgeStyle);
          const count = counts[view.id] ?? 0;

          return (
            <TouchableOpacity
              key={view.id}
              style={styles.row}
              onPress={() => router.push(`/list/${view.id}` as any)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: view.bgColor },
                ]}
              >
                <Ionicons
                  name={view.icon as any}
                  size={16}
                  color={view.iconColor}
                />
              </View>

              <Text style={styles.listName}>{view.name}</Text>

              {count > 0 && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: badge.bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: badge.text },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}

              <Ionicons
                name="chevron-forward"
                size={15}
                color={Colors.textTertiary}
              />
            </TouchableOpacity>
          );
        })}

        <Text style={styles.section}>MY LISTS</Text>

        {lists.map(list => (
          <TouchableOpacity
            key={list.id}
            style={styles.row}
            onPress={() => router.push(`/list/${list.id}` as any)}
            onLongPress={() => handleDeleteList(list)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: list.color + '20' },
              ]}
            >
              <Ionicons
                name={list.icon as any}
                size={16}
                color={list.color}
              />
            </View>

            <Text style={styles.listName}>{list.name}</Text>

            <Text style={styles.taskCount}>
              {counts[list.id] ?? 0} tasks
            </Text>

            <Ionicons
              name="chevron-forward"
              size={15}
              color={Colors.textTertiary}
            />
          </TouchableOpacity>
        ))}

        <Text style={styles.hint}>
          Long press a list to delete it
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    color: Colors.text,
  },
  fab: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listName: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  taskCount: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  hint: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 20,
  },
});