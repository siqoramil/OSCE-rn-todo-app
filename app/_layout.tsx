import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { I18nProvider } from '@/lib/i18n';
import { UserProvider } from '@/lib/user';

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <KeyboardProvider>
      <I18nProvider>
        <UserProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="login" />
              <Stack.Screen name="signup" />
              <Stack.Screen name="index" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </UserProvider>
      </I18nProvider>
    </KeyboardProvider>
  );
}
