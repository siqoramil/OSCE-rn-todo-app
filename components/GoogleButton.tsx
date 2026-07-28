import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/** The official four-colour Google "G". */
function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <Path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <Path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <Path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </Svg>
  );
}

type GoogleButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function GoogleButton({
  label,
  onPress,
  loading = false,
  disabled = false,
}: GoogleButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      className="h-14 flex-row items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white active:opacity-80 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800">
      {loading ? <ActivityIndicator size="small" color="#6366f1" /> : <GoogleG />}
      <Text className="text-base font-bold text-slate-700 dark:text-slate-100">
        {label}
      </Text>
    </Pressable>
  );
}

/** Thin "or" rule used to separate the email form from the Google button. */
export function OrDivider({ label }: { label: string }) {
  return (
    <View className="my-1 flex-row items-center gap-3">
      <View className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      <Text className="text-xs font-medium uppercase text-slate-400 dark:text-slate-500">
        {label}
      </Text>
      <View className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
    </View>
  );
}
