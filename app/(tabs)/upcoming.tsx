import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, FlatList, Dimensions,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore } from '../../stores/taskStore';
import { TaskCard } from '../../components/tasks/TaskCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { useTheme } from '../../hooks/useTheme';
import { Task } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_CELL_SIZE = Math.floor((SCREEN_WIDTH - 32) / 7);
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

function endOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return Math.floor(d.getTime() / 1000);
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay(); // 0=Sun
  const days: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  // Pad end to complete last week
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { getCalendarTasks, completeTask, uncompleteTask, trashTask, loadTasks } = useTaskStore();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [dayPanelOpen, setDayPanelOpen] = useState(false);

  const load = useCallback(() => {
    loadTasks();
    setAllTasks(getCalendarTasks());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Map unix timestamp → tasks for that day
  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    allTasks.forEach(task => {
      if (!task.dueDate) return;
      const d = new Date(task.dueDate * 1000);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    });
    return map;
  }, [allTasks]);

  const getDayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  const calDays = useMemo(() => buildCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleDayPress = (d: Date) => {
    setSelectedDate(d);
    setDayPanelOpen(true);
  };

  const selectedTasks = useMemo(() => {
    return (tasksByDay.get(getDayKey(selectedDate)) ?? []).sort((a, b) => (a.isCompleted ?? 0) - (b.isCompleted ?? 0));
  }, [tasksByDay, selectedDate]);

  const handleTaskAction = (task: Task) => {
    if (task.isCompleted === 1) uncompleteTask(task.id);
    else completeTask(task.id);
    load();
  };

  const selectedDateLabel = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const isToday = sameDay(selectedDate, today);

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Calendar</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.todayBtn, { backgroundColor: colors.primaryLight }]}
          onPress={() => {
            setViewYear(today.getFullYear());
            setViewMonth(today.getMonth());
            setSelectedDate(today);
            setDayPanelOpen(true);
          }}
        >
          <Text style={[styles.todayBtnText, { color: colors.primary }]}>Today</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Month nav */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navArrow} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: colors.text }]}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navArrow} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Weekday labels */}
        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map(day => (
            <View key={day} style={[styles.weekdayCell, { width: DAY_CELL_SIZE }]}>
              <Text style={[styles.weekdayLabel, { color: colors.textTertiary }]}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {calDays.map((day, idx) => {
            if (!day) return <View key={`pad-${idx}`} style={[styles.dayCell, { width: DAY_CELL_SIZE, height: DAY_CELL_SIZE }]} />;

            const key = getDayKey(day);
            const dayTasks = tasksByDay.get(key) ?? [];
            const isSelected = sameDay(day, selectedDate);
            const isTdy = sameDay(day, today);
            const pendingCount = dayTasks.filter(t => t.isCompleted === 0).length;
            const doneCount = dayTasks.filter(t => t.isCompleted === 1).length;
            const hasTasks = dayTasks.length > 0;

            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.dayCell,
                  { width: DAY_CELL_SIZE, height: DAY_CELL_SIZE + 12 },
                  isSelected && { backgroundColor: colors.primary + '18', borderRadius: 10 },
                ]}
                onPress={() => handleDayPress(day)}
                activeOpacity={0.7}
              >
                {/* Day number */}
                <View style={[
                  styles.dayNum,
                  isTdy && { backgroundColor: colors.primary, borderRadius: 14 },
                ]}>
                  <Text style={[
                    styles.dayNumText,
                    { color: isTdy ? '#fff' : isSelected ? colors.primary : colors.text },
                    day.getDay() === 0 && !isTdy && { color: colors.high },
                  ]}>
                    {day.getDate()}
                  </Text>
                </View>

                {/* Task dots */}
                {hasTasks && (
                  <View style={styles.dotRow}>
                    {pendingCount > 0 && (
                      <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                    )}
                    {doneCount > 0 && (
                      <View style={[styles.dot, { backgroundColor: colors.low ?? '#16a34a' }]} />
                    )}
                  </View>
                )}

                {/* Task count badge */}
                {hasTasks && (
                  <View style={[styles.taskBadge, { backgroundColor: isSelected ? colors.primary : colors.primaryLight }]}>
                    <Text style={[styles.taskBadgeText, { color: isSelected ? '#fff' : colors.primary }]}>
                      {dayTasks.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Upcoming tasks list below calendar */}
        <View style={styles.agendaSection}>
          <View style={styles.agendaHeader}>
            <Text style={[styles.agendaTitle, { color: colors.text }]}>Upcoming</Text>
            <Text style={[styles.agendaSub, { color: colors.textSecondary }]}>All scheduled tasks</Text>
          </View>

          {allTasks.length === 0 ? (
            <EmptyState icon="calendar-outline" title="Nothing scheduled" subtitle="Tasks with due dates appear here" />
          ) : (
            (() => {
              // Group by date
              const groups = new Map<string, { label: string; tasks: Task[] }>();
              [...allTasks].sort((a, b) => (a.dueDate ?? 0) - (b.dueDate ?? 0)).forEach(task => {
                if (!task.dueDate) return;
                const d = new Date(task.dueDate * 1000);
                const key = getDayKey(d);
                if (!groups.has(key)) {
                  const isTdy2 = sameDay(d, today);
                  const isTmr = sameDay(d, new Date(today.getTime() + 86400000));
                  const label = isTdy2 ? 'Today' : isTmr ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                  groups.set(key, { label, tasks: [] });
                }
                groups.get(key)!.tasks.push(task);
              });

              return Array.from(groups.entries()).map(([key, { label, tasks: groupTasks }]) => (
                <View key={key}>
                  <View style={[styles.agendaDateRow, { borderColor: colors.border }]}>
                    <View style={[styles.agendaDateDot, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.agendaDateLabel, { color: label === 'Today' ? colors.primary : colors.textSecondary }]}>
                      {label.toUpperCase()}
                    </Text>
                    <View style={[styles.agendaCount, { backgroundColor: colors.primaryLight }]}>
                      <Text style={[styles.agendaCountText, { color: colors.primary }]}>{groupTasks.length}</Text>
                    </View>
                  </View>
                  {groupTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={() => handleTaskAction(task)}
                      onTrash={tid => { trashTask(tid); load(); }}
                      onPress={tid => router.push(`/task/${tid}` as any)}
                    />
                  ))}
                </View>
              ));
            })()
          )}
        </View>
      </ScrollView>

      {/* Day detail bottom sheet */}
      <Modal
        visible={dayPanelOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setDayPanelOpen(false)}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setDayPanelOpen(false)} />
        <View style={[styles.bottomSheet, { backgroundColor: colors.background }]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetDate, { color: colors.text }]}>
                {isToday ? 'Today' : selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </Text>
              <Text style={[styles.sheetDateSub, { color: colors.textSecondary }]}>
                {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
            <View style={styles.sheetHeaderRight}>
              {selectedTasks.length > 0 && (
                <View style={[styles.sheetCount, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.sheetCountText, { color: colors.primary }]}>{selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => setDayPanelOpen(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={selectedTasks}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
              <EmptyState
                icon="calendar-outline"
                title="No tasks on this day"
                subtitle="Tap + to add a task with this date"
              />
            }
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onComplete={() => { handleTaskAction(item); }}
                onTrash={tid => { trashTask(tid); load(); }}
                onPress={tid => { setDayPanelOpen(false); router.push(`/task/${tid}` as any); }}
              />
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10,
  },
  title: { fontSize: 28, fontWeight: '500', color: colors.text },
  sub: { fontSize: 13, marginTop: 2 },
  todayBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, marginTop: 4 },
  todayBtnText: { fontSize: 13, fontWeight: '600' },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  navArrow: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  monthTitle: { fontSize: 17, fontWeight: '600' },
  weekdayRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 4 },
  weekdayCell: { alignItems: 'center', paddingVertical: 4 },
  weekdayLabel: { fontSize: 11, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 },
  dayCell: {
    alignItems: 'center', justifyContent: 'flex-start',
    paddingTop: 6,
  },
  dayNum: {
    width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
  },
  dayNumText: { fontSize: 14, fontWeight: '400' },
  dotRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  taskBadge: {
    marginTop: 2, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6,
  },
  taskBadgeText: { fontSize: 9, fontWeight: '700' },
  agendaSection: { marginTop: 16 },
  agendaHeader: { paddingHorizontal: 20, paddingBottom: 12 },
  agendaTitle: { fontSize: 18, fontWeight: '600' },
  agendaSub: { fontSize: 12, marginTop: 2 },
  agendaDateRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, paddingVertical: 8,
    borderTopWidth: 0.5, marginTop: 4,
  },
  agendaDateDot: { width: 6, height: 6, borderRadius: 3 },
  agendaDateLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, flex: 1 },
  agendaCount: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  agendaCountText: { fontSize: 10, fontWeight: '600' },
  // Bottom sheet
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  bottomSheet: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 12, paddingHorizontal: 0,
    maxHeight: '70%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 12,
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  sheetDate: { fontSize: 20, fontWeight: '600' },
  sheetDateSub: { fontSize: 13, marginTop: 2 },
  sheetHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sheetCount: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  sheetCountText: { fontSize: 12, fontWeight: '600' },
});
