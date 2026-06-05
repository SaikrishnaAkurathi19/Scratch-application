import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useListStore } from '../../stores/listStore';
import { useTheme } from '../../hooks/useTheme';
import { List } from '../../types';
import {
  getTodayTasks,
  getUpcomingTasks,
  getHighPriorityTasks,
  getCompletedTasks,
  getTaskCountByList,
  getTrashedTasks,
} from '../../db/queries/tasks';

const SMART_VIEWS = [
  { id: 'today', name: 'Today', icon: 'home', iconColor: '#6C63FF', bgColor: '#f0eeff', badgeStyle: 'primary' },
  { id: 'upcoming', name: 'Calendar', icon: 'calendar-sharp', iconColor: '#3B82F6', bgColor: '#e8f4ff', badgeStyle: 'blue' },
  { id: 'high', name: 'High Priority', icon: 'alert-circle', iconColor: '#E24B4A', bgColor: '#fff0f0', badgeStyle: 'red' },
  { id: 'all', name: 'Completed', icon: 'checkmark-circle', iconColor: '#16A34A', bgColor: '#f0fdf4', badgeStyle: 'green' },
  { id: 'trash', name: 'Trash', icon: 'trash', iconColor: '#9b9bb4', bgColor: '#f5f5f5', badgeStyle: 'gray' },
] as const;

export default function ListsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { lists, loadLists, deleteList } = useListStore();
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Load lists only when screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadLists();
    }, [])
  );

  // Calculate counts when lists change
  useEffect(() => {
    try {
      const c: Record<string, number> = {};

      c.today = getTodayTasks().filter(t => t.isCompleted === 0).length;
      c.upcoming = getUpcomingTasks().length;
      c.high = getHighPriorityTasks().length;
      c.all = getCompletedTasks().length;
      c.trash = getTrashedTasks().length;

      lists.forEach(list => {
        c[list.id] = getTaskCountByList(list.id);
      });

      setCounts(c);
    } catch (e) {
      console.log('Count error:', e);
    }
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
    if (style === 'red') return { bg: colors.highBg, text: colors.high };
    if (style === 'blue') return { bg: '#e8f4ff', text: '#3B82F6' };
    if (style === 'green') return { bg: colors.lowBg, text: colors.low };
    if (style === 'gray') return { bg: colors.backgroundSecondary, text: colors.textSecondary };

    return {
      bg: colors.primaryLight,
      text: colors.primary,
    };
  };

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>

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
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          );
        })}

        <Text style={styles.section}>CATEGORIES</Text>

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
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        ))}

        <Text style={styles.hint}>
          Long press a category to delete it
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.text,
    },

    fab: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    section: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.textSecondary,
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
      borderBottomColor: colors.border,
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
      color: colors.text,
    },

    taskCount: {
      fontSize: 12,
      color: colors.textTertiary,
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
      color: colors.textTertiary,
      textAlign: 'center',
      marginTop: 20,
    },
  });
