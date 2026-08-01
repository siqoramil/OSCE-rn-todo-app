import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Logo } from '@/components/Logo';
import { useTranslation } from '@/lib/i18n';
import { authErrorKey, useUser } from '@/lib/user';

export default function ForgotPasswordScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const { resetPassword } = useUser();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());

  const submit = async () => {
    if (!isValidEmail(email)) {
      setError('invalidEmail');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (e) {
      setError(authErrorKey(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View
        style={{ top: insets.top + 8 }}
        className="absolute right-6 z-10 flex-row items-center gap-2">
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
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View>
          <View className="mb-10 items-center">
            <View className="mb-4 shadow-lg shadow-indigo-500/40">
              <Logo size={72} />
            </View>
            <Text className="text-3xl font-extrabold tracking-wide text-slate-900 dark:text-white">
              {t('resetPassword')}
            </Text>
            <Text className="mt-2 text-center text-base font-medium text-slate-400 dark:text-slate-500">
              {t('resetPasswordSubtitle')}
            </Text>
          </View>

          {sent ? (
            <View className="gap-4">
              <View className="flex-row items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950">
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color={isDark ? '#6ee7b7' : '#059669'}
                />
                <Text className="flex-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  {t('resetEmailSent')}
                </Text>
              </View>
              <Pressable
                onPress={() => router.replace('/login')}
                className="h-14 items-center justify-center rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/30 active:opacity-80">
                <Text className="text-base font-bold text-white">
                  {t('backToSignIn')}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="gap-4">
              <TextInput
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[16px] leading-[20px] text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder={t('email')}
                placeholderTextColor={isDark ? '#64748b' : '#9ca3af'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                onSubmitEditing={submit}
                returnKeyType="go"
              />

              {error ? (
                <Text className="ml-1 text-sm font-medium text-red-500">
                  {t(error)}
                </Text>
              ) : null}

              <Pressable
                onPress={submit}
                disabled={submitting}
                className="mt-2 h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/30 active:opacity-80 disabled:opacity-60">
                {submitting && (
                  <ActivityIndicator size="small" color="#ffffff" />
                )}
                <Text className="text-base font-bold text-white">
                  {t('sendResetLink')}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.back()}
                hitSlop={8}
                className="mt-2 items-center">
                <Text className="text-sm font-semibold text-indigo-500">
                  {t('backToSignIn')}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
