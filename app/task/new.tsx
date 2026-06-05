import React, { useState, useEffect } from 'react';
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
import { useTheme } from '../../hooks/useTheme';
import { Priority, Recurrence } from '../../types';
import { toUnix, quickDateToUnix } from '../../utils/date';
import { useHaptics } from '../../hooks/useHaptics';
import { addSubtask as saveSubtask } from '../../db/queries/tasks';

type QuickDate = 'Today' | 'Tomorrow' | 'Next Week';
const PRIORITIES: Priority[] = ['none', 'high', 'medium', 'low'];
const PRIORITY_LABELS: Record<Priority, string> = { none: 'None', high: 'High', medium: 'Medium', low: 'Low' };
const RECURRENCES: Array<{ value: Recurrence | 'weekdays'; label: string; icon: string }> = [
  { value: 'daily', label: 'Daily', icon: 'sunny-outline' },
  { value: 'weekly', label: 'Weekly', icon: 'calendar-outline' },
  { value: 'monthly', label: 'Monthly', icon: 'calendar-number-outline' },
  { value: 'yearly', label: 'Yearly', icon: 'gift-outline' },
  { value: 'weekdays', label: 'Custom days', icon: 'options-outline' },
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function NewTaskScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const { colors } = useTheme();
  const { createTask } = useTaskStore();
  const { lists, loadLists } = useListStore();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('none');
  const [selectedListId, setSelectedListId] = useState('');
  const [quickDate, setQuickDate] = useState<QuickDate | null>(null);
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [showReminderPicker, setShowReminderPicker] = useState<false | 'date' | 'time'>(false);
  const [recurrence, setRecurrence] = useState<Recurrence>(null);
  const [customRecurrence, setCustomRecurrence] = useState(false);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(null);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Fix: pre-select list once lists load
  useEffect(() => {
    if (lists.length > 0 && !selectedListId) {
      setSelectedListId(lists[0].id);
    }
  }, [lists]);

  useEffect(() => { loadLists(); }, []);

  const getDueDate = (): number | null => {
    if (customDate) return toUnix(customDate);
    if (quickDate) return quickDateToUnix(quickDate);
    return null;
  };

  const addSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks(prev => [...prev, subtaskInput.trim()]);
    setSubtaskInput('');
    haptics.light();
  };

  const removeSubtask = (i: number) => {
    setSubtasks(prev => prev.filter((_, idx) => idx !== i));
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
      const finalRecurrence: Recurrence = customRecurrence
        ? (selectedWeekdays.length > 0 ? 'weekly' : null)
        : recurrence;

      const task = await createTask({
        title: title.trim(),
        notes: notes.trim() || undefined,
        priority,
        workNature: 'personal',
        listId: selectedListId,
        dueDate: getDueDate(),
        reminderAt: reminderDate ? toUnix(reminderDate) : null,
        recurrence: finalRecurrence,
        recurrenceEndDate: recurrenceEndDate ? toUnix(recurrenceEndDate) : null,
        recurrenceDays: customRecurrence && selectedWeekdays.length > 0
          ? JSON.stringify(selectedWeekdays)
          : null,
      });

      // Add subtasks
      if (subtasks.length > 0) {
        for (const s of subtasks) {
          saveSubtask(task.id, s);
        }
      }

      haptics.success();
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Could not save task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.handle} />

        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.heading}>New task</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving || !title.trim()}>
            <Text style={[styles.saveBtn, (!title.trim() || saving) && { color: colors.textTertiary }]}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TextInput
            style={styles.titleInput}
            placeholder="What needs to be done?"
            placeholderTextColor={colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            autoFocus
            multiline
            maxLength={200}
          />
          <TextInput
            style={styles.notesInput}
            placeholder="Add notes..."
            placeholderTextColor={colors.textTertiary}
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
              const selected = priority === p;
              const pColors = { none: colors.textSecondary, high: colors.high, medium: colors.medium, low: colors.low };
              const c = pColors[p];
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.pill, { borderColor: selected ? c : colors.border }, selected && { backgroundColor: c + '22' }]}
                  onPress={() => { setPriority(p); haptics.light(); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, { color: selected ? c : colors.textSecondary }]}>
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
                  { borderColor: quickDate === d ? colors.primary : colors.border },
                  quickDate === d && { backgroundColor: colors.primaryLight },
                ]}
                onPress={() => { setQuickDate(quickDate === d ? null : d); setCustomDate(null); haptics.light(); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, { color: quickDate === d ? colors.primary : colors.textSecondary }]}>{d}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.pill,
                { borderColor: customDate ? colors.primary : colors.border },
                customDate && { backgroundColor: colors.primaryLight },
              ]}
              onPress={() => { setShowDatePicker(true); setQuickDate(null); }}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={12} color={customDate ? colors.primary : colors.textSecondary} />
              <Text style={[styles.pillText, { color: customDate ? colors.primary : colors.textSecondary }]}>
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
            style={[styles.fieldRow, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
            onPress={() => setShowReminderPicker('date')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={16} color={reminderDate ? colors.primary : colors.textTertiary} />
            <Text style={[styles.fieldRowText, { color: colors.textTertiary }, reminderDate && { color: colors.primary }]}>
              {reminderDate
                ? reminderDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                : 'Set a reminder...'}
            </Text>
            {reminderDate && (
              <TouchableOpacity onPress={() => setReminderDate(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {showReminderPicker && (
            <DateTimePicker
              value={reminderDate ?? new Date()}
              mode={Platform.OS === 'ios' ? 'datetime' : showReminderPicker}
              minimumDate={new Date()}
              onChange={(_, date) => {
                if (!date) { setShowReminderPicker(false); return; }
                setReminderDate(date);
                if (Platform.OS === 'android' && showReminderPicker === 'date') setShowReminderPicker('time');
                else setShowReminderPicker(false);
              }}
            />
          )}

          {/* Recurrence */}
          <Text style={styles.fieldLabel}>REPEAT</Text>
          <View style={styles.pillRow}>
            {RECURRENCES.map(r => {
              const isWeekdays = r.value === 'weekdays';
              const selected = isWeekdays ? customRecurrence : (!customRecurrence && recurrence === r.value);
              return (
                <TouchableOpacity
                  key={r.value}
                  style={[
                    styles.pill,
                    { borderColor: selected ? colors.primary : colors.border },
                    selected && { backgroundColor: colors.primaryLight },
                  ]}
                  onPress={() => {
                    haptics.light();
                    if (isWeekdays) {
                      setCustomRecurrence(!customRecurrence);
                      setRecurrence(null);
                    } else {
                      setCustomRecurrence(false);
                      setRecurrence(recurrence === r.value ? null : r.value as Recurrence);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name={r.icon as any} size={11} color={selected ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.pillText, { color: selected ? colors.primary : colors.textSecondary }]}>{r.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {customRecurrence && (
            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((day, i) => {
                const sel = selectedWeekdays.includes(i);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.weekdayBtn, sel && { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setSelectedWeekdays(prev =>
                        prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]
                      );
                      haptics.light();
                    }}
                  >
                    <Text style={[styles.weekdayText, { color: sel ? '#fff' : colors.textSecondary }]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {((recurrence && recurrence !== 'daily') || customRecurrence) && (
            <TouchableOpacity
              style={[styles.fieldRow, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Ionicons name="flag-outline" size={16} color={recurrenceEndDate ? colors.primary : colors.textTertiary} />
              <Text style={[styles.fieldRowText, { color: colors.textTertiary }, recurrenceEndDate && { color: colors.primary }]}>
                {recurrenceEndDate
                  ? `Ends ${recurrenceEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : 'Set end date (optional)...'}
              </Text>
              {recurrenceEndDate && (
                <TouchableOpacity onPress={() => setRecurrenceEndDate(null)}>
                  <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={recurrenceEndDate ?? new Date()}
              mode="date"
              minimumDate={new Date()}
              onChange={(_, date) => { setShowEndDatePicker(false); if (date) setRecurrenceEndDate(date); }}
            />
          )}

          {/* Category picker */}
          <Text style={styles.fieldLabel}>CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.listScroll}>
            {lists.map(list => (
              <TouchableOpacity
                key={list.id}
                style={[
                  styles.listPill,
                  { borderColor: selectedListId === list.id ? list.color : colors.border },
                  selectedListId === list.id && { backgroundColor: list.color + '18' },
                ]}
                onPress={() => { setSelectedListId(list.id); haptics.light(); }}
                activeOpacity={0.7}
              >
                <Ionicons name={list.icon as any} size={12} color={selectedListId === list.id ? list.color : colors.textSecondary} />
                <Text style={[styles.listPillText, { color: selectedListId === list.id ? list.color : colors.textSecondary }]}>
                  {list.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Subtasks */}
          <Text style={styles.fieldLabel}>SUBTASKS</Text>
          {subtasks.map((s, i) => (
            <View key={i} style={[styles.subtaskRow, { borderColor: colors.border }]}>
              <Ionicons name="ellipse-outline" size={14} color={colors.textTertiary} />
              <Text style={[styles.subtaskText, { color: colors.text }]} numberOfLines={1}>{s}</Text>
              <TouchableOpacity onPress={() => removeSubtask(i)}>
                <Ionicons name="close" size={14} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          ))}
          <View style={[styles.subtaskInput, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="add" size={16} color={colors.textTertiary} />
            <TextInput
              style={[styles.subtaskInputText, { color: colors.text }]}
              placeholder="Add subtask..."
              placeholderTextColor={colors.textTertiary}
              value={subtaskInput}
              onChangeText={setSubtaskInput}
              onSubmitEditing={addSubtask}
              returnKeyType="done"
            />
            {subtaskInput.trim() !== '' && (
              <TouchableOpacity onPress={addSubtask}>
                <Ionicons name="checkmark" size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
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
  titleInput: { fontSize: 20, fontWeight: '400', color: colors.text, marginBottom: 6, lineHeight: 28, minHeight: 40 },
  notesInput: { fontSize: 15, color: colors.textSecondary, marginBottom: 12, lineHeight: 22, minHeight: 36 },
  divider: { height: 0.5, backgroundColor: colors.border, marginBottom: 16 },
  fieldLabel: { fontSize: 10, fontWeight: '500', color: colors.textSecondary, letterSpacing: 0.8, marginBottom: 8 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5 },
  pillText: { fontSize: 13, fontWeight: '400' },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, marginBottom: 18,
  },
  fieldRowText: { flex: 1, fontSize: 14 },
  listScroll: { marginBottom: 18 },
  listPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 10, borderWidth: 1.5, marginRight: 8,
  },
  listPillText: { fontSize: 13 },
  weekdayRow: { flexDirection: 'row', gap: 6, marginBottom: 12, flexWrap: 'wrap' },
  weekdayBtn: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
  },
  weekdayText: { fontSize: 12, fontWeight: '500' },
  subtaskRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 8, paddingHorizontal: 12,
    borderBottomWidth: 0.5, marginBottom: 4,
  },
  subtaskText: { flex: 1, fontSize: 14 },
  subtaskInput: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1, marginBottom: 18,
  },
  subtaskInputText: { flex: 1, fontSize: 14 },
});
