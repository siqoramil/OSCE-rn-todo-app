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
    stepOf: 'Step %{current} of %{total}',
    next: 'Next',
    back: 'Back',
    step1Title: 'What is your name?',
    step2Title: 'Tell us about yourself',
    step3Title: 'Set up your login',
    firstName: 'First name',
    lastName: 'Last name',
    birthday: 'Date of birth',
    selectDate: 'Select date',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    emailOrPhone: 'Email or phone number',
    alreadyHaveAccount: 'Already have an account?',
    nameRequired: 'Enter your first and last name',
    birthdayRequired: 'Select your date of birth',
    genderRequired: 'Select your gender',
    contactRequired: 'Enter a valid email or phone number',
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
    stepOf: 'Шаг %{current} из %{total}',
    next: 'Далее',
    back: 'Назад',
    step1Title: 'Как вас зовут?',
    step2Title: 'Расскажите о себе',
    step3Title: 'Настройте вход',
    firstName: 'Имя',
    lastName: 'Фамилия',
    birthday: 'Дата рождения',
    selectDate: 'Выберите дату',
    gender: 'Пол',
    male: 'Мужской',
    female: 'Женский',
    other: 'Другое',
    emailOrPhone: 'Email или номер телефона',
    alreadyHaveAccount: 'Уже есть аккаунт?',
    nameRequired: 'Введите имя и фамилию',
    birthdayRequired: 'Выберите дату рождения',
    genderRequired: 'Выберите пол',
    contactRequired: 'Введите корректный email или номер телефона',
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
    stepOf: '%{total}단계 중 %{current}단계',
    next: '다음',
    back: '뒤로',
    step1Title: '이름이 무엇인가요?',
    step2Title: '자신에 대해 알려주세요',
    step3Title: '로그인 정보 설정',
    firstName: '이름',
    lastName: '성',
    birthday: '생년월일',
    selectDate: '날짜 선택',
    gender: '성별',
    male: '남성',
    female: '여성',
    other: '기타',
    emailOrPhone: '이메일 또는 전화번호',
    alreadyHaveAccount: '이미 계정이 있으신가요?',
    nameRequired: '이름과 성을 입력하세요',
    birthdayRequired: '생년월일을 선택하세요',
    genderRequired: '성별을 선택하세요',
    contactRequired: '올바른 이메일 또는 전화번호를 입력하세요',
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
