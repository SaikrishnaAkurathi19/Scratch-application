import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { List } from '../../types';
import { Colors } from '../../constants/colors';

interface Props {
  list: List;
  taskCount?: number;
  onPress: () => void;
  onLongPress?: () => void;
}

export function ListCard({ list, taskCount = 0, onPress, onLongPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: list.color + '20' }]}>
        <Ionicons name={list.icon as any} size={16} color={list.color} />
      </View>
      <Text style={styles.name}>{list.name}</Text>
      <Text style={styles.count}>{taskCount} tasks</Text>
      <Ionicons name="chevron-forward" size={15} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  iconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { flex: 1, fontSize: 15, color: Colors.text },
  count: { fontSize: 12, color: Colors.textTertiary },
});
