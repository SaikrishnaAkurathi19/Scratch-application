import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTaskStore } from '../../stores/taskStore';
import { useListStore } from '../../stores/listStore';
import { Colors, PriorityColors } from '../../constants/colors';
import { Priority } from '../../types';
import { toUnix, quickDateToUnix } from '../../utils/date';
import { useHaptics } from '../../hooks/useHaptics';

type QuickDate = 'Today' | 'Tomorrow' | 'Next Week';
const PRIORITIES: Priority[] = ['high', 'medium', 'low'];
const PRIORITY_LABELS = { high: '🔥 High', medium: 'Medium', low: 'Low' };

export default function NewTaskScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const { createTask } = useTaskStore();
  const { lists } = useListStore();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [selectedListId, setSelectedListId] = useState(lists[0]?.id ?? '');
  const [quickDate, setQuickDate] = useState<QuickDate | null>(null);
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const getDueDate = (): number | null => {
    if (customDate) return toUnix(customDate);
    if (quickDate) return quickDateToUnix(quickDate);
    return null;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a task title.');
      return;
    }
    if (!selectedListId) {
      Alert.alert('Select a list', 'Please choose a list for this task.');
      return;
    }
    setSaving(true);
    try {
      await createTask({
        title: title.trim(),
        notes: notes.trim() || undefined,
        priority,
        listId: selectedListId,
        dueDate: getDueDate(),
        reminderAt: reminderDate ? toUnix(reminderDate) : null,
      });
      haptics.success();
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Could not save task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.heading}>New task</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving || !title.trim()}>
            <Text style={[styles.saveBtn, (!title.trim() || saving) && styles.saveBtnDisabled]}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Title */}
          <TextInput
            style={styles.titleInput}
            placeholder="What needs to be done?"
            placeholderTextColor={Colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            autoFocus
            multiline
            maxLength={200}
          />

          {/* Notes */}
          <TextInput
            style={styles.notesInput}
            placeholder="Add notes..."
            placeholderTextColor={Colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            maxLength={1000}
          />

          <View style={styles.divider} />

          {/* Priority */}
          <Text style={styles.fieldLabel}>PRIORITY</Text>
          <View style={styles.pillRow}>
            {PRIORITIES.map(p => {
              const c = PriorityColors[p];
              const selected = priority === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.pill,
                    { borderColor: selected ? c.border : Colors.border },
                    selected && { backgroundColor: c.bg },
                  ]}
                  onPress={() => { setPriority(p); haptics.light(); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, { color: selected ? c.text : Colors.textSecondary }]}>
                    {PRIORITY_LABELS[p]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Due date */}
          <Text style={styles.fieldLabel}>DUE DATE</Text>
          <View style={styles.pillRow}>
            {(['Today', 'Tomorrow', 'Next Week'] as QuickDate[]).map(d => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.pill,
                  { borderColor: quickDate === d ? Colors.primary : Colors.border },
                  quickDate === d && { backgroundColor: Colors.primaryLight },
                ]}
                onPress={() => { setQuickDate(quickDate === d ? null : d); setCustomDate(null); haptics.light(); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, { color: quickDate === d ? Colors.primary : Colors.textSecondary }]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.pill,
                { borderColor: customDate ? Colors.primary : Colors.border },
                customDate && { backgroundColor: Colors.primaryLight },
              ]}
              onPress={() => { setShowDatePicker(true); setQuickDate(null); }}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={12} color={customDate ? Colors.primary : Colors.textSecondary} />
              <Text style={[styles.pillText, { color: customDate ? Colors.primary : Colors.textSecondary }]}>
                {customDate ? customDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Pick'}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={customDate ?? new Date()}
              mode="date"
              minimumDate={new Date()}
              onChange={(_, date) => { setShowDatePicker(false); if (date) setCustomDate(date); }}
            />
          )}

          {/* Reminder */}
          <Text style={styles.fieldLabel}>REMINDER</Text>
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => setShowReminderPicker(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={16} color={reminderDate ? Colors.primary : Colors.textTertiary} />
            <Text style={[styles.fieldRowText, reminderDate && { color: Colors.primary }]}>
              {reminderDate
                ? reminderDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                : 'Set a reminder...'}
            </Text>
            {reminderDate && (
              <TouchableOpacity onPress={() => setReminderDate(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {showReminderPicker && (
            <DateTimePicker
              value={reminderDate ?? new Date()}
              mode="datetime"
              minimumDate={new Date()}
              onChange={(_, date) => { setShowReminderPicker(false); if (date) setReminderDate(date); }}
            />
          )}

          {/* List picker */}
          <Text style={styles.fieldLabel}>LIST</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.listScroll}>
            {lists.map(list => (
              <TouchableOpacity
                key={list.id}
                style={[
                  styles.listPill,
                  { borderColor: selectedListId === list.id ? list.color : Colors.border },
                  selectedListId === list.id && { backgroundColor: list.color + '18' },
                ]}
                onPress={() => { setSelectedListId(list.id); haptics.light(); }}
                activeOpacity={0.7}
              >
                <Ionicons name={list.icon as any} size={12} color={selectedListId === list.id ? list.color : Colors.textSecondary} />
                <Text style={[styles.listPillText, { color: selectedListId === list.id ? list.color : Colors.textSecondary }]}>
                  {list.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  heading: { fontSize: 16, fontWeight: '500', color: Colors.text },
  saveBtn: { fontSize: 16, fontWeight: '500', color: Colors.primary },
  saveBtnDisabled: { color: Colors.textTertiary },
  scroll: { flex: 1, paddingHorizontal: 20 },
  titleInput: { fontSize: 20, fontWeight: '400', color: Colors.text, marginBottom: 6, lineHeight: 28, minHeight: 40 },
  notesInput: { fontSize: 15, color: Colors.textSecondary, marginBottom: 12, lineHeight: 22, minHeight: 36 },
  divider: { height: 0.5, backgroundColor: Colors.border, marginBottom: 16 },
  fieldLabel: { fontSize: 10, fontWeight: '500', color: Colors.textSecondary, letterSpacing: 0.8, marginBottom: 8 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5 },
  pillText: { fontSize: 13, fontWeight: '400' },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.backgroundSecondary, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 18,
  },
  fieldRowText: { flex: 1, fontSize: 14, color: Colors.textTertiary },
  listScroll: { marginBottom: 18 },
  listPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 10, borderWidth: 1.5, marginRight: 8,
  },
  listPillText: { fontSize: 13 },
});
