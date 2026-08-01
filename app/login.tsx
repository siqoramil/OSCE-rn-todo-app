import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { GoogleButton, OrDivider } from '@/components/GoogleButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Logo } from '@/components/Logo';
import { googleErrorKey, isGoogleConfigured } from '@/lib/google-auth';
import { useTranslation } from '@/lib/i18n';
import { authErrorKey, useUser } from '@/lib/user';
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

type ErrorKey = string | null;

export default function LoginScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const { signIn, signInWithGoogle } = useUser();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<ErrorKey>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [googleSubmitting, setGoogleSubmitting] = useState<boolean>(false);

  const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

  const submit = async () => {
    if (!isValidEmail(email.trim())) {
      setError('invalidEmail');
      return;
    }
    if (password.length < 6) {
      setError('shortPassword');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      // Navigation is handled by the auth gate in _layout once the user is set.
    } catch (e) {
      setError(authErrorKey(e));
    } finally {
      setSubmitting(false);
    }
  };

  const submitGoogle = async () => {
    if (!isGoogleConfigured()) {
      setError('googleNotConfigured');
      return;
    }
    setError(null);
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      // The auth gate in _layout navigates once the user is set.
    } catch (e) {
      const key = googleErrorKey(e);
      // Backing out of the account picker isn't an error worth showing.
      setError(key === 'googleCancelled' ? null : key);
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Language + theme toggles pinned top-right, below the safe area */}
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
          {/* Brand */}
          <View className="mb-10 items-center">
            <View className="mb-4 shadow-lg shadow-indigo-500/40">
              <Logo size={84} />
            </View>
            <Text className="text-4xl font-extrabold tracking-widest text-slate-900 dark:text-white">
              OSCE-Todo
            </Text>
            <Text className="mt-2 text-base font-medium text-slate-400 dark:text-slate-500">
              {t('welcome')}
            </Text>
          </View>

          {/* Form */}
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
            />

            <View className="justify-center">
              <TextInput
                className="rounded-2xl border border-slate-200 bg-white py-3.5 pl-4 pr-12 text-[16px] leading-[20px] text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder={t('password')}
                placeholderTextColor={isDark ? '#64748b' : '#9ca3af'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                onSubmitEditing={submit}
                returnKeyType="go"
              />
              <Pressable
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={8}
                className="absolute right-4">
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={isDark ? '#94a3b8' : '#64748b'}
                />
              </Pressable>
            </View>

            <Pressable
              onPress={() => router.push('/forgot-password')}
              hitSlop={8}
              className="-mt-1 self-end">
              <Text className="text-sm font-semibold text-indigo-500">
                {t('forgotPassword')}
              </Text>
            </Pressable>

            {error ? (
              <Text className="ml-1 text-sm font-medium text-red-500">
                {t(error)}
              </Text>
            ) : null}

            <Pressable
              onPress={submit}
              disabled={submitting || googleSubmitting}
              className="mt-2 h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/30 active:opacity-80 disabled:opacity-60">
              {submitting && <ActivityIndicator size="small" color="#ffffff" />}
              <Text className="text-base font-bold text-white">
                {t('signIn')}
              </Text>
            </Pressable>

            <OrDivider label={t('or')} />

            <GoogleButton
              label={t('continueWithGoogle')}
              onPress={submitGoogle}
              loading={googleSubmitting}
              disabled={submitting}
            />

            <View className="mt-2 flex-row justify-center gap-1">
              <Text className="text-sm text-slate-400 dark:text-slate-500">
                {t('noAccount')}
              </Text>
              <Pressable onPress={() => router.push('/signup')} hitSlop={8}>
                <Text className="text-sm font-semibold text-indigo-500">
                  {t('signUp')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
