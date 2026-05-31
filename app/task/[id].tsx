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
import { Colors, PriorityColors } from '../../constants/colors';
import { TaskWithExtras, Priority } from '../../types';
import { formatDateTime, formatDate } from '../../utils/date';
import { useHaptics } from '../../hooks/useHaptics';
import { addSubtask, toggleSubtask, deleteSubtask } from '../../db/queries/tasks';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const haptics = useHaptics();
  const { getTaskById, completeTask, uncompleteTask, updateTask, deleteTask } = useTaskStore();
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

  const handleDelete = () => {
    Alert.alert('Delete task', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteTask(task.id); router.back(); } },
    ]);
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    addSubtask(task.id, subtaskInput.trim());
    setSubtaskInput('');
    haptics.light();
    load();
  };

  const pc = PriorityColors[task.priority];
  const subtasks = task.subtasks ?? [];
  const completedSubs = subtasks.filter(s => s.isCompleted === 1).length;
  const list = lists.find(l => l.id === task.listId);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Nav */}
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.navActions}>
            {editing ? (
              <TouchableOpacity onPress={handleSaveEdit}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setEditing(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="create-outline" size={22} color={Colors.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={22} color={Colors.high} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Complete toggle */}
          <TouchableOpacity style={styles.completeRow} onPress={handleToggleComplete} activeOpacity={0.7}>
            <View style={[styles.bigCheck, task.isCompleted ? styles.bigCheckDone : { borderColor: pc.checkBorder }]}>
              {task.isCompleted === 1 && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
            </View>
            <Text style={[styles.taskTitle, task.isCompleted === 1 && styles.taskTitleDone]}>
              {editing ? '' : task.title}
            </Text>
          </TouchableOpacity>

          {/* Editable fields */}
          {editing && (
            <View style={styles.editWrap}>
              <TextInput
                style={styles.editTitle}
                value={title}
                onChangeText={setTitle}
                multiline
                autoFocus
                placeholder="Task title"
                placeholderTextColor={Colors.textTertiary}
              />
              <TextInput
                style={styles.editNotes}
                value={notes}
                onChangeText={setNotes}
                multiline
                placeholder="Notes..."
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          )}

          {!editing && task.notes && (
            <Text style={styles.notes}>{task.notes}</Text>
          )}

          {/* Meta chips */}
          <View style={styles.chips}>
            <View style={[styles.chip, { backgroundColor: pc.bg, borderColor: pc.border }]}>
              {task.priority === 'high' && <Ionicons name="flame" size={12} color={pc.text} />}
              <Text style={[styles.chipText, { color: pc.text }]}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority
              </Text>
            </View>
            {list && (
              <View style={[styles.chip, { backgroundColor: list.color + '18', borderColor: list.color + '44' }]}>
                <Ionicons name={list.icon as any} size={12} color={list.color} />
                <Text style={[styles.chipText, { color: list.color }]}>{list.name}</Text>
              </View>
            )}
            {task.dueDate && (
              <View style={styles.chip}>
                <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
                <Text style={styles.chipText}>{formatDate(task.dueDate)}</Text>
              </View>
            )}
            {task.reminderAt && (
              <View style={[styles.chip, { backgroundColor: Colors.primaryLight, borderColor: Colors.primaryMid }]}>
                <Ionicons name="notifications" size={12} color={Colors.primary} />
                <Text style={[styles.chipText, { color: Colors.primary }]}>{formatDateTime(task.reminderAt)}</Text>
              </View>
            )}
          </View>

          {/* Subtasks */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>SUBTASKS</Text>
              {subtasks.length > 0 && (
                <Text style={styles.sectionBadge}>{completedSubs}/{subtasks.length}</Text>
              )}
            </View>

            {subtasks.map(sub => (
              <View key={sub.id} style={styles.subRow}>
                <TouchableOpacity
                  style={[styles.subCheck, sub.isCompleted === 1 && styles.subCheckDone]}
                  onPress={() => { toggleSubtask(sub.id, sub.isCompleted ? 0 : 1); haptics.light(); load(); }}
                >
                  {sub.isCompleted === 1 && <Ionicons name="checkmark" size={10} color={Colors.primary} />}
                </TouchableOpacity>
                <Text style={[styles.subTitle, sub.isCompleted === 1 && styles.subTitleDone]}>{sub.title}</Text>
                <TouchableOpacity onPress={() => { deleteSubtask(sub.id); load(); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={15} color={Colors.textTertiary} />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.subInputRow}>
              <TextInput
                style={styles.subInput}
                placeholder="Add a subtask..."
                placeholderTextColor={Colors.textTertiary}
                value={subtaskInput}
                onChangeText={setSubtaskInput}
                onSubmitEditing={handleAddSubtask}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={handleAddSubtask} disabled={!subtaskInput.trim()}>
                <Ionicons name="add-circle" size={24} color={subtaskInput.trim() ? Colors.primary : Colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  navActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  saveText: { fontSize: 16, fontWeight: '500', color: Colors.primary },
  scroll: { flex: 1, paddingHorizontal: 20 },
  completeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 8 },
  bigCheck: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 3, flexShrink: 0 },
  bigCheckDone: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  taskTitle: { flex: 1, fontSize: 22, fontWeight: '500', color: Colors.text, lineHeight: 30 },
  taskTitleDone: { color: Colors.textTertiary, textDecorationLine: 'line-through' },
  notes: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 14 },
  editWrap: { marginBottom: 14 },
  editTitle: { fontSize: 22, fontWeight: '500', color: Colors.text, marginBottom: 8, lineHeight: 30, borderBottomWidth: 1, borderBottomColor: Colors.primaryMid, paddingBottom: 4 },
  editNotes: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 10, backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipText: { fontSize: 12, color: Colors.textSecondary },
  section: { backgroundColor: Colors.backgroundSecondary, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary, letterSpacing: 0.8 },
  sectionBadge: { fontSize: 11, color: Colors.primary, fontWeight: '500', backgroundColor: Colors.primaryLight, paddingHorizontal: 7, paddingVertical: 1, borderRadius: 8 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  subCheck: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  subCheckDone: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  subTitle: { flex: 1, fontSize: 14, color: Colors.text },
  subTitleDone: { color: Colors.textTertiary, textDecorationLine: 'line-through' },
  subInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8 },
  subInput: { flex: 1, fontSize: 14, color: Colors.text },
});
