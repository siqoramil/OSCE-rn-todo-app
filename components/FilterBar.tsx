import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'nativewind';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from '@/lib/i18n';

export type TodoFilter = 'all' | 'active' | 'done';

export const TODO_FILTERS: TodoFilter[] = ['all', 'active', 'done'];

const FILTER_LABELS: Record<TodoFilter, string> = {
  all: 'filterAll',
  active: 'filterActive',
  done: 'filterDone',
};

type FilterBarProps = {
  filter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  search: string;
  onSearchChange: (search: string) => void;
  counts: Record<TodoFilter, number>;
};

/** Search field plus a segmented All / Active / Done control. */
export function FilterBar({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  counts,
}: FilterBarProps) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const select = (next: TodoFilter) => {
    if (next === filter) return;
    Haptics.selectionAsync();
    onFilterChange(next);
  };

  return (
    <View className="gap-3">
      {/* Search */}
      <View className="flex-row items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 dark:border-slate-700 dark:bg-slate-800">
        <Ionicons
          name="search-outline"
          size={18}
          color={isDark ? '#64748b' : '#9ca3af'}
        />
        <TextInput
          className="flex-1 py-3 text-[15px] leading-[19px] text-slate-900 dark:text-white"
          placeholder={t('searchTasks')}
          placeholderTextColor={isDark ? '#64748b' : '#9ca3af'}
          value={search}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {/* clearButtonMode is iOS-only, so Android gets an explicit button. */}
        {Platform.OS !== 'ios' && search.length > 0 ? (
          <Pressable onPress={() => onSearchChange('')} hitSlop={8}>
            <Ionicons
              name="close-circle"
              size={18}
              color={isDark ? '#64748b' : '#9ca3af'}
            />
          </Pressable>
        ) : null}
      </View>

      {/* Segmented filter */}
      <View className="flex-row gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
        {TODO_FILTERS.map((option) => {
          const active = option === filter;
          return (
            <Pressable
              key={option}
              onPress={() => select(option)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              // `shadow-none` on the inactive branch is deliberate: Tailwind's
              // shadow utilities set a CSS variable, and NativeWind must know
              // about it on the *first* render. Letting a chip gain its first
              // variable on selection triggers a css-interop remount warning.
              className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2 ${
                active ? 'bg-white shadow-sm dark:bg-slate-700' : 'shadow-none'
              }`}>
              <Text
                className={`text-sm font-semibold ${
                  active
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                {t(FILTER_LABELS[option])}
              </Text>
              <Text
                className={`text-xs font-bold ${
                  active
                    ? 'text-indigo-500'
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                {counts[option]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
