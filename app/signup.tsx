import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Logo } from '@/components/Logo';
import { useTranslation, type Locale } from '@/lib/i18n';

type Gender = 'male' | 'female';

type ErrorKey =
  | 'nameRequired'
  | 'birthdayRequired'
  | 'genderRequired'
  | 'contactRequired'
  | 'shortPassword'
  | null;

const TOTAL_STEPS = 3;
const GENDERS: Gender[] = ['male', 'female'];
const LOCALE_TAGS: Record<Locale, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  ko: 'ko-KR',
};

const inputClass =
  'rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[16px] leading-[20px] text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white';

export default function SignupScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t, locale } = useTranslation();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<number>(1);

  // Step 1
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // Step 2
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [gender, setGender] = useState<Gender | null>(null);
  // Step 3
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<ErrorKey>(null);

  const placeholderColor = isDark ? '#64748b' : '#9ca3af';

  const isValidContact = (value: string) => {
    const v = value.trim();
    const isEmail = /^\S+@\S+\.\S+$/.test(v);
    const isPhone = /^\+?[0-9][0-9\s-]{6,}$/.test(v);
    return isEmail || isPhone;
  };

  const validateStep = (): ErrorKey => {
    if (step === 1) {
      if (!firstName.trim() || !lastName.trim()) return 'nameRequired';
    } else if (step === 2) {
      if (!birthday) return 'birthdayRequired';
      if (!gender) return 'genderRequired';
    } else if (step === 3) {
      if (!isValidContact(contact)) return 'contactRequired';
      if (password.length < 6) return 'shortPassword';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      // Sign up complete → go to the app
      router.replace('/');
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) setStep((s) => s - 1);
    else router.back();
  };

  const onChangeDate = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'set' && selected) {
      setBirthday(selected);
      if (error === 'birthdayRequired') setError(null);
    }
  };

  const formattedBirthday = birthday
    ? birthday.toLocaleDateString(LOCALE_TAGS[locale], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : t('selectDate');

  const stepTitle =
    step === 1 ? t('step1Title') : step === 2 ? t('step2Title') : t('step3Title');

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
            {t('stepOf', { current: step, total: TOTAL_STEPS })}
          </Text>

          {/* Progress bars */}
          <View className="mt-4 flex-row gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < step
                    ? 'bg-indigo-500'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </View>
        </View>

        {/* Step content */}
        <View className="flex-1">
          <Text className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
            {stepTitle}
          </Text>

          {step === 1 && (
            <View className="gap-4">
              <TextInput
                className={inputClass}
                placeholder={t('firstName')}
                placeholderTextColor={placeholderColor}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                autoComplete="name-given"
              />
              <TextInput
                className={inputClass}
                placeholder={t('lastName')}
                placeholderTextColor={placeholderColor}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                autoComplete="name-family"
              />
            </View>
          )}

          {step === 2 && (
            <View className="gap-5">
              {/* Birthday */}
              <View className="gap-2">
                <Text className="ml-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {t('birthday')}
                </Text>
                <Pressable
                  onPress={() => setShowPicker((v) => !v)}
                  className="flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 active:opacity-70 dark:border-slate-700 dark:bg-slate-800">
                  <Text
                    className={`text-[16px] ${
                      birthday
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>
                    {formattedBirthday}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={isDark ? '#94a3b8' : '#64748b'}
                  />
                </Pressable>
                {showPicker && (
                  <DateTimePicker
                    value={birthday ?? new Date(2000, 0, 1)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    onChange={onChangeDate}
                    themeVariant={isDark ? 'dark' : 'light'}
                  />
                )}
              </View>

              {/* Gender */}
              <View className="gap-2">
                <Text className="ml-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {t('gender')}
                </Text>
                <View className="flex-row gap-2">
                  {GENDERS.map((g) => {
                    const active = gender === g;
                    return (
                      <Pressable
                        key={g}
                        onPress={() => {
                          setGender(g);
                          if (error === 'genderRequired') setError(null);
                        }}
                        className={`flex-1 items-center rounded-2xl border py-3.5 active:opacity-70 ${
                          active
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
                        }`}>
                        <Text
                          className={`text-[15px] font-semibold ${
                            active
                              ? 'text-white'
                              : 'text-slate-700 dark:text-slate-200'
                          }`}>
                          {t(g)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {step === 3 && (
            <View className="gap-4">
              <TextInput
                className={inputClass}
                placeholder={t('emailOrPhone')}
                placeholderTextColor={placeholderColor}
                value={contact}
                onChangeText={setContact}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
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
          )}

          {error ? (
            <Text className="ml-1 mt-3 text-sm font-medium text-red-500">
              {t(error)}
            </Text>
          ) : null}
        </View>

        {/* Actions */}
        <View className="mb-4 mt-6 flex-row gap-3">
          <Pressable
            onPress={handleBack}
            className="h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white active:opacity-70 dark:border-slate-700 dark:bg-slate-800">
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? '#e2e8f0' : '#475569'}
            />
          </Pressable>
          <Pressable
            onPress={handleNext}
            className="h-14 flex-1 items-center justify-center rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/30 active:opacity-80">
            <Text className="text-base font-bold text-white">
              {step < TOTAL_STEPS ? t('next') : t('signUp')}
            </Text>
          </Pressable>
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
