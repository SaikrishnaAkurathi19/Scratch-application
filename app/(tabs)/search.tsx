import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore } from '../../stores/taskStore';
import { TaskCard } from '../../components/tasks/TaskCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Colors } from '../../constants/colors';
import { Task } from '../../types';
import { Config } from '../../constants/config';

export default function SearchScreen() {
  const router = useRouter();
  const { searchTasks, completeTask, deleteTask, loadTasks } = useTaskStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Task[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (text.trim().length < 1) { setResults([]); setSearched(false); return; }
    setSearched(true);
    const found = searchTasks(text.trim());
    setResults(found);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={Colors.textTertiary} />
        <TextInput
          style={styles.input}
          placeholder="Search tasks and notes..."
          placeholderTextColor={Colors.textTertiary}
          value={query}
          onChangeText={handleSearch}
          autoCorrect={false}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>

      {searched && results.length > 0 && (
        <Text style={styles.resultCount}>{results.length} result{results.length !== 1 ? 's' : ''}</Text>
      )}

      {searched && results.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No results found"
          subtitle={`No tasks match "${query}"`}
        />
      ) : !searched ? (
        <EmptyState
          icon="search-circle-outline"
          title="Find any task instantly"
          subtitle="Search by title or notes"
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onComplete={id => { completeTask(id); handleSearch(query); }}
              onDelete={id => { deleteTask(id); handleSearch(query); }}
              onPress={id => router.push(`/task/${id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: '500', color: Colors.text },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: Colors.border,
  },
  input: { flex: 1, fontSize: 15, color: Colors.text },
  resultCount: { fontSize: 12, color: Colors.textSecondary, paddingHorizontal: 20, marginBottom: 6 },
});
