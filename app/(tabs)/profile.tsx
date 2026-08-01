import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useMemo } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  useTranslation,
  type Locale,
} from '@/lib/i18n';
import { isOverdue, useTodos } from '@/lib/todos';
import { useUser } from '@/lib/user';

/** "Ramil Kamalov" → "RK", used as the avatar fallback. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: 'default' | 'danger';
}) {
  return (
    <View className="flex-1 items-center rounded-2xl border border-slate-100 bg-white py-4 dark:border-slate-800 dark:bg-slate-900">
      <Text
        className={`text-2xl font-extrabold ${
          tone === 'danger' ? 'text-red-500' : 'text-slate-900 dark:text-white'
        }`}>
        {value}
      </Text>
      <Text className="mt-0.5 text-xs font-medium text-slate-400 dark:text-slate-500">
        {label}
      </Text>
    </View>
  );
}

// NativeWind has no `last:` variant, so the divider is opted into explicitly.
function Row({
  children,
  divider = true,
}: {
  children: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3.5 ${
        divider ? 'border-b border-slate-100 dark:border-slate-800' : ''
      }`}>
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const { t, locale, setLocale } = useTranslation();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, signOut } = useUser();
  const { todos } = useTodos(user?.uid);

  const stats = useMemo(
    () => ({
      total: todos.length,
      active: todos.filter((item) => !item.done).length,
      done: todos.filter((item) => item.done).length,
      overdue: todos.filter((item) => isOverdue(item)).length,
    }),
    [todos]
  );

  const handleSignOut = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await signOut();
    router.replace('/login');
  };

  const pickLocale = (next: Locale) => {
    if (next === locale) return;
    Haptics.selectionAsync();
    setLocale(next);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-slate-50 dark:bg-slate-950"
      edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        {/* Identity */}
        <View className="items-center gap-3 pt-2">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/40">
            <Text className="text-2xl font-extrabold text-white">
              {initials(user?.fullName ?? '')}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {user?.fullName || '—'}
            </Text>
            <Text className="mt-0.5 text-sm font-medium text-slate-400 dark:text-slate-500">
              {user?.email ?? '—'}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="gap-2">
          <Text className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('account')}
          </Text>
          <View className="flex-row gap-2">
            <StatTile label={t('statTotal')} value={stats.total} />
            <StatTile label={t('statActive')} value={stats.active} />
            <StatTile label={t('statDone')} value={stats.done} />
            <StatTile
              label={t('statOverdue')}
              value={stats.overdue}
              tone="danger"
            />
          </View>
        </View>

        {/* Settings */}
        <View className="gap-2">
          <Text className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('settings')}
          </Text>
          <View className="overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
            <Row>
              <View className="flex-row items-center gap-3">
                <Ionicons
                  name="moon-outline"
                  size={20}
                  color={isDark ? '#94a3b8' : '#64748b'}
                />
                <Text className="text-base font-medium text-slate-900 dark:text-white">
                  {t('darkMode')}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={(next) => {
                  Haptics.selectionAsync();
                  setColorScheme(next ? 'dark' : 'light');
                }}
                trackColor={{ false: '#cbd5e1', true: '#6366f1' }}
                thumbColor="#ffffff"
              />
            </Row>

            <Row divider={false}>
              <View className="flex-row items-center gap-3">
                <Ionicons
                  name="language-outline"
                  size={20}
                  color={isDark ? '#94a3b8' : '#64748b'}
                />
                <Text className="text-base font-medium text-slate-900 dark:text-white">
                  {t('language')}
                </Text>
              </View>
              <View className="flex-row gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                {SUPPORTED_LOCALES.map((option) => {
                  const active = option === locale;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => pickLocale(option)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      // See FilterBar: the inactive branch keeps `shadow-none`
                      // so the shadow CSS variable exists from the first render.
                      className={`rounded-lg px-3 py-1.5 ${
                        active
                          ? 'bg-white shadow-sm dark:bg-slate-700'
                          : 'shadow-none'
                      }`}>
                      <Text
                        className={`text-xs font-bold ${
                          active
                            ? 'text-indigo-500'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}>
                        {LOCALE_LABELS[option]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Row>
          </View>
        </View>

        {/* Sign out */}
        <Pressable
          onPress={handleSignOut}
          className="h-14 flex-row items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white active:opacity-70 dark:border-red-900 dark:bg-slate-900">
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text className="text-base font-bold text-red-500">
            {t('signOut')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
