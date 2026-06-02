import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useListStore } from '../../stores/listStore';
import { ListColors, ListIcons } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { useHaptics } from '../../hooks/useHaptics';

const IconLabels: Record<string, string> = {
  person: 'Personal',
  briefcase: 'Work',
  cart: 'Shop',
  heart: 'Health',
  home: 'Home',
  book: 'Study',
  star: 'Goals',
  bulb: 'Ideas',
  fitness: 'Fitness',
  school: 'School',
  restaurant: 'Food',
  wallet: 'Money',
  car: 'Travel',
  airplane: 'Trips',
  'calendar-check': 'Routine',
  sparkles: 'Special',
};

export default function NewListScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const { colors } = useTheme();
  const { createList } = useListStore();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(ListColors[0]);
  const [selectedIcon, setSelectedIcon] = useState(ListIcons[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Name required', 'Please enter a list name.'); return; }
    setSaving(true);
    try {
      createList({ name: name.trim(), color: selectedColor, icon: selectedIcon });
      haptics.success();
      router.back();
    } catch { Alert.alert('Error', 'Could not create list.'); }
    finally { setSaving(false); }
  };

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.handle} />
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.heading}>New Category</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving || !name.trim()}>
            <Text style={[styles.saveBtn, (!name.trim() || saving) && { color: colors.textTertiary }]}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.preview}>
            <View style={[styles.previewIcon, { backgroundColor: selectedColor + '20' }]}>
              <Ionicons name={selectedIcon as any} size={28} color={selectedColor} />
            </View>
            <Text style={[styles.previewName, { color: selectedColor }]}>{name || 'Category name'}</Text>
          </View>

          <Text style={styles.fieldLabel}>CATEGORY NAME</Text>
          <TextInput
            style={[styles.nameInput, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g. Fitness, Study, Family..."
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={40}
          />

          <Text style={styles.fieldLabel}>COLOR</Text>
          <View style={styles.colorGrid}>
            {ListColors.map(color => (
              <TouchableOpacity
                key={color}
                style={[styles.colorDot, { backgroundColor: color }, selectedColor === color && styles.colorDotSelected]}
                onPress={() => { setSelectedColor(color); haptics.light(); }}
                activeOpacity={0.8}
              >
                {selectedColor === color && <Ionicons name="checkmark" size={16} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>ICON STYLE</Text>
          <View style={styles.iconGrid}>
            {ListIcons.map(icon => (
              <TouchableOpacity
                key={icon}
                style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
                  selectedIcon === icon && { backgroundColor: selectedColor + '18', borderColor: selectedColor }]}
                onPress={() => { setSelectedIcon(icon); haptics.light(); }}
                activeOpacity={0.7}
              >
                <Ionicons name={icon as any} size={22} color={selectedIcon === icon ? selectedColor : colors.textSecondary} />
                <Text style={[styles.iconLabel, { color: selectedIcon === icon ? selectedColor : colors.textTertiary }]}>
                  {IconLabels[icon] ?? icon}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  heading: { fontSize: 16, fontWeight: '500', color: colors.text },
  saveBtn: { fontSize: 16, fontWeight: '500', color: colors.primary },
  scroll: { flex: 1, paddingHorizontal: 20 },
  preview: { alignItems: 'center', paddingVertical: 24, gap: 10 },
  previewIcon: { width: 70, height: 70, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  previewName: { fontSize: 20, fontWeight: '500' },
  fieldLabel: { fontSize: 10, fontWeight: '500', color: colors.textSecondary, letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },
  nameInput: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, borderWidth: 1, marginBottom: 20 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  colorDot: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  colorDotSelected: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  iconBtn: { width: 72, height: 62, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 4 },
  iconLabel: { fontSize: 10, fontWeight: '500' },
});
