import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore } from '../../stores/taskStore';
import { useListStore } from '../../stores/listStore';
import { useTheme } from '../../hooks/useTheme';
import { TaskWithExtras, Priority } from '../../types';
import { formatDateTime, formatDate } from '../../utils/date';
import { useHaptics } from '../../hooks/useHaptics';
import { addSubtask, toggleSubtask, deleteSubtask } from '../../db/queries/tasks';

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

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

  const load = useCallback(() => {
    if (!id) return;
    const t = getTaskById(id);
    setTask(t);
    setTitle(t?.title ?? '');
    setNotes(t?.notes ?? '');
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
    updateTask(task.id, { title: title.trim(), notes: notes.trim() || null });
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

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    addSubtask(task.id, subtaskInput.trim());
    setSubtaskInput('');
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
  const completedSubs = subtasks.filter(s => s.isCompleted === 1).length;

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
              <TouchableOpacity onPress={handleSaveEdit}>
                <Text style={[styles.saveText, { color: colors.primary }]}>Save</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setEditing(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="create-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleTrash} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={22} color={colors.high} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Complete toggle */}
          <TouchableOpacity style={styles.completeRow} onPress={editing ? handleToggleComplete : undefined} activeOpacity={editing ? 0.7 : 1}>
            <View style={[styles.bigCheck, task.isCompleted ? { backgroundColor: colors.primary, borderColor: colors.primary } : { borderColor: pc.checkBorder }]}>
              {task.isCompleted === 1 && <Ionicons name="checkmark" size={18} color="#fff" />}
            </View>
            {!editing && (
              <Text style={[styles.taskTitle, { color: colors.text }, task.isCompleted === 1 && { color: colors.textTertiary, textDecorationLine: 'line-through' }]}>
                {task.title}
              </Text>
            )}
          </TouchableOpacity>

          {editing && (
            <View style={styles.editWrap}>
              <TextInput
                style={[styles.editTitle, { color: colors.text }]}
                value={title}
                onChangeText={setTitle}
                multiline
                autoFocus
                placeholder="Task title"
                placeholderTextColor={colors.textTertiary}
              />
              <TextInput
                style={[styles.editNotes, { color: colors.textSecondary }]}
                value={notes}
                onChangeText={setNotes}
                multiline
                placeholder="Notes..."
                placeholderTextColor={colors.textTertiary}
              />
            </View>
          )}

          {!editing && task.notes && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>NOTES</Text>
              <Text style={[styles.notes, { color: colors.textSecondary }]}>{task.notes}</Text>
            </>
          )}

          {/* Priority chips — tappable to change */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PRIORITY</Text>
          <View style={styles.chipRow}>
            {PRIORITIES.map(p => {
              const selected = task.priority === p;
              const pC = getPriorityColors(p);
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, { backgroundColor: selected ? pC.bg : colors.backgroundSecondary, borderColor: selected ? pC.border : colors.border }]}
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
            {lists.map(l => {
              const selected = task.listId === l.id;
              return (
                <TouchableOpacity
                  key={l.id}
                  style={[styles.chip, { backgroundColor: selected ? l.color + '22' : colors.backgroundSecondary, borderColor: selected ? l.color : colors.border }]}
                  onPress={editing ? () => handleChangeList(l.id) : undefined}
                  activeOpacity={editing ? 0.7 : 1}
                >
                  <Ionicons name={l.icon as any} size={12} color={selected ? l.color : colors.textSecondary} />
                  <Text style={[styles.chipText, { color: selected ? l.color : colors.textSecondary, fontWeight: selected ? '600' : '400' }]}>{l.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Date info */}
          <View style={[styles.metaBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            {task.dueDate && (
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>Due {formatDate(task.dueDate)}</Text>
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
          </View>

          {/* Subtasks */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            SUBTASKS {subtasks.length > 0 ? `(${completedSubs}/${subtasks.length})` : ''}
          </Text>

          {subtasks.map(sub => (
            <TouchableOpacity
              key={sub.id}
              style={[styles.subtaskRow, { borderColor: colors.border }]}
              onPress={() => {
                if (!editing) return;
                toggleSubtask(sub.id, sub.isCompleted === 1 ? 0 : 1);
                haptics.light();
                load();
              }}
              activeOpacity={editing ? 0.7 : 1}
            >
              <View style={[styles.subCheck, { borderColor: sub.isCompleted ? colors.primary : colors.textTertiary }, sub.isCompleted === 1 && { backgroundColor: colors.primary }]}>
                {sub.isCompleted === 1 && <Ionicons name="checkmark" size={10} color="#fff" />}
              </View>
              <Text style={[styles.subtaskText, { color: colors.text }, sub.isCompleted === 1 && { color: colors.textTertiary, textDecorationLine: 'line-through' }]}>
                {sub.title}
              </Text>
              {editing && (
                <TouchableOpacity onPress={() => { deleteSubtask(sub.id); load(); }}>
                  <Ionicons name="close" size={14} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}

          {editing && (
            <View style={[styles.addSubtask, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}>
              <Ionicons name="add" size={16} color={colors.textTertiary} />
              <TextInput
                style={[styles.addSubtaskInput, { color: colors.text }]}
                placeholder="Add subtask..."
                placeholderTextColor={colors.textTertiary}
                value={subtaskInput}
                onChangeText={setSubtaskInput}
                onSubmitEditing={handleAddSubtask}
                returnKeyType="done"
              />
              {subtaskInput.trim() !== '' && (
                <TouchableOpacity onPress={handleAddSubtask}>
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                </TouchableOpacity>
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
  navActions: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  saveText: { fontSize: 16, fontWeight: '500' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  completeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingTop: 20, paddingBottom: 12 },
  bigCheck: {
    width: 26, height: 26, borderRadius: 8, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
  },
  taskTitle: { fontSize: 20, fontWeight: '500', flex: 1, lineHeight: 28 },
  editWrap: { paddingBottom: 12 },
  editTitle: { fontSize: 20, fontWeight: '400', lineHeight: 28, minHeight: 40, marginBottom: 8 },
  editNotes: { fontSize: 15, lineHeight: 22, minHeight: 36 },
  notes: { fontSize: 15, lineHeight: 22, paddingBottom: 16 },
  sectionLabel: { fontSize: 10, fontWeight: '500', letterSpacing: 0.8, marginTop: 16, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5,
  },
  chipText: { fontSize: 12 },
  metaBox: {
    borderRadius: 10, padding: 12, borderWidth: 1,
    gap: 8, marginTop: 16, marginBottom: 4,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 13 },
  subtaskRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: 0.5,
  },
  subCheck: {
    width: 18, height: 18, borderRadius: 5, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  subtaskText: { flex: 1, fontSize: 14 },
  addSubtask: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1, marginTop: 8,
  },
  addSubtaskInput: { flex: 1, fontSize: 14 },
});
