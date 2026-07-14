import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useMemo, useState } from 'react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Logo } from '@/components/Logo';
import { useTranslation } from '@/lib/i18n';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

type Todo = {
  id: string;
  title: string;
  done: boolean;
};

export default function TodoScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const remaining = useMemo(
    () => todos.filter((t) => !t.done).length,
    [todos]
  );

  // CREATE / UPDATE (title)
  const submit = () => {
    const title = text.trim();
    if (!title) return;

    if (editingId) {
      setTodos((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, title } : t))
      );
      setEditingId(null);
    } else {
      setTodos((prev) => [
        { id: Date.now().toString(), title, done: false },
        ...prev,
      ]);
    }
    setText('');
  };

  // UPDATE (done)
  const toggle = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  // Start editing an existing todo
  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setText(todo.title);
  };

  // DELETE
  const remove = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setText('');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      <View className="px-5">
        {/* Header */}
        <View className="flex-row items-center justify-between pt-3 pb-1">
          <View className="flex-row items-center gap-3">
            <Logo size={40} />
            <View>
              <Text className="text-3xl font-extrabold tracking-widest text-slate-900 dark:text-white">
                JANGSHN
              </Text>
              <Text className="mt-0.5 text-sm font-medium text-slate-400 dark:text-slate-500">
                {remaining > 0
                  ? t('tasksLeft', { count: remaining })
                  : t('allDone')}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <LanguageSwitcher />
            <Pressable
              onPress={toggleColorScheme}
              hitSlop={8}
              className="h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white active:opacity-70 dark:border-slate-700 dark:bg-slate-800">
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={20}
                color={isDark ? '#facc15' : '#475569'}
              />
            </Pressable>
            <Pressable
              onPress={() => router.replace('/login')}
              hitSlop={8}
              className="h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white active:opacity-70 dark:border-slate-700 dark:bg-slate-800">
              <Ionicons
                name="log-out-outline"
                size={20}
                color={isDark ? '#94a3b8' : '#475569'}
              />
            </Pressable>
          </View>
        </View>

        {/* Input */}
        <KeyboardAvoidingView behavior="padding">
          <View className="mt-4 mb-4 flex-row items-center gap-2">
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
        </KeyboardAvoidingView>
      </View>

      {/* List */}
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 10 }}
        ListEmptyComponent={
          <View className="mt-24 items-center">
            <Ionicons
              name="clipboard-outline"
              size={56}
              color={isDark ? '#334155' : '#cbd5e1'}
            />
            <Text className="mt-3 text-base font-medium text-slate-400 dark:text-slate-500">
              {t('emptyList')}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="flex-row items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Pressable
              className="flex-1 flex-row items-center gap-3"
              onPress={() => toggle(item.id)}>
              <View
                className={`h-6 w-6 items-center justify-center rounded-lg border-2 ${
                  item.done
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                {item.done && (
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                )}
              </View>
              <Text
                className={`flex-1 text-base ${
                  item.done
                    ? 'text-slate-400 line-through dark:text-slate-600'
                    : 'text-slate-900 dark:text-white'
                }`}>
                {item.title}
              </Text>
            </Pressable>

            <Pressable onPress={() => startEdit(item)} hitSlop={8}>
              <Ionicons
                name="create-outline"
                size={22}
                color={isDark ? '#94a3b8' : '#64748b'}
              />
            </Pressable>
            <Pressable onPress={() => remove(item.id)} hitSlop={8}>
              <Ionicons
                name="trash-outline"
                size={22}
                color={isDark ? '#f87171' : '#ef4444'}
              />
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
