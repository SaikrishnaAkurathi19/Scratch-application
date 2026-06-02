import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { formatDate, isOverdue, isDueToday } from '../../utils/date';

interface Props {
  dueDate: number | null;
}

export function DueDateBadge({ dueDate }: Props) {
  if (!dueDate) return null;

  const overdue = isOverdue(dueDate);
  const today = isDueToday(dueDate);

  const color = overdue ? Colors.high : today ? Colors.primary : Colors.textSecondary;
  const bg = overdue ? Colors.highBg : today ? Colors.primaryLight : Colors.backgroundSecondary;

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Ionicons name="calendar-outline" size={10} color={color} />
      <Text style={[styles.text, { color }]}>{formatDate(dueDate)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  text: { fontSize: 10, fontWeight: '500' },
});
