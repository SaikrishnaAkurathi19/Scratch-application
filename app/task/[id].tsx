import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTaskStore } from '../../stores/taskStore';
import { useListStore } from '../../stores/listStore';
import { useTheme } from '../../hooks/useTheme';
import { TaskWithExtras, Priority, Recurrence } from '../../types';
import { formatDateTime, formatDate, fromUnix, toUnix } from '../../utils/date';
import { useHaptics } from '../../hooks/useHaptics';
import { addSubtask, toggleSubtask, deleteSubtask } from '../../db/queries/tasks';

const PRIORITIES: Priority[] = ['none', 'high', 'medium', 'low'];
const RECURRENCES: Array<{ value: Recurrence | 'weekdays'; label: string; icon: string }> = [
  { value: null, label: 'None', icon: 'remove-circle-outline' },
  { value: 'daily', label: 'Daily', icon: 'sunny-outline' },
  { value: 'weekly', label: 'Weekly', icon: 'calendar-outline' },
  { value: 'monthly', label: 'Monthly', icon: 'calendar-number-outline' },
  { value: 'yearly', label: 'Yearly', icon: 'gift-outline' },
  { value: 'weekdays', label: 'Custom days', icon: 'options-outline' },
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const haptics = useHaptics();
  const { colors, getPriorityColors } = useTheme();
  const { getTaskById, completeTask, uncompleteTask, updateTask, trashTask } = useTaskStore();
  const { lists } = useListStore();

  const [task, setTask] = useState<TaskWithExtras | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [showReminderPicker, setShowReminderPicker] = useState<false | 'date' | 'time'>(false);
  const [recurrence, setRecurrence] = useState<Recurrence>(null);
  const [customRecurrence, setCustomRecurrence] = useState(false);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(null);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    const t = getTaskById(id);
    setTask(t);
    setTitle(t?.title ?? '');
    setNotes(t?.notes ?? '');
    setDueDate(t?.dueDate ? fromUnix(t.dueDate) : null);
    setReminderDate(t?.reminderAt ? fromUnix(t.reminderAt) : null);
    setRecurrence(t?.recurrence ?? null);
    setCustomRecurrence(!!t?.recurrenceDays);
    setSelectedWeekdays(t?.recurrenceDays ? JSON.parse(t.recurrenceDays) : []);
    setRecurrenceEndDate(t?.recurrenceEndDate ? fromUnix(t.recurrenceEndDate) : null);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (!task) return null;

  const handleToggleComplete = () => {
    if (task.isCompleted) uncompleteTask(task.id);
    else completeTask(task.id);
    haptics.success();
    load();
  };

  const handleSaveEdit = () => {
    updateTask(task.id, {
      title: title.trim(),
      notes: notes.trim() || null,
      dueDate: dueDate ? toUnix(dueDate) : null,
      reminderAt: reminderDate ? toUnix(reminderDate) : null,
      recurrence,
      recurrenceDays: customRecurrence && selectedWeekdays.length > 0 ? JSON.stringify(selectedWeekdays) : null,
      recurrenceEndDate: ((recurrence && recurrence !== 'daily') || customRecurrence) && recurrenceEndDate ? toUnix(recurrenceEndDate) : null,
    });
    setEditing(false);
    haptics.light();
    load();
  };

  const handleTrash = () => {
    Alert.alert('Move to trash', 'Task will be moved to trash.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Trash', style: 'destructive', onPress: async () => { await trashTask(task.id); router.back(); } },
    ]);
  };

  // Subtasks always editable regardless of editing state
  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    addSubtask(task.id, subtaskInput.trim());
    setSubtaskInput('');
    haptics.light();
    load();
  };

  const handleToggleSubtask = (sub: any) => {
    toggleSubtask(sub.id, sub.isCompleted === 1 ? 0 : 1);
    haptics.light();
    load();
  };

  const handleDeleteSubtask = (subId: string) => {
    deleteSubtask(subId);
    haptics.light();
    load();
  };

  const handleChangePriority = (p: Priority) => {
    updateTask(task.id, { priority: p });
    haptics.light();
    load();
  };

  const handleChangeList = (listId: string) => {
    updateTask(task.id, { listId });
    haptics.light();
    load();
  };

  const pc = getPriorityColors(task.priority);
  const subtasks = task.subtasks ?? [];
  const completedSubs = subtasks.filter((s: any) => s.isCompleted === 1).length;

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Nav */}
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.navActions}>
            {editing ? (
              <TouchableOpacity onPress={handleSaveEdit} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.saveBtnText}>Save changes</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setEditing(true)}
                style={[styles.editBtn, { backgroundColor: colors.primaryLight }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="create-outline" size={16} color={colors.primary} />
                <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleTrash} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={22} color={colors.high} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Complete toggle + title */}
          <View style={styles.titleSection}>
            <TouchableOpacity
              style={[styles.bigCheck, task.isCompleted ? { backgroundColor: colors.primary, borderColor: colors.primary } : { borderColor: pc.checkBorder }]}
              onPress={handleToggleComplete}
              activeOpacity={0.7}
            >
              {task.isCompleted === 1 && <Ionicons name="checkmark" size={18} color="#fff" />}
            </TouchableOpacity>

            {editing ? (
              <TextInput
                style={[styles.editTitle, { color: colors.text }]}
                value={title}
                onChangeText={setTitle}
                multiline
                autoFocus
                placeholder="Task title"
                placeholderTextColor={colors.textTertiary}
              />
            ) : (
              <Text style={[styles.taskTitle, { color: colors.text }, task.isCompleted === 1 && { color: colors.textTertiary, textDecorationLine: 'line-through' }]}>
                {task.title}
              </Text>
            )}
          </View>

          {/* Notes */}
          {editing ? (
            <TextInput
              style={[styles.editNotes, { color: colors.textSecondary, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="Add notes..."
              placeholderTextColor={colors.textTertiary}
            />
          ) : task.notes ? (
            <View style={[styles.notesBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <Ionicons name="document-text-outline" size={13} color={colors.textSecondary} />
              <Text style={[styles.notes, { color: colors.textSecondary }]}>{task.notes}</Text>
            </View>
          ) : null}

          {/* ── SUBTASKS — always editable, no lock ── */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              SUBTASKS
            </Text>
            {subtasks.length > 0 && (
              <View style={[styles.subtaskCount, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.subtaskCountText, { color: colors.primary }]}>{completedSubs}/{subtasks.length}</Text>
              </View>
            )}
          </View>

          <View style={[styles.subtaskContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
            {subtasks.length === 0 && (
              <Text style={[styles.emptySubtasks, { color: colors.textTertiary }]}>No subtasks yet</Text>
            )}
            {subtasks.map((sub: any) => (
              <View key={sub.id} style={[styles.subtaskRow, { borderColor: colors.border }]}>
                <TouchableOpacity
                  style={[styles.subCheck, { borderColor: sub.isCompleted ? colors.primary : colors.textTertiary }, sub.isCompleted === 1 && { backgroundColor: colors.primary }]}
                  onPress={() => handleToggleSubtask(sub)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {sub.isCompleted === 1 && <Ionicons name="checkmark" size={10} color="#fff" />}
                </TouchableOpacity>
                <Text style={[styles.subtaskText, { color: colors.text }, sub.isCompleted === 1 && { color: colors.textTertiary, textDecorationLine: 'line-through' }]}>
                  {sub.title}
                </Text>
                <TouchableOpacity onPress={() => handleDeleteSubtask(sub.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="trash-outline" size={14} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add subtask input — always visible */}
            <View style={[styles.addSubtaskRow, { borderColor: colors.border }]}>
              <Ionicons name="add" size={16} color={colors.primary} />
              <TextInput
                style={[styles.addSubtaskInput, { color: colors.text }]}
                placeholder="Add a subtask..."
                placeholderTextColor={colors.textTertiary}
                value={subtaskInput}
                onChangeText={setSubtaskInput}
                onSubmitEditing={handleAddSubtask}
                returnKeyType="done"
              />
              {subtaskInput.trim() !== '' && (
                <TouchableOpacity onPress={handleAddSubtask} style={[styles.addSubtaskBtn, { backgroundColor: colors.primary }]}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ── LOCKED FIELDS — only editable when editing=true ── */}
          {!editing && (
            <TouchableOpacity
              style={[styles.lockedBanner, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
              onPress={() => setEditing(true)}
            >
              <Ionicons name="lock-closed-outline" size={13} color={colors.textTertiary} />
              <Text style={[styles.lockedBannerText, { color: colors.textTertiary }]}>
                Tap <Text style={{ color: colors.primary, fontWeight: '600' }}>Edit</Text> to change priority, category, or schedule
              </Text>
            </TouchableOpacity>
          )}

          {/* Priority */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PRIORITY</Text>
          <View style={styles.chipRow}>
            {PRIORITIES.map(p => {
              const selected = task.priority === p;
              const pC = getPriorityColors(p);
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, { backgroundColor: selected ? pC.bg : colors.backgroundSecondary, borderColor: selected ? pC.border : colors.border }, !editing && { opacity: selected ? 1 : 0.5 }]}
                  onPress={editing ? () => handleChangePriority(p) : undefined}
                  activeOpacity={editing ? 0.7 : 1}
                >
                  {p === 'high' && <Ionicons name="flame" size={12} color={selected ? pC.text : colors.textSecondary} />}
                  <Text style={[styles.chipText, { color: selected ? pC.text : colors.textSecondary, fontWeight: selected ? '600' : '400' }]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Category */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CATEGORY</Text>
          <View style={styles.chipRow}>
            {lists.map((l: any) => {
              const selected = task.listId === l.id;
              return (
                <TouchableOpacity
                  key={l.id}
                  style={[styles.chip, { backgroundColor: selected ? l.color + '22' : colors.backgroundSecondary, borderColor: selected ? l.color : colors.border }, !editing && { opacity: selected ? 1 : 0.5 }]}
                  onPress={editing ? () => handleChangeList(l.id) : undefined}
                  activeOpacity={editing ? 0.7 : 1}
                >
                  <Ionicons name={l.icon as any} size={12} color={selected ? l.color : colors.textSecondary} />
                  <Text style={[styles.chipText, { color: selected ? l.color : colors.textSecondary, fontWeight: selected ? '600' : '400' }]}>{l.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Schedule */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SCHEDULE</Text>
          {editing ? (
            <View style={styles.scheduleWrap}>
              <TouchableOpacity
                style={[styles.fieldRow, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={15} color={dueDate ? colors.primary : colors.textTertiary} />
                <Text style={[styles.fieldText, { color: dueDate ? colors.primary : colors.textTertiary }]}>
                  {dueDate ? `Start/Due ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Add start/due date'}
                </Text>
                {dueDate && (
                  <TouchableOpacity onPress={() => setDueDate(null)}>
                    <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={dueDate ?? new Date()}
                  mode="date"
                  onChange={(_, date) => { setShowDatePicker(false); if (date) setDueDate(date); }}
                />
              )}

              <TouchableOpacity
                style={[styles.fieldRow, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
                onPress={() => setShowReminderPicker('date')}
              >
                <Ionicons name="notifications-outline" size={15} color={reminderDate ? colors.primary : colors.textTertiary} />
                <Text style={[styles.fieldText, { color: reminderDate ? colors.primary : colors.textTertiary }]}>
                  {reminderDate
                    ? `Reminder ${reminderDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`
                    : 'Add reminder'}
                </Text>
                {reminderDate && (
                  <TouchableOpacity onPress={() => setReminderDate(null)}>
                    <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              {showReminderPicker && (
                <DateTimePicker
                  value={reminderDate ?? new Date()}
                  mode={Platform.OS === 'ios' ? 'datetime' : showReminderPicker}
                  onChange={(_, date) => {
                    if (!date) { setShowReminderPicker(false); return; }
                    setReminderDate(date);
                    if (Platform.OS === 'android' && showReminderPicker === 'date') setShowReminderPicker('time');
                    else setShowReminderPicker(false);
                  }}
                />
              )}

              <View style={styles.chipRow}>
                {RECURRENCES.map(r => {
                  const isCustom = r.value === 'weekdays';
                  const selected = isCustom ? customRecurrence : (!customRecurrence && recurrence === r.value);
                  return (
                    <TouchableOpacity
                      key={String(r.value)}
                      style={[styles.chip, { backgroundColor: selected ? colors.primaryLight : colors.backgroundSecondary, borderColor: selected ? colors.primary : colors.border }]}
                      onPress={() => {
                        if (isCustom) {
                          setCustomRecurrence(!customRecurrence);
                          setRecurrence(customRecurrence ? null : 'weekly');
                        } else {
                          setCustomRecurrence(false);
                          setSelectedWeekdays([]);
                          setRecurrence(r.value as Recurrence);
                        }
                      }}
                    >
                      <Ionicons name={r.icon as any} size={12} color={selected ? colors.primary : colors.textSecondary} />
                      <Text style={[styles.chipText, { color: selected ? colors.primary : colors.textSecondary }]}>{r.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {customRecurrence && (
                <View style={styles.weekdayRow}>
                  {WEEKDAYS.map((day, i) => {
                    const selected = selectedWeekdays.includes(i);
                    return (
                      <TouchableOpacity
                        key={day}
                        style={[styles.weekdayBtn, { backgroundColor: selected ? colors.primary : colors.backgroundSecondary }]}
                        onPress={() => setSelectedWeekdays(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i])}
                      >
                        <Text style={[styles.weekdayText, { color: selected ? '#fff' : colors.textSecondary }]}>{day}</Text>
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
                  <Ionicons name="flag-outline" size={15} color={recurrenceEndDate ? colors.primary : colors.textTertiary} />
                  <Text style={[styles.fieldText, { color: recurrenceEndDate ? colors.primary : colors.textTertiary }]}>
                    {recurrenceEndDate
                      ? `Ends ${recurrenceEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : 'Add repeat end date'}
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
                  onChange={(_, date) => { setShowEndDatePicker(false); if (date) setRecurrenceEndDate(date); }}
                />
              )}
            </View>
          ) : (
            <View style={[styles.metaBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              {task.dueDate && (
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>Start/Due {formatDate(task.dueDate)}</Text>
                </View>
              )}
              {task.reminderAt && (
                <View style={styles.metaRow}>
                  <Ionicons name="notifications-outline" size={14} color={colors.primary} />
                  <Text style={[styles.metaText, { color: colors.primary }]}>Reminder {formatDateTime(task.reminderAt)}</Text>
                </View>
              )}
              {task.recurrence && (
                <View style={styles.metaRow}>
                  <Ionicons name="repeat" size={14} color={colors.primary} />
                  <Text style={[styles.metaText, { color: colors.primary }]}>
                    Repeats {task.recurrence}
                    {task.recurrenceDays ? ` (custom days)` : ''}
                    {task.recurrenceEndDate ? ` until ${formatDate(task.recurrenceEndDate)}` : ''}
                  </Text>
                </View>
              )}
              {!task.dueDate && !task.reminderAt && !task.recurrence && (
                <Text style={[styles.metaText, { color: colors.textTertiary }]}>No schedule set</Text>
              )}
            </View>
          )}

          <View style={{ height: 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  navActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
  },
  editBtnText: { fontSize: 14, fontWeight: '600' },
  saveBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10,
  },
  saveBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  titleSection: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingTop: 20, paddingBottom: 12 },
  bigCheck: {
    width: 26, height: 26, borderRadius: 8, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
  },
  taskTitle: { fontSize: 20, fontWeight: '500', flex: 1, lineHeight: 28 },
  editTitle: { fontSize: 20, fontWeight: '400', lineHeight: 28, minHeight: 40, flex: 1 },
  editNotes: {
    fontSize: 15, lineHeight: 22, minHeight: 60, padding: 12,
    borderRadius: 10, borderWidth: 1, marginBottom: 16,
  },
  notesBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16,
  },
  notes: { fontSize: 15, lineHeight: 22, flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 8 },
  sectionLabel: { fontSize: 10, fontWeight: '500', letterSpacing: 0.8 },
  subtaskCount: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  subtaskCountText: { fontSize: 10, fontWeight: '600' },
  subtaskContainer: {
    borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginBottom: 4,
  },
  emptySubtasks: { fontSize: 13, padding: 14, textAlign: 'center' },
  subtaskRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 0.5,
  },
  subCheck: {
    width: 18, height: 18, borderRadius: 5, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  subtaskText: { flex: 1, fontSize: 14 },
  addSubtaskRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 11,
  },
  addSubtaskInput: { flex: 1, fontSize: 14, padding: 0 },
  addSubtaskBtn: {
    width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center',
  },
  lockedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    marginTop: 12, marginBottom: 4,
    paddingHorizontal: 12, paddingVertical: 9,
    borderRadius: 10, borderWidth: 1,
  },
  lockedBannerText: { fontSize: 12, flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5,
  },
  chipText: { fontSize: 12 },
  metaBox: {
    borderRadius: 10, padding: 12, borderWidth: 1,
    gap: 8, marginTop: 4, marginBottom: 4,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 13 },
  scheduleWrap: { gap: 8, marginBottom: 4 },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center', gap: 9,
    borderRadius: 10, paddingHorizontal: 11, paddingVertical: 10,
    borderWidth: 1,
  },
  fieldText: { flex: 1, fontSize: 13 },
  weekdayRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 4 },
  weekdayBtn: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8 },
  weekdayText: { fontSize: 12, fontWeight: '600' },
});
