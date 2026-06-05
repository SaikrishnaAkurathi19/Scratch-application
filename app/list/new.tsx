import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useListStore } from '../../stores/listStore';
import { ListColors, ListIcons } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { useHaptics } from '../../hooks/useHaptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ICON_COLS = 4;
const ICON_PADDING = 20; // horizontal padding on scroll view
const ICON_GAP = 10;
const ICON_SIZE = Math.floor((SCREEN_WIDTH - ICON_PADDING * 2 - ICON_GAP * (ICON_COLS - 1)) / ICON_COLS);

const IconLabels: Record<string, string> = {
  person: 'Personal',
  briefcase: 'Work',
  cart: 'Shopping',
  heart: 'Health',
  home: 'Home',
  book: 'Study',
  star: 'Goals',
  bulb: 'Ideas',
  fitness: 'Fitness',
  school: 'School',
  restaurant: 'Food',
  wallet: 'Finance',
  car: 'Travel',
  airplane: 'Trips',
  'calendar-outline': 'Routine',
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
    if (!name.trim()) { Alert.alert('Name required', 'Please enter a category name.'); return; }
    setSaving(true);
    try {
      createList({ name: name.trim(), color: selectedColor, icon: selectedIcon });
      haptics.success();
      router.back();
    } catch { Alert.alert('Error', 'Could not create category.'); }
    finally { setSaving(false); }
  };

  const styles = makeStyles(colors, selectedColor);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, { color: colors.text }]}>New Category</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || !name.trim()}
            style={[styles.saveBtn, { backgroundColor: (saving || !name.trim()) ? colors.primaryLight : colors.primary }]}
          >
            <Text style={[styles.saveBtnText, { color: (saving || !name.trim()) ? colors.primary + '80' : '#fff' }]}>
              {saving ? 'Saving…' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Live preview */}
          <View style={[styles.previewCard, { backgroundColor: selectedColor + '12', borderColor: selectedColor + '30' }]}>
            <View style={[styles.previewIconWrap, { backgroundColor: selectedColor + '22' }]}>
              <Ionicons name={selectedIcon as any} size={32} color={selectedColor} />
            </View>
            <Text style={[styles.previewName, { color: selectedColor }]} numberOfLines={1}>
              {name || 'Category name'}
            </Text>
            <Text style={[styles.previewSub, { color: selectedColor + '88' }]}>0 tasks</Text>
          </View>

          {/* Name input */}
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>CATEGORY NAME</Text>
          <TextInput
            style={[styles.nameInput, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g. Fitness, Study, Family..."
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={40}
          />

          {/* Color picker */}
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>COLOR</Text>
          <View style={styles.colorRow}>
            {ListColors.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorDot,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorDotSelected,
                ]}
                onPress={() => { setSelectedColor(color); haptics.light(); }}
                activeOpacity={0.8}
              >
                {selectedColor === color && <Ionicons name="checkmark" size={15} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Icon grid — 4 per row, properly computed width */}
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>ICON</Text>
          <View style={styles.iconGrid}>
            {ListIcons.map(icon => {
              const isSelected = selectedIcon === icon;
              return (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconBtn,
                    {
                      borderColor: isSelected ? selectedColor : colors.border,
                      backgroundColor: isSelected ? selectedColor + '15' : colors.backgroundSecondary,
                    },
                  ]}
                  onPress={() => { setSelectedIcon(icon); haptics.light(); }}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.iconCircle,
                    { backgroundColor: isSelected ? selectedColor + '25' : colors.border + '40' },
                  ]}>
                    <Ionicons
                      name={icon as any}
                      size={24}
                      color={isSelected ? selectedColor : colors.textSecondary}
                    />
                  </View>
                  <Text style={[
                    styles.iconLabel,
                    { color: isSelected ? selectedColor : colors.textTertiary, fontWeight: isSelected ? '600' : '400' },
                  ]} numberOfLines={1}>
                    {IconLabels[icon] ?? icon}
                  </Text>
                  {isSelected && (
                    <View style={[styles.iconCheckmark, { backgroundColor: selectedColor }]}>
                      <Ionicons name="checkmark" size={8} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any, accentColor: string) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  closeBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontSize: 16, fontWeight: '600' },
  saveBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
  },
  saveBtnText: { fontSize: 14, fontWeight: '600' },
  scroll: { flex: 1, paddingHorizontal: ICON_PADDING },

  // Preview card
  previewCard: {
    alignItems: 'center', paddingVertical: 24, gap: 8,
    marginVertical: 20, borderRadius: 16, borderWidth: 1,
  },
  previewIconWrap: {
    width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
  },
  previewName: { fontSize: 20, fontWeight: '600' },
  previewSub: { fontSize: 13 },

  // Fields
  fieldLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },
  nameInput: {
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 16, borderWidth: 1, marginBottom: 24,
  },

  // Color
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  colorDot: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  colorDotSelected: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 5, elevation: 4,
    transform: [{ scale: 1.1 }],
  },

  // Icon grid — strict 4-column layout, no wrapping surprises
  iconGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: ICON_GAP, marginBottom: 24,
  },
  iconBtn: {
    width: ICON_SIZE,
    height: ICON_SIZE + 8,
    borderRadius: 14, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 8,
    position: 'relative',
  },
  iconCircle: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  iconLabel: { fontSize: 10, textAlign: 'center', paddingHorizontal: 4 },
  iconCheckmark: {
    position: 'absolute', top: 6, right: 6,
    width: 14, height: 14, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
});
