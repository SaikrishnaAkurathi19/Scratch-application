import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled }: Props) {
  const { colors } = useTheme();
  const bgColor = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : colors.backgroundSecondary;
  const txtColor = variant === 'secondary' ? colors.text : '#fff';

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bgColor, opacity: disabled || loading ? 0.5 : 1 }]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={txtColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: txtColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 15, fontWeight: '600' },
});
