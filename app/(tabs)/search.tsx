import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore } from '../../stores/taskStore';
import { TaskCard } from '../../components/tasks/TaskCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { useTheme } from '../../hooks/useTheme';
import { Task } from '../../types';

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { searchTasks, completeTask, trashTask } = useTaskStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Task[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (text.trim().length > 0) {
      setResults(searchTasks(text.trim()));
      setSearched(true);
    } else {
      setResults([]);
      setSearched(false);
    }
  }, []);

  const reload = () => {
    if (query.trim()) setResults(searchTasks(query.trim()));
  };

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>

      <View style={[styles.searchBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
        <Ionicons name="search" size={16} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search tasks..."
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
            <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {!searched && (
        <EmptyState icon="search-outline" title="Search your tasks" subtitle="Find tasks by title or notes" />
      )}

      {searched && results.length === 0 && (
        <EmptyState icon="search-outline" title="No results" subtitle={`No tasks match "${query}"`} />
      )}

      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={
            <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
              {results.length} result{results.length !== 1 ? 's' : ''}
            </Text>
          }
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onComplete={id => { completeTask(id); reload(); }}
              onTrash={id => { trashTask(id); reload(); }}
              onPress={id => router.push(`/task/${id}` as any)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '500', color: colors.text },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 12,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15 },
  resultCount: { fontSize: 12, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8, fontWeight: '500' },
});
