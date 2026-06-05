import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { getStats, getTodayCompletedCount, getWeekCompletedCount } from '../../db/queries/lists';
import { Stats } from '../../types';
import { useTaskStore } from '../../stores/taskStore';
import { useSettingsStore } from '../../stores/settingsStore';

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  const { getTrashedTasks, getTodayTasks, getUpcomingTasks, getHighPriorityTasks, getCompletedTasks, emptyTrash } = useTaskStore();
  const { hapticsEnabled, soundEnabled, setHapticsEnabled, setSoundEnabled, darkModeOverride, setDarkModeOverride } = useSettingsStore();

  useFocusEffect(useCallback(() => {
    try {
      setStats(getStats());
      setTodayCount(getTodayCompletedCount());
      setWeekCount(getWeekCompletedCount());
    } catch (e) {
      console.error('Stats error:', e);
    }
  }, []));

  const streak = stats?.currentStreak ?? 0;
  const longest = stats?.longestStreak ?? 0;
  const total = stats?.totalCompleted ?? 0;
  const toRecord = longest - streak;
  const themeOptions: Array<{ value: 'system' | 'light' | 'dark'; label: string; icon: string }> = [
    { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
    { value: 'light', label: 'Light', icon: 'sunny-outline' },
    { value: 'dark', label: 'Dark', icon: 'moon-outline' },
  ];

  const dots = Array.from({ length: 10 }, (_, i) => i < streak);

  const getStreakMessage = () => {
    if (streak === 0) return 'Start today — complete a task!';
    if (streak === 1) return 'Great start! Keep going tomorrow.';
    if (streak < 5) return `${streak} days in a row. You're building momentum!`;
    if (streak < 10) return `${streak} days strong. You're on fire! 🔥`;
    return `${streak} days! Absolutely unstoppable! 🏆`;
  };

  const trashCount = getTrashedTasks().length;
  const activeToday = getTodayTasks().length;
  const scheduled = getUpcomingTasks().length;
  const highPriority = getHighPriorityTasks().length;
  const completedRecent = getCompletedTasks().length;
  const completionRate = activeToday + completedRecent > 0 ? Math.round((completedRecent / (activeToday + completedRecent)) * 100) : 0;

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {streak > 0 ? "You're on fire!" : "Let's get started"}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Streak card */}
        <LinearGradient
          colors={[colors.streakGradientStart, colors.streakGradientEnd]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.streakCard}
        >
          <View style={styles.streakTop}>
            <View>
              <Text style={styles.streakLabel}>CURRENT STREAK</Text>
              <View style={styles.streakNumRow}>
                <Text style={styles.streakNum}>{streak}</Text>
                <Text style={styles.streakUnit}>days</Text>
              </View>
            </View>
            <Ionicons
              name={streak >= 7 ? 'trophy' : streak > 0 ? 'flame' : 'leaf-outline'}
              size={44} color="#FFD700"
            />
          </View>
          <Text style={styles.streakMsg}>{getStreakMessage()}</Text>
          <View style={styles.dots}>
            {dots.map((on, i) => (
              <View key={i} style={[styles.dot, on && styles.dotOn]} />
            ))}
          </View>
          <View style={styles.streakFooter}>
            <Text style={styles.streakFooterText}>Best: {longest} days</Text>
            {toRecord > 0 && streak > 0 && (
              <Text style={styles.streakFooterText}>{toRecord} more to beat record!</Text>
            )}
            {streak >= longest && streak > 0 && (
              <Text style={styles.streakFooterText}>🏆 New record!</Text>
            )}
          </View>
        </LinearGradient>

        {/* Why streak matters */}
        <View style={[styles.infoCard, { backgroundColor: colors.primaryLight, borderColor: colors.primaryMid }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary }]}>
            Your streak increases each day you complete at least one task. It motivates daily consistency and habit-building.
          </Text>
        </View>

        {/* Stat grid */}
        <View style={styles.grid}>
          {[
            { val: todayCount, label: 'Done today', icon: 'today-outline', color: colors.primary },
            { val: weekCount, label: 'This week', icon: 'calendar-outline', color: '#3B82F6' },
            { val: total, label: 'All time', icon: 'checkmark-circle-outline', color: colors.low },
            { val: longest, label: 'Best streak', icon: 'trophy-outline', color: colors.streakGold },
          ].map(({ val, label, icon, color }) => (
            <View key={label} style={[styles.statCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderMid }]}>
              <Ionicons name={icon as any} size={18} color={color} style={{ marginBottom: 6 }} />
              <Text style={[styles.statVal, { color }]}>{val}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Motivation */}
        {streak >= 3 && (
          <View style={[styles.motivationCard, { backgroundColor: colors.primaryLight, borderColor: colors.primaryMid }]}>
            <Ionicons name="sparkles" size={18} color={colors.primary} />
            <Text style={[styles.motivationText, { color: colors.primary }]}>
              You're in the top habit-builders! Consistency is your superpower.
            </Text>
          </View>
        )}

        <Text style={[styles.section, { color: colors.textSecondary }]}>TASK HEALTH</Text>

        <View style={[styles.insightCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          {[
            { label: 'Completion rate', value: `${completionRate}%`, icon: 'pulse-outline', color: colors.primary },
            { label: 'Active today', value: activeToday, icon: 'checkbox-outline', color: colors.medium },
            { label: 'Scheduled', value: scheduled, icon: 'calendar-outline', color: '#3B82F6' },
            { label: 'High priority', value: highPriority, icon: 'alert-circle-outline', color: colors.high },
          ].map(item => (
            <View key={item.label} style={styles.insightRow}>
              <View style={[styles.insightIcon, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon as any} size={16} color={item.color} />
              </View>
              <Text style={[styles.insightLabel, { color: colors.text }]}>{item.label}</Text>
              <Text style={[styles.insightValue, { color: item.color }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Settings section */}
        <Text style={[styles.section, { color: colors.textSecondary }]}>SETTINGS</Text>

        <View style={[styles.settingsCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="phone-portrait-outline" size={18} color={colors.textSecondary} />
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Haptic feedback</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Vibrate on actions</Text>
              </View>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="volume-medium-outline" size={18} color={colors.textSecondary} />
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Sound effects</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Play sounds on actions</Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

          <View style={styles.themeRow}>
            <View style={styles.settingLeft}>
              <Ionicons name={darkModeOverride === 'dark' || (darkModeOverride === 'system' && isDark) ? 'moon' : 'sunny-outline'} size={18} color={colors.textSecondary} />
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Dark mode</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  {darkModeOverride === 'system' ? 'Following system' : darkModeOverride === 'dark' ? 'Always dark' : 'Always light'}
                </Text>
              </View>
            </View>
            <View style={[styles.themeControl, { backgroundColor: colors.background, borderColor: colors.border }]}>
              {themeOptions.map(option => {
                const selected = darkModeOverride === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.themeOption, selected && { backgroundColor: colors.primaryLight }]}
                    onPress={() => setDarkModeOverride(option.value)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name={option.icon as any} size={13} color={selected ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.themeOptionText, { color: selected ? colors.primary : colors.textSecondary }]}>{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Danger zone */}
        <Text style={[styles.section, { color: colors.textSecondary }]}>DATA</Text>

        <View style={[styles.settingsCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          {trashCount > 0 && (
            <>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => Alert.alert('Empty trash', `Permanently delete ${trashCount} trashed task(s)?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Empty', style: 'destructive', onPress: () => emptyTrash() },
                ])}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  <View>
                    <Text style={[styles.settingTitle, { color: colors.danger }]}>Empty trash</Text>
                    <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>{trashCount} item{trashCount !== 1 ? 's' : ''} in trash</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={15} color={colors.textTertiary} />
              </TouchableOpacity>
              <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />
            </>
          )}

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Scratch v2.0</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Built with Expo SDK 51</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: '500', color: colors.text },
  subtitle: { fontSize: 13, marginTop: 2 },
  streakCard: { marginHorizontal: 16, borderRadius: 18, padding: 18, marginBottom: 12 },
  streakTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  streakLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', letterSpacing: 1, marginBottom: 4 },
  streakNumRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  streakNum: { fontSize: 48, fontWeight: '500', color: '#fff' },
  streakUnit: { fontSize: 16, color: 'rgba(255,255,255,0.65)' },
  streakMsg: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 8, lineHeight: 20 },
  dots: { flexDirection: 'row', gap: 5, marginTop: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)' },
  dotOn: { backgroundColor: '#fff' },
  streakFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  streakFooterText: { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    marginHorizontal: 16, marginBottom: 16, padding: 12,
    borderRadius: 12, borderWidth: 1,
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  statCard: { width: '47%', borderRadius: 14, padding: 14, borderWidth: 1 },
  statVal: { fontSize: 28, fontWeight: '500' },
  statLabel: { fontSize: 12, marginTop: 2 },
  motivationCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, padding: 14, borderRadius: 14,
    borderWidth: 1, marginBottom: 16,
  },
  motivationText: { flex: 1, fontSize: 13, lineHeight: 19 },
  section: { fontSize: 11, fontWeight: '500', letterSpacing: 0.8, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8 },
  insightCard: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
  insightIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  insightLabel: { flex: 1, fontSize: 14 },
  insightValue: { fontSize: 15, fontWeight: '700' },
  settingsCard: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: '400' },
  settingDesc: { fontSize: 12, marginTop: 1 },
  settingValue: { fontSize: 13 },
  settingDivider: { height: 0.5, marginLeft: 44 },
  themeRow: { padding: 14, gap: 12 },
  themeControl: { flexDirection: 'row', borderWidth: 1, borderRadius: 8, padding: 3 },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 6,
  },
  themeOptionText: { fontSize: 12, fontWeight: '600' },
});
