import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Locale = 'en' | 'ru' | 'ko';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'ru', 'ko'];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  ru: 'RU',
  ko: 'KO',
};

export const translations = {
  en: {
    welcome: 'Welcome, sign in to continue',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    invalidEmail: 'Enter a valid email',
    shortPassword: 'Password must be at least 6 characters',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    tasksLeft: '%{count} tasks left',
    allDone: 'All done',
    whatToDo: 'What needs doing?',
    add: 'Add',
    save: 'Save',
    emptyList: 'No tasks yet. Add one above.',
    createAccount: 'Create account',
    createAccountSubtitle: 'Enter your details to get started',
    fullName: 'Full name',
    alreadyHaveAccount: 'Already have an account?',
    nameRequired: 'Enter your full name',
    emailInUse: 'This email is already registered',
    wrongCredentials: 'Wrong email or password',
    networkError: 'Network error. Check your connection.',
    genericError: 'Something went wrong. Try again.',
    loadingTasks: 'Loading tasks…',
  },
  ru: {
    welcome: 'Добро пожаловать, войдите чтобы продолжить',
    email: 'Эл. почта',
    password: 'Пароль',
    signIn: 'Войти',
    invalidEmail: 'Введите корректный email',
    shortPassword: 'Пароль должен быть не менее 6 символов',
    noAccount: 'Нет аккаунта?',
    signUp: 'Регистрация',
    tasksLeft: 'Осталось задач: %{count}',
    allDone: 'Всё выполнено',
    whatToDo: 'Что нужно сделать?',
    add: 'Добавить',
    save: 'Сохранить',
    emptyList: 'Пока нет задач. Добавьте выше.',
    createAccount: 'Создать аккаунт',
    createAccountSubtitle: 'Введите ваши данные, чтобы начать',
    fullName: 'Полное имя',
    alreadyHaveAccount: 'Уже есть аккаунт?',
    nameRequired: 'Введите ваше полное имя',
    emailInUse: 'Этот email уже зарегистрирован',
    wrongCredentials: 'Неверный email или пароль',
    networkError: 'Ошибка сети. Проверьте подключение.',
    genericError: 'Что-то пошло не так. Попробуйте снова.',
    loadingTasks: 'Загрузка задач…',
  },
  ko: {
    welcome: '환영합니다, 계속하려면 로그인하세요',
    email: '이메일',
    password: '비밀번호',
    signIn: '로그인',
    invalidEmail: '올바른 이메일을 입력하세요',
    shortPassword: '비밀번호는 최소 6자 이상이어야 합니다',
    noAccount: '계정이 없으신가요?',
    signUp: '회원가입',
    tasksLeft: '남은 작업 %{count}개',
    allDone: '모두 완료',
    whatToDo: '무엇을 해야 하나요?',
    add: '추가',
    save: '저장',
    emptyList: '아직 작업이 없습니다. 위에서 추가하세요.',
    createAccount: '계정 만들기',
    createAccountSubtitle: '시작하려면 정보를 입력하세요',
    fullName: '전체 이름',
    alreadyHaveAccount: '이미 계정이 있으신가요?',
    nameRequired: '전체 이름을 입력하세요',
    emailInUse: '이미 등록된 이메일입니다',
    wrongCredentials: '이메일 또는 비밀번호가 잘못되었습니다',
    networkError: '네트워크 오류입니다. 연결을 확인하세요.',
    genericError: '문제가 발생했습니다. 다시 시도하세요.',
    loadingTasks: '작업 불러오는 중…',
  },
};

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

function detectInitialLocale(): Locale {
  const deviceCode = getLocales()[0]?.languageCode as Locale | undefined;
  return deviceCode && SUPPORTED_LOCALES.includes(deviceCode)
    ? deviceCode
    : 'en';
}

type TranslateOptions = Record<string, unknown>;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, options?: TranslateOptions) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(detectInitialLocale);

  const value = useMemo<I18nContextValue>(() => {
    i18n.locale = locale;
    return {
      locale,
      setLocale,
      t: (key, options) => {
        i18n.locale = locale;
        return i18n.t(key, options);
      },
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return ctx;
}
