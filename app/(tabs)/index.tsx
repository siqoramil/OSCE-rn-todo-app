import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'nativewind';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DueDatePicker } from '@/components/DueDatePicker';
import { FilterBar, type TodoFilter } from '@/components/FilterBar';
import { Logo } from '@/components/Logo';
import { TodoRow } from '@/components/TodoRow';
import { useTranslation } from '@/lib/i18n';
import {
  addTodo,
  deleteTodo,
  isOverdue,
  toggleTodo,
  updateTodo,
  useTodos,
  type Todo,
} from '@/lib/todos';
import { useUser } from '@/lib/user';

export default function TodoScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const { user } = useUser();
  const uid = user?.uid;

  const { todos, loading } = useTodos(uid);

  // Compose form: title + optional deadline, reused for create and edit.
  const [text, setText] = useState('');
  const [dueAt, setDueAt] = useState<Date | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [filter, setFilter] = useState<TodoFilter>('all');
  const [search, setSearch] = useState('');

  const remaining = useMemo(
    () => todos.filter((item) => !item.done).length,
    [todos]
  );

  const counts = useMemo(
    () => ({
      all: todos.length,
      active: todos.filter((item) => !item.done).length,
      done: todos.filter((item) => item.done).length,
    }),
    [todos]
  );

  // Filtering happens on the client: the list is already fully in memory from
  // the realtime listener, so a Firestore query per filter would only add
  // round-trips (and a composite index) for no gain.
  const visibleTodos = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return todos.filter((item) => {
      if (filter === 'active' && item.done) return false;
      if (filter === 'done' && !item.done) return false;
      if (needle && !item.title.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [todos, filter, search]);

  const overdueCount = useMemo(
    () => todos.filter((item) => isOverdue(item)).length,
    [todos]
  );

  const resetForm = () => {
    setText('');
    setDueAt(null);
    setEditingId(null);
  };

  // CREATE / UPDATE
  const submit = () => {
    const title = text.trim();
    if (!title || !uid) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (editingId) {
      updateTodo(uid, editingId, title, dueAt).catch((e) =>
        console.warn('[todos] update failed:', e?.code ?? e)
      );
    } else {
      addTodo(uid, title, dueAt).catch((e) =>
        console.warn('[todos] add failed:', e?.code ?? e)
      );
    }
    resetForm();
  };

  const toggle = (item: Todo) => {
    if (!uid) return;
    toggleTodo(uid, item.id, !item.done).catch((e) =>
      console.warn('[todos] toggle failed:', e?.code ?? e)
    );
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setText(todo.title);
    setDueAt(todo.dueAt);
  };

  const remove = (id: string) => {
    if (!uid) return;
    deleteTodo(uid, id).catch((e) =>
      console.warn('[todos] delete failed:', e?.code ?? e)
    );
    if (editingId === id) resetForm();
  };

  // Which "nothing here" message fits the current filter + search.
  const emptyMessage = () => {
    if (search.trim()) return t('noMatches');
    if (filter === 'active') return t('nothingActive');
    if (filter === 'done') return t('nothingDone');
    return t('emptyList');
  };

  return (
    <SafeAreaView
      className="flex-1 bg-slate-50 dark:bg-slate-950"
      edges={['top']}>
      <View className="px-5">
        {/* Header */}
        <View className="flex-row items-center gap-3 pt-3 pb-1">
          <Logo size={40} />
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="text-3xl font-extrabold tracking-widest text-slate-900 dark:text-white">
              {user?.fullName?.trim() || 'OSCE-Todo'}
            </Text>
            <View className="mt-0.5 flex-row items-center gap-2">
              <Text className="text-sm font-medium text-slate-400 dark:text-slate-500">
                {remaining > 0 ? t('tasksLeft', { count: remaining }) : t('allDone')}
              </Text>
              {overdueCount > 0 ? (
                <Text className="text-sm font-semibold text-red-500">
                  · {overdueCount} {t('overdue').toLowerCase()}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Compose */}
        <KeyboardAvoidingView behavior="padding">
          <View className="mt-4 gap-2">
            <View className="flex-row items-center gap-2">
              <TextInput
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[16px] leading-[20px] text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder={t('whatToDo')}
                placeholderTextColor={isDark ? '#64748b' : '#9ca3af'}
                value={text}
                onChangeText={setText}
                onSubmitEditing={submit}
                returnKeyType="done"
              />
              <Pressable
                onPress={submit}
                className="rounded-2xl bg-indigo-500 px-5 py-3.5 shadow-lg shadow-indigo-500/30 active:opacity-80">
                <Text className="text-base font-bold text-white">
                  {editingId ? t('save') : t('add')}
                </Text>
              </Pressable>
            </View>

            <View className="flex-row items-center justify-between">
              <DueDatePicker value={dueAt} onChange={setDueAt} />
              {editingId ? (
                <Pressable onPress={resetForm} hitSlop={8}>
                  <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                    {t('cancel')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Filter + search */}
        <View className="mt-4 mb-3">
          <FilterBar
            filter={filter}
            onFilterChange={setFilter}
            search={search}
            onSearchChange={setSearch}
            counts={counts}
          />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={visibleTodos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 32,
          gap: 10,
        }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          loading ? (
            <View className="mt-24 items-center">
              <ActivityIndicator size="large" color="#6366f1" />
              <Text className="mt-3 text-base font-medium text-slate-400 dark:text-slate-500">
                {t('loadingTasks')}
              </Text>
            </View>
          ) : (
            <View className="mt-24 items-center">
              <Ionicons
                name={search.trim() ? 'search-outline' : 'clipboard-outline'}
                size={56}
                color={isDark ? '#334155' : '#cbd5e1'}
              />
              <Text className="mt-3 text-base font-medium text-slate-400 dark:text-slate-500">
                {emptyMessage()}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <TodoRow
            todo={item}
            onToggle={toggle}
            onEdit={startEdit}
            onDelete={remove}
          />
        )}
      />
    </SafeAreaView>
  );
}
