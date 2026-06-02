import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
  withTiming, runOnJS, FadeOut, Layout,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../../types';
import { PriorityBadge } from './PriorityBadge';
import { useTheme } from '../../hooks/useTheme';
import { formatDate, isOverdue } from '../../utils/date';
import { useHaptics } from '../../hooks/useHaptics';

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

  const handleComplete = useCallback(() => {
    haptics.success();
    onComplete(task.id);
  }, [task.id]);

  const handleTrash = useCallback(() => {
    haptics.medium();
    onTrash(task.id);
  }, [task.id]);

  const handleLongPress = useCallback(() => {
    haptics.medium();
    onLongPress?.(task.id);
  }, [task.id]);

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

  const styles = makeStyles(colors);

  return (
    <Animated.View
      layout={Layout.springify()}
      exiting={FadeOut.duration(200)}
      style={styles.wrapper}
    >
      {/* Background action indicators */}
      <Animated.View style={[styles.bgLayer, bgStyle]}>
        <View style={styles.bgLeft}>
          <Ionicons name="checkmark-circle" size={22} color={colors.low} />
          <Text style={[styles.bgText, { color: colors.low }]}>Done</Text>
        </View>
        <View style={styles.bgRight}>
          <Text style={[styles.bgText, { color: colors.high }]}>Trash</Text>
          <Ionicons name="trash" size={22} color={colors.high} />
        </View>
      </Animated.View>

      <GestureDetector gesture={swipe}>
        <Animated.View style={[styles.card, cardStyle, isSelected && { borderColor: colors.primary, borderWidth: 2 }]}>
          {multiSelectMode && (
            <View style={[styles.selectCircle, isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
              {isSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
          )}

          {!multiSelectMode && (
            <TouchableOpacity
              style={[styles.checkbox, { borderColor: priorityColors.checkBorder }]}
              onPress={handleComplete}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {task.isCompleted === 1 && (
                <Ionicons name="checkmark" size={12} color={colors.primary} />
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.content} 
            onPress={() => multiSelectMode ? onLongPress?.(task.id) : onPress(task.id)} 
            onLongPress={handleLongPress}
            activeOpacity={0.7}
          >
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
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginVertical: 4, borderRadius: 12, overflow: 'hidden' },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, borderRadius: 12,
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
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  content: { flex: 1, minWidth: 0 },
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
  workBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6,
  },
  workBadgeText: { fontSize: 10, fontWeight: '500' },
  rightBadges: { flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 0 },
  workBadgeRight: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 7,
  },
  workBadgeRightText: { fontSize: 10, fontWeight: '600' },
});
