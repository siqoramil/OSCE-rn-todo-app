import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { I18nProvider } from '@/lib/i18n';
import { UserProvider, useUser } from '@/lib/user';

export const unstable_settings = {
  initialRouteName: 'login',
};

const AUTH_ROUTES = ['login', 'signup'];

// Redirect based on auth state: signed-out users are kept on login/signup,
// signed-in users are pushed into the app.
function useProtectedRoute() {
  const { user, initializing } = useUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;

    const onAuthScreen = AUTH_ROUTES.includes(segments[0] as string);

    if (!user && !onAuthScreen) {
      router.replace('/login');
    } else if (user && onAuthScreen) {
      router.replace('/');
    }
  }, [user, initializing, segments, router]);

  return initializing;
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const initializing = useProtectedRoute();

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="index" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <I18nProvider>
        <UserProvider>
          <RootNavigator />
        </UserProvider>
      </I18nProvider>
    </KeyboardProvider>
  );
}
