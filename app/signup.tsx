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
import { GoogleButton, OrDivider } from '@/components/GoogleButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Logo } from '@/components/Logo';
import { googleErrorKey, isGoogleConfigured } from '@/lib/google-auth';
import { useTranslation } from '@/lib/i18n';
import { authErrorKey, useUser } from '@/lib/user';

type ErrorKey = string | null;

const inputClass =
  'rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[16px] leading-[20px] text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white';

export default function SignupScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const { signUp, signInWithGoogle } = useUser();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<ErrorKey>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const placeholderColor = isDark ? '#64748b' : '#9ca3af';

  const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());

  const validate = (): ErrorKey => {
    if (!fullName.trim()) return 'nameRequired';
    if (!isValidEmail(email)) return 'invalidEmail';
    if (password.length < 6) return 'shortPassword';
    return null;
  };

  const handleSignUp = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signUp(fullName, email, password);
      // Navigation is handled by the auth gate in _layout once the user is set.
    } catch (e) {
      setError(authErrorKey(e));
    } finally {
      setSubmitting(false);
    }
  };

  // Google has no separate "sign up" — the first sign-in creates the account.
  const handleGoogle = async () => {
    if (!isGoogleConfigured()) {
      setError('googleNotConfigured');
      return;
    }
    setError(null);
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      const key = googleErrorKey(e);
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
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mt-14 mb-6">
          <View className="mb-4 self-start shadow-lg shadow-indigo-500/40">
            <Logo size={56} />
          </View>
          <Text className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t('createAccount')}
          </Text>
          <Text className="mt-1 text-sm font-medium text-slate-400 dark:text-slate-500">
            {t('createAccountSubtitle')}
          </Text>
        </View>

        {/* Form */}
        <View className="flex-1">
          <View className="gap-4">
            <TextInput
              className={inputClass}
              placeholder={t('fullName')}
              placeholderTextColor={placeholderColor}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoComplete="name"
            />
            <TextInput
              className={inputClass}
              placeholder={t('email')}
              placeholderTextColor={placeholderColor}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
            />
            <View className="justify-center">
              <TextInput
                className="rounded-2xl border border-slate-200 bg-white py-3.5 pl-4 pr-12 text-[16px] leading-[20px] text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder={t('password')}
                placeholderTextColor={placeholderColor}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="new-password"
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={8}
                className="absolute right-4">
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={isDark ? '#94a3b8' : '#64748b'}
                />
              </Pressable>
            </View>
          </View>

          {error ? (
            <Text className="ml-1 mt-3 text-sm font-medium text-red-500">
              {t(error)}
            </Text>
          ) : null}
        </View>

        {/* Action */}
        <View className="mb-4 mt-6 gap-4">
          <Pressable
            onPress={handleSignUp}
            disabled={submitting || googleSubmitting}
            className="h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/30 active:opacity-80 disabled:opacity-60">
            {submitting && <ActivityIndicator size="small" color="#ffffff" />}
            <Text className="text-base font-bold text-white">{t('signUp')}</Text>
          </Pressable>

          <OrDivider label={t('or')} />

          <GoogleButton
            label={t('continueWithGoogle')}
            onPress={handleGoogle}
            loading={googleSubmitting}
            disabled={submitting}
          />
        </View>

        {/* Sign in link */}
        <View className="mb-2 flex-row justify-center gap-1">
          <Text className="text-sm text-slate-400 dark:text-slate-500">
            {t('alreadyHaveAccount')}
          </Text>
          <Pressable onPress={() => router.replace('/login')} hitSlop={8}>
            <Text className="text-sm font-semibold text-indigo-500">
              {t('signIn')}
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
