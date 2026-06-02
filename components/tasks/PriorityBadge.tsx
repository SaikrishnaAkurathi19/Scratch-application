import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Priority } from '../../types';
import { useTheme } from '../../hooks/useTheme';

interface Props { priority: Priority; }

const labels = { high: '🔥', medium: '●', low: '●' };

export function PriorityBadge({ priority }: Props) {
  const { getPriorityColors } = useTheme();
  const c = getPriorityColors(priority);

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>
        {priority === 'high' ? '🔥' : priority === 'low' ? '↓' : '!'} {priority}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7,
  },
  text: { fontSize: 10, fontWeight: '600' },
});
