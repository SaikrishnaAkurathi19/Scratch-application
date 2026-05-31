import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
  withTiming, runOnJS, FadeOut, Layout,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../../types';
import { PriorityBadge } from './PriorityBadge';
import { Colors, PriorityColors } from '../../constants/colors';
import { formatDate, isOverdue } from '../../utils/date';
import { useHaptics } from '../../hooks/useHaptics';

interface Props {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onPress: (id: string) => void;
}

const SWIPE_THRESHOLD = 80;

export function TaskCard({ task, onComplete, onDelete, onPress }: Props) {
  const haptics = useHaptics();
  const translateX = useSharedValue(0);
  const overdueFlag = isOverdue(task.dueDate);
  const priorityColors = PriorityColors[task.priority];

  const handleComplete = useCallback(() => {
    haptics.success();
    onComplete(task.id);
  }, [task.id]);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete task', `Delete "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { haptics.medium(); onDelete(task.id); } },
    ]);
  }, [task.id, task.title]);

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
        runOnJS(handleDelete)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: translateX.value > 30
      ? Colors.lowBg
      : translateX.value < -30 ? Colors.highBg : Colors.background,
  }));

  return (
    <Animated.View
      layout={Layout.springify()}
      exiting={FadeOut.duration(200)}
      style={styles.wrapper}
    >
      {/* Background action indicators */}
      <Animated.View style={[styles.bgLayer, bgStyle]}>
        <View style={styles.bgLeft}>
          <Ionicons name="checkmark-circle" size={22} color={Colors.low} />
        </View>
        <View style={styles.bgRight}>
          <Ionicons name="trash" size={22} color={Colors.high} />
        </View>
      </Animated.View>

      <GestureDetector gesture={swipe}>
        <Animated.View style={[styles.card, cardStyle]}>
          <TouchableOpacity
            style={[styles.checkbox, { borderColor: priorityColors.checkBorder }]}
            onPress={handleComplete}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {task.isCompleted === 1 && (
              <Ionicons name="checkmark" size={12} color={Colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.content} onPress={() => onPress(task.id)} activeOpacity={0.7}>
            <Text
              style={[styles.title, task.isCompleted === 1 && styles.titleDone]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
            <View style={styles.meta}>
              {overdueFlag && (
                <View style={styles.overdueTag}>
                  <Ionicons name="alert-circle" size={9} color={Colors.high} />
                  <Text style={styles.overdueText}>Overdue</Text>
                </View>
              )}
              {task.dueDate && !overdueFlag && (
                <Text style={styles.metaText}>
                  <Ionicons name="calendar-outline" size={9} color={Colors.textSecondary} />
                  {' '}{formatDate(task.dueDate)}
                </Text>
              )}
              {task.reminderAt && (
                <Ionicons name="notifications-outline" size={10} color={Colors.primary} style={{ marginLeft: 4 }} />
              )}
              {task.notes && (
                <Ionicons name="document-text-outline" size={10} color={Colors.textTertiary} style={{ marginLeft: 4 }} />
              )}
            </View>
          </TouchableOpacity>

          <PriorityBadge priority={task.priority} />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginVertical: 4, borderRadius: 12, overflow: 'hidden' },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, borderRadius: 12,
  },
  bgLeft: { flexDirection: 'row', alignItems: 'center' },
  bgRight: { flexDirection: 'row', alignItems: 'center' },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.background,
    padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  content: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, color: Colors.text, fontWeight: '400', lineHeight: 20 },
  titleDone: { color: Colors.textTertiary, textDecorationLine: 'line-through' },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 3, flexWrap: 'wrap', gap: 4 },
  metaText: { fontSize: 11, color: Colors.textSecondary },
  overdueTag: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: Colors.highBg, paddingHorizontal: 5,
    paddingVertical: 1, borderRadius: 6,
  },
  overdueText: { fontSize: 10, color: Colors.high, fontWeight: '500' },
});
