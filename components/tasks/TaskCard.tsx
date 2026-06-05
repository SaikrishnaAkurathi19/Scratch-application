import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, TextInput } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
  withTiming, runOnJS, FadeOut, Layout,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Task, Subtask } from '../../types';
import { PriorityBadge } from './PriorityBadge';
import { useTheme } from '../../hooks/useTheme';
import { formatDate, isOverdue } from '../../utils/date';
import { useHaptics } from '../../hooks/useHaptics';
import { addSubtask, deleteSubtask, getTaskById, toggleSubtask } from '../../db/queries/tasks';

interface Props {
  task: Task;
  onComplete: (id: string) => void;
  onTrash: (id: string) => void;
  onPress: (id: string) => void;
  onLongPress?: (id: string) => void;
  isSelected?: boolean;
  multiSelectMode?: boolean;
}

const SWIPE_THRESHOLD = 80;

export function TaskCard({ task, onComplete, onTrash, onPress, onLongPress, isSelected, multiSelectMode }: Props) {
  const haptics = useHaptics();
  const { colors, getPriorityColors } = useTheme();
  const translateX = useSharedValue(0);
  const overdueFlag = isOverdue(task.dueDate);
  const priorityColors = getPriorityColors(task.priority);
  const [expanded, setExpanded] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  const loadSubtasks = useCallback(() => {
    const latest = getTaskById(task.id);
    setSubtasks(latest?.subtasks ?? []);
  }, [task.id]);

  const handleComplete = useCallback(() => {
    haptics.success();
    onComplete(task.id);
  }, [task.id, onComplete]);

  const handleTrash = useCallback(() => {
    haptics.medium();
    onTrash(task.id);
  }, [task.id, onTrash]);

  const handleLongPress = useCallback(() => {
    haptics.medium();
    onLongPress?.(task.id);
  }, [task.id, onLongPress]);

  const toggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    if (next) loadSubtasks();
  };

  const handleAddSubtask = () => {
    const title = subtaskInput.trim();
    if (!title) return;
    addSubtask(task.id, title);
    setSubtaskInput('');
    haptics.light();
    loadSubtasks();
  };

  const handleToggleSubtask = (sub: Subtask) => {
    toggleSubtask(sub.id, sub.isCompleted === 1 ? 0 : 1);
    haptics.light();
    loadSubtasks();
  };

  const handleDeleteSubtask = (id: string) => {
    deleteSubtask(id);
    haptics.light();
    loadSubtasks();
  };

  const swipe = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate(e => {
      translateX.value = Math.max(-120, Math.min(120, e.translationX));
    })
    .onEnd(e => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(0);
        runOnJS(handleComplete)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(0);
        runOnJS(handleTrash)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: translateX.value > 30
      ? colors.lowBg
      : translateX.value < -30 ? colors.highBg : colors.card,
  }));

  const actionLabel = task.isCompleted === 1 ? 'Reopen' : 'Done';
  const completedSubtasks = subtasks.filter(s => s.isCompleted === 1).length;
  const categoryColor = task.listColor ?? colors.primary;
  const styles = makeStyles(colors);

  return (
    <Animated.View
      layout={Layout.springify()}
      exiting={FadeOut.duration(200)}
      style={styles.wrapper}
    >
      <Animated.View style={[styles.bgLayer, bgStyle]}>
        <View style={styles.bgLeft}>
          <Ionicons name={task.isCompleted === 1 ? 'return-up-back' : 'checkmark-circle'} size={22} color={colors.low} />
          <Text style={[styles.bgText, { color: colors.low }]}>{actionLabel}</Text>
        </View>
        <View style={styles.bgRight}>
          {/* Trash icon only — no text */}
          <Ionicons name="trash" size={22} color={colors.high} />
        </View>
      </Animated.View>

      <GestureDetector gesture={swipe}>
        <Animated.View style={[styles.card, cardStyle, isSelected && { borderColor: colors.primary, borderWidth: 2 }]}>
          {multiSelectMode && (
            // In multiselect: make the whole card a large pressable target
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => onLongPress?.(task.id)}
            />
          )}

          {multiSelectMode && (
            <View style={[styles.selectCircle, isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
              {isSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
          )}

          {!multiSelectMode && (
            // Large Pressable area for checkbox — much more responsive than TouchableOpacity with hitSlop
            <Pressable
              style={styles.checkboxArea}
              onPress={handleComplete}
              hitSlop={12}
            >
              <View style={[styles.checkbox, { borderColor: priorityColors.checkBorder }]}>
                {task.isCompleted === 1 && (
                  <Ionicons name="checkmark" size={12} color={colors.primary} />
                )}
              </View>
            </Pressable>
          )}

          <TouchableOpacity
            style={styles.content}
            onPress={() => multiSelectMode ? onLongPress?.(task.id) : onPress(task.id)}
            onLongPress={handleLongPress}
            delayLongPress={200}
            activeOpacity={0.7}
          >
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '18' }]}>
              <Ionicons name={(task.listIcon ?? 'list') as any} size={10} color={categoryColor} />
              <Text style={[styles.categoryText, { color: categoryColor }]} numberOfLines={1}>
                {task.listName ?? 'Category'}
              </Text>
            </View>

            <View style={styles.titleRow}>
              <Text
                style={[styles.title, task.isCompleted === 1 && styles.titleDone]}
                numberOfLines={2}
              >
                {task.title}
              </Text>
              {task.recurrence && (
                <Ionicons name="repeat" size={12} color={colors.primary} style={{ marginLeft: 4 }} />
              )}
            </View>

            <View style={styles.meta}>
              {overdueFlag && (
                <View style={styles.overdueTag}>
                  <Ionicons name="alert-circle" size={9} color={colors.high} />
                  <Text style={[styles.overdueText, { color: colors.high }]}>Overdue</Text>
                </View>
              )}
              {task.dueDate && !overdueFlag && (
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  <Ionicons name="calendar-outline" size={9} color={colors.textSecondary} />
                  {' '}{formatDate(task.dueDate)}
                </Text>
              )}
              {task.reminderAt && (
                <Ionicons name="notifications-outline" size={10} color={colors.primary} style={{ marginLeft: 4 }} />
              )}
              {task.notes && (
                <Ionicons name="document-text-outline" size={10} color={colors.textTertiary} style={{ marginLeft: 4 }} />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.rightBadges}>
            <PriorityBadge priority={task.priority} />
            <TouchableOpacity onPress={toggleExpanded} style={styles.expandBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={15} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </GestureDetector>

      {expanded && (
        <View style={[styles.subtaskPanel, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.subtaskHeader, { color: colors.textSecondary }]}>
            Subtasks {subtasks.length > 0 ? `${completedSubtasks}/${subtasks.length}` : ''}
          </Text>
          {subtasks.map(sub => (
            <TouchableOpacity key={sub.id} style={styles.subtaskRow} onPress={() => handleToggleSubtask(sub)}>
              <View style={[styles.subCheck, { borderColor: sub.isCompleted ? colors.primary : colors.textTertiary }, sub.isCompleted === 1 && { backgroundColor: colors.primary }]}>
                {sub.isCompleted === 1 && <Ionicons name="checkmark" size={10} color="#fff" />}
              </View>
              <Text style={[styles.subtaskText, { color: colors.text }, sub.isCompleted === 1 && styles.subtaskDone]} numberOfLines={1}>
                {sub.title}
              </Text>
              {/* Trash icon only — no text */}
              <TouchableOpacity onPress={() => handleDeleteSubtask(sub.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="trash-outline" size={14} color={colors.textTertiary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          <View style={[styles.addSubtask, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="add" size={15} color={colors.textTertiary} />
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
        </View>
      )}
    </Animated.View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginVertical: 4, borderRadius: 12, overflow: 'hidden' },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 18, borderRadius: 12,
  },
  bgLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bgRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bgText: { fontSize: 12, fontWeight: '600' },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.card,
    padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  selectCircle: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 1.5,
    borderColor: colors.textTertiary, alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  // Wrapper gives a large tap area; inner view is the visual circle
  checkboxArea: {
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    marginLeft: -6,
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { flex: 1, minWidth: 0 },
  categoryBadge: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginBottom: 4,
    maxWidth: '95%',
  },
  categoryText: { fontSize: 10, fontWeight: '600' },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 14, color: colors.text, fontWeight: '400', lineHeight: 20, flex: 1 },
  titleDone: { color: colors.textTertiary, textDecorationLine: 'line-through' },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 3, flexWrap: 'wrap', gap: 4 },
  metaText: { fontSize: 11 },
  overdueTag: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: colors.highBg, paddingHorizontal: 5,
    paddingVertical: 1, borderRadius: 6,
  },
  overdueText: { fontSize: 10, fontWeight: '500' },
  rightBadges: { flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 0 },
  expandBtn: {
    width: 24, height: 24, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  subtaskPanel: {
    paddingHorizontal: 14, paddingTop: 10, paddingBottom: 12,
    borderWidth: 1, borderTopWidth: 0, borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
  },
  subtaskHeader: { fontSize: 10, fontWeight: '600', letterSpacing: 0.6, marginBottom: 4 },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
  subCheck: {
    width: 17, height: 17, borderRadius: 5, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  subtaskText: { flex: 1, fontSize: 13 },
  subtaskDone: { color: colors.textTertiary, textDecorationLine: 'line-through' },
  addSubtask: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 9, borderWidth: 1, marginTop: 4,
  },
  addSubtaskInput: { flex: 1, fontSize: 13, padding: 0 },
});
