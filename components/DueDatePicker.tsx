import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import { formatDueDate, useTranslation } from '@/lib/i18n';

type DueDatePickerProps = {
  value: Date | null;
  onChange: (value: Date | null) => void;
};

/** Default deadline offered when the user has not picked one yet: today 18:00. */
function defaultDue(): Date {
  const date = new Date();
  date.setHours(18, 0, 0, 0);
  return date;
}

/**
 * Chip that opens a date + time picker and shows the chosen deadline.
 *
 * The two platforms need different APIs: Android opens a modal dialog through
 * the imperative `DateTimePickerAndroid` (date first, then time), while iOS
 * renders the picker inline, so we host it in our own modal with a Done button.
 */
export function DueDatePicker({ value, onChange }: DueDatePickerProps) {
  const { t, locale } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  // iOS only: the modal's working copy, committed when the user taps Done.
  const [iosDraft, setIosDraft] = useState<Date | null>(null);

  // Normally you cannot pick a past deadline, but an existing overdue task must
  // still be editable — otherwise the picker would clamp and silently move it.
  const minimumDate = value && value < new Date() ? value : new Date();

  const openAndroid = () => {
    const initial = value ?? defaultDue();

    DateTimePickerAndroid.open({
      value: initial,
      mode: 'date',
      minimumDate,
      onChange: (event: DateTimePickerEvent, pickedDate?: Date) => {
        if (event.type !== 'set' || !pickedDate) return;

        // Chain into the time picker so the deadline has an hour, not just a day.
        DateTimePickerAndroid.open({
          value: pickedDate,
          mode: 'time',
          is24Hour: true,
          onChange: (timeEvent: DateTimePickerEvent, pickedTime?: Date) => {
            if (timeEvent.type !== 'set' || !pickedTime) return;
            const combined = new Date(pickedDate);
            combined.setHours(pickedTime.getHours(), pickedTime.getMinutes(), 0, 0);
            onChange(combined);
          },
        });
      },
    });
  };

  const open = () => {
    Haptics.selectionAsync();
    if (Platform.OS === 'android') {
      openAndroid();
    } else {
      setIosDraft(value ?? defaultDue());
    }
  };

  const clear = () => {
    Haptics.selectionAsync();
    onChange(null);
  };

  return (
    <>
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={open}
          hitSlop={6}
          accessibilityRole="button"
          className={`flex-row items-center gap-1.5 rounded-xl border px-3 py-2 active:opacity-70 ${
            value
              ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950'
              : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
          }`}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={value ? '#6366f1' : isDark ? '#94a3b8' : '#64748b'}
          />
          <Text
            className={`text-xs font-semibold ${
              value
                ? 'text-indigo-600 dark:text-indigo-300'
                : 'text-slate-500 dark:text-slate-400'
            }`}>
            {value ? formatDueDate(value, locale, t) : t('noDueDate')}
          </Text>
        </Pressable>

        {value ? (
          <Pressable onPress={clear} hitSlop={8} accessibilityRole="button">
            <Ionicons
              name="close-circle"
              size={18}
              color={isDark ? '#64748b' : '#94a3b8'}
            />
          </Pressable>
        ) : null}
      </View>

      {/* iOS picker lives in a sheet; Android uses its own native dialog. */}
      {Platform.OS === 'ios' && iosDraft !== null ? (
        <Modal
          transparent
          animationType="slide"
          onRequestClose={() => setIosDraft(null)}>
          <Pressable
            className="flex-1 justify-end bg-black/40"
            onPress={() => setIosDraft(null)}>
            {/* Swallow taps inside the sheet so they don't dismiss it. */}
            <Pressable
              onPress={(event) => event.stopPropagation()}
              className="rounded-t-3xl bg-white pb-8 dark:bg-slate-900">
              <View className="flex-row items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-slate-800">
                <Pressable onPress={() => setIosDraft(null)} hitSlop={8}>
                  <Text className="text-base font-medium text-slate-500 dark:text-slate-400">
                    {t('cancel')}
                  </Text>
                </Pressable>
                <Text className="text-base font-bold text-slate-900 dark:text-white">
                  {t('dueDate')}
                </Text>
                <Pressable
                  onPress={() => {
                    onChange(iosDraft);
                    setIosDraft(null);
                  }}
                  hitSlop={8}>
                  <Text className="text-base font-bold text-indigo-500">
                    {t('confirm')}
                  </Text>
                </Pressable>
              </View>

              <DateTimePicker
                value={iosDraft}
                mode="datetime"
                display="spinner"
                minimumDate={minimumDate}
                themeVariant={isDark ? 'dark' : 'light'}
                onChange={(_event, picked) => {
                  if (picked) setIosDraft(picked);
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </>
  );
}
