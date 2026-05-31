import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Priority } from '../../types';
import { PriorityColors } from '../../constants/colors';

interface Props {
  priority: Priority;
  size?: 'sm' | 'md';
}

const LABELS = { high: 'High', medium: 'Med', low: 'Low' };

export function PriorityBadge({ priority, size = 'sm' }: Props) {
  const c = PriorityColors[priority];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }, size === 'md' && styles.md]}>
      {priority === 'high' && (
        <Ionicons name="flame" size={size === 'md' ? 11 : 9} color={c.text} style={{ marginRight: 2 }} />
      )}
      <Text style={[styles.label, { color: c.text }, size === 'md' && styles.mdLabel]}>
        {LABELS[priority]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 10, borderWidth: 1,
  },
  label: { fontSize: 10, fontWeight: '500' },
  md: { paddingHorizontal: 10, paddingVertical: 4 },
  mdLabel: { fontSize: 12 },
});
