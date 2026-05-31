import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { getStats, getTodayCompletedCount, getWeekCompletedCount } from '../../db/queries/lists';
import { Stats } from '../../types';

export default function SettingsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);

  useFocusEffect(useCallback(() => {
    setStats(getStats());
    setTodayCount(getTodayCompletedCount());
    setWeekCount(getWeekCompletedCount());
  }, []));

  const streak = stats?.currentStreak ?? 0;
  const longest = stats?.longestStreak ?? 0;
  const total = stats?.totalCompleted ?? 0;
  const toRecord = longest - streak;

  // Build last 10 days dot indicator
  const dots = Array.from({ length: 10 }, (_, i) => i < streak);

  const getStreakMessage = () => {
    if (streak === 0) return "Start today — complete a task!";
    if (streak === 1) return "Great start! Keep going tomorrow.";
    if (streak < 5)  return `${streak} days in a row. You're building momentum!`;
    if (streak < 10) return `${streak} days strong. You're on fire! 🔥`;
    return `${streak} days! Absolutely unstoppable! 🏆`;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>
          {streak > 0 ? "You're on fire!" : "Let's get started"}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Streak card */}
        <LinearGradient
          colors={[Colors.streakGradientStart, Colors.streakGradientEnd]}
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
              name={streak >= 7 ? "trophy" : streak > 0 ? "flame" : "leaf-outline"}
              size={44} color="#FFD700"
            />
          </View>

          <Text style={styles.streakMsg}>{getStreakMessage()}</Text>

          {/* Dot tracker */}
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

        {/* Stat grid */}
        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{todayCount}</Text>
            <Text style={styles.statLabel}>Done today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{weekCount}</Text>
            <Text style={styles.statLabel}>This week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{total}</Text>
            <Text style={styles.statLabel}>All time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: Colors.streakGold }]}>{longest}</Text>
            <Text style={styles.statLabel}>Best streak</Text>
          </View>
        </View>

        {/* Motivation */}
        {streak >= 3 && (
          <View style={styles.motivationCard}>
            <Ionicons name="sparkles" size={18} color={Colors.primary} />
            <Text style={styles.motivationText}>
              You're in the top habit-builders! Consistency is your superpower.
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: '500', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  streakCard: { marginHorizontal: 16, borderRadius: 18, padding: 18, marginBottom: 16 },
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  statCard: {
    width: '47%', backgroundColor: Colors.backgroundSecondary,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.borderMid,
  },
  statVal: { fontSize: 28, fontWeight: '500', color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  motivationCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, padding: 14, borderRadius: 14,
    backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primaryMid,
  },
  motivationText: { flex: 1, fontSize: 13, color: Colors.primary, lineHeight: 19 },
});
