import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { SortOrder } from '../../types';

export const SORT_OPTIONS: Array<{ value: SortOrder; label: string; icon: string }> = [
  { value: 'priority', label: 'Priority first', icon: 'flag-outline' },
  { value: 'dueDate', label: 'Nearest due date', icon: 'calendar-outline' },
  { value: 'createdAt', label: 'Recently added', icon: 'time-outline' },
  { value: 'title', label: 'A to Z', icon: 'text-outline' },
];

type Props = {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
};

export function SortMenu({ value, onChange }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>SORT BY</Text>
      <View style={styles.panel}>
        {SORT_OPTIONS.map(option => {
          const selected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.row, selected && styles.rowSelected]}
              onPress={() => onChange(option.value)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
                <Ionicons name={option.icon as any} size={15} color={selected ? colors.primary : colors.textSecondary} />
              </View>
              <Text style={[styles.text, selected && styles.textSelected]}>{option.label}</Text>
              {selected && <Ionicons name="checkmark" size={16} color={colors.primary} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingBottom: 10 },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  panel: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  rowSelected: { backgroundColor: colors.primaryLight },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  iconWrapSelected: { backgroundColor: colors.background },
  text: { flex: 1, fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  textSelected: { color: colors.primary },
});
