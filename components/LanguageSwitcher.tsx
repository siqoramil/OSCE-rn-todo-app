import { Pressable, Text } from 'react-native';
import { LOCALE_LABELS, SUPPORTED_LOCALES, useTranslation } from '@/lib/i18n';

/**
 * Compact button that cycles through the supported languages
 * (EN → RU → KO) and shows the active one.
 */
export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  const cycle = () => {
    const index = SUPPORTED_LOCALES.indexOf(locale);
    setLocale(SUPPORTED_LOCALES[(index + 1) % SUPPORTED_LOCALES.length]);
  };

  return (
    <Pressable
      onPress={cycle}
      hitSlop={8}
      className="h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white active:opacity-70 dark:border-slate-700 dark:bg-slate-800">
      <Text className="text-xs font-bold text-slate-700 dark:text-slate-200">
        {LOCALE_LABELS[locale]}
      </Text>
    </Pressable>
  );
}
