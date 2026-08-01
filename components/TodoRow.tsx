import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'nativewind';
import { useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import { formatDueDate, useTranslation } from '@/lib/i18n';
import { isOverdue, type Todo } from '@/lib/todos';

type TodoRowProps = {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
};

/**
 * One task in the list. Swiping left reveals Edit and Delete; the whole card is
 * still tappable to toggle the done state.
 */
export function TodoRow({ todo, onToggle, onEdit, onDelete }: TodoRowProps) {
  const { t, locale } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const swipeable = useRef<SwipeableMethods>(null);

  const overdue = isOverdue(todo);

  const toggle = () => {
    // A firmer tap when a task gets completed than when it is reopened.
    Haptics.impactAsync(
      todo.done
        ? Haptics.ImpactFeedbackStyle.Light
        : Haptics.ImpactFeedbackStyle.Medium
    );
    onToggle(todo);
  };

  const edit = () => {
    Haptics.selectionAsync();
    swipeable.current?.close();
    onEdit(todo);
  };

  const remove = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    swipeable.current?.close();
    onDelete(todo.id);
  };

  const renderRightActions = () => (
    <View className="flex-row items-stretch gap-2 pl-2">
      <Pressable
        onPress={edit}
        accessibilityRole="button"
        accessibilityLabel={t('edit')}
        className="w-16 items-center justify-center rounded-2xl bg-slate-200 active:opacity-70 dark:bg-slate-700">
        <Ionicons
          name="create-outline"
          size={22}
          color={isDark ? '#e2e8f0' : '#475569'}
        />
      </Pressable>
      <Pressable
        onPress={remove}
        accessibilityRole="button"
        accessibilityLabel={t('delete')}
        className="w-16 items-center justify-center rounded-2xl bg-red-500 active:opacity-70">
        <Ionicons name="trash-outline" size={22} color="#ffffff" />
      </Pressable>
    </View>
  );

  return (
    <ReanimatedSwipeable
      ref={swipeable}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={renderRightActions}>
      <Pressable
        onPress={toggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: todo.done }}
        className="flex-row items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm active:opacity-80 dark:border-slate-800 dark:bg-slate-900">
        <View
          className={`h-6 w-6 items-center justify-center rounded-lg border-2 ${
            todo.done
              ? 'border-indigo-500 bg-indigo-500'
              : 'border-slate-300 dark:border-slate-600'
          }`}>
          {todo.done && <Ionicons name="checkmark" size={16} color="#ffffff" />}
        </View>

        <View className="flex-1 gap-1">
          <Text
            className={`text-base ${
              todo.done
                ? 'text-slate-400 line-through dark:text-slate-600'
                : 'text-slate-900 dark:text-white'
            }`}>
            {todo.title}
          </Text>

          {todo.dueAt ? (
            <View className="flex-row items-center gap-1">
              <Ionicons
                name={overdue ? 'alert-circle-outline' : 'time-outline'}
                size={13}
                color={
                  overdue ? '#ef4444' : isDark ? '#64748b' : '#94a3b8'
                }
              />
              <Text
                className={`text-xs font-medium ${
                  overdue
                    ? 'text-red-500'
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                {formatDueDate(todo.dueAt, locale, t)}
                {overdue ? ` · ${t('overdue')}` : ''}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Affordance hinting that the row can be swiped. */}
        <Ionicons
          name="chevron-back"
          size={16}
          color={isDark ? '#334155' : '#cbd5e1'}
        />
      </Pressable>
    </ReanimatedSwipeable>
  );
}
