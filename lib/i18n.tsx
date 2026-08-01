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
    or: 'or',
    continueWithGoogle: 'Continue with Google',
    googleCancelled: 'Google sign-in was cancelled',
    signInInProgress: 'Sign-in is already in progress',
    playServicesMissing: 'Google Play Services is unavailable',
    googleNeedsDevBuild:
      'Google sign-in needs a development build — it does not work in Expo Go.',
    googleNotConfigured: 'Google sign-in is not configured yet',
    // Due dates
    dueDate: 'Due date',
    noDueDate: 'No due date',
    dueToday: 'Today',
    dueTomorrow: 'Tomorrow',
    dueYesterday: 'Yesterday',
    overdue: 'Overdue',
    clear: 'Clear',
    cancel: 'Cancel',
    confirm: 'Done',
    // Filter + search
    filterAll: 'All',
    filterActive: 'Active',
    filterDone: 'Done',
    searchTasks: 'Search tasks…',
    noMatches: 'Nothing matches your search.',
    nothingActive: 'No active tasks. Nice work.',
    nothingDone: 'No completed tasks yet.',
    // Swipe hint
    delete: 'Delete',
    edit: 'Edit',
    // Tabs + profile
    tabTasks: 'Tasks',
    tabProfile: 'Profile',
    account: 'Account',
    settings: 'Settings',
    signOut: 'Sign out',
    statTotal: 'Total',
    statActive: 'Active',
    statDone: 'Done',
    statOverdue: 'Overdue',
    darkMode: 'Dark mode',
    language: 'Language',
    // Password reset
    forgotPassword: 'Forgot password?',
    resetPassword: 'Reset password',
    resetPasswordSubtitle:
      'Enter your email and we will send you a reset link.',
    sendResetLink: 'Send reset link',
    resetEmailSent:
      'If an account exists for that email, a reset link is on its way.',
    backToSignIn: 'Back to sign in',
    tooManyRequests: 'Too many attempts. Try again later.',
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
    or: 'или',
    continueWithGoogle: 'Продолжить с Google',
    googleCancelled: 'Вход через Google отменён',
    signInInProgress: 'Вход уже выполняется',
    playServicesMissing: 'Google Play Services недоступны',
    googleNeedsDevBuild:
      'Для входа через Google нужен development build — в Expo Go не работает.',
    googleNotConfigured: 'Вход через Google ещё не настроен',
    // Due dates
    dueDate: 'Срок',
    noDueDate: 'Без срока',
    dueToday: 'Сегодня',
    dueTomorrow: 'Завтра',
    dueYesterday: 'Вчера',
    overdue: 'Просрочено',
    clear: 'Убрать',
    cancel: 'Отмена',
    confirm: 'Готово',
    // Filter + search
    filterAll: 'Все',
    filterActive: 'Активные',
    filterDone: 'Готовые',
    searchTasks: 'Поиск задач…',
    noMatches: 'Ничего не найдено.',
    nothingActive: 'Активных задач нет. Отлично.',
    nothingDone: 'Выполненных задач пока нет.',
    // Swipe hint
    delete: 'Удалить',
    edit: 'Изменить',
    // Tabs + profile
    tabTasks: 'Задачи',
    tabProfile: 'Профиль',
    account: 'Аккаунт',
    settings: 'Настройки',
    signOut: 'Выйти',
    statTotal: 'Всего',
    statActive: 'Активные',
    statDone: 'Готовые',
    statOverdue: 'Просрочено',
    darkMode: 'Тёмная тема',
    language: 'Язык',
    // Password reset
    forgotPassword: 'Забыли пароль?',
    resetPassword: 'Сброс пароля',
    resetPasswordSubtitle:
      'Введите email — мы отправим ссылку для сброса пароля.',
    sendResetLink: 'Отправить ссылку',
    resetEmailSent:
      'Если аккаунт с таким email существует, ссылка уже отправлена.',
    backToSignIn: 'Вернуться ко входу',
    tooManyRequests: 'Слишком много попыток. Попробуйте позже.',
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
    or: '또는',
    continueWithGoogle: 'Google로 계속하기',
    googleCancelled: 'Google 로그인이 취소되었습니다',
    signInInProgress: '이미 로그인이 진행 중입니다',
    playServicesMissing: 'Google Play 서비스를 사용할 수 없습니다',
    googleNeedsDevBuild:
      'Google 로그인은 development build가 필요합니다 — Expo Go에서는 작동하지 않습니다.',
    googleNotConfigured: 'Google 로그인이 아직 설정되지 않았습니다',
    // Due dates
    dueDate: '마감일',
    noDueDate: '마감일 없음',
    dueToday: '오늘',
    dueTomorrow: '내일',
    dueYesterday: '어제',
    overdue: '기한 초과',
    clear: '지우기',
    cancel: '취소',
    confirm: '완료',
    // Filter + search
    filterAll: '전체',
    filterActive: '진행 중',
    filterDone: '완료',
    searchTasks: '작업 검색…',
    noMatches: '검색 결과가 없습니다.',
    nothingActive: '진행 중인 작업이 없습니다. 훌륭해요.',
    nothingDone: '완료된 작업이 아직 없습니다.',
    // Swipe hint
    delete: '삭제',
    edit: '수정',
    // Tabs + profile
    tabTasks: '작업',
    tabProfile: '프로필',
    account: '계정',
    settings: '설정',
    signOut: '로그아웃',
    statTotal: '전체',
    statActive: '진행 중',
    statDone: '완료',
    statOverdue: '기한 초과',
    darkMode: '다크 모드',
    language: '언어',
    // Password reset
    forgotPassword: '비밀번호를 잊으셨나요?',
    resetPassword: '비밀번호 재설정',
    resetPasswordSubtitle: '이메일을 입력하면 재설정 링크를 보내드립니다.',
    sendResetLink: '재설정 링크 보내기',
    resetEmailSent:
      '해당 이메일로 등록된 계정이 있다면 재설정 링크가 발송됩니다.',
    backToSignIn: '로그인으로 돌아가기',
    tooManyRequests: '시도가 너무 많습니다. 나중에 다시 시도하세요.',
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

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Human-friendly due date: "Today 14:30" for the days around now, otherwise a
 * locale-formatted date. `t` and `locale` come from `useTranslation`.
 */
export function formatDueDate(
  date: Date,
  locale: Locale,
  t: (key: string, options?: TranslateOptions) => string
): string {
  const time = date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const dayDiff = Math.round(
    (startOfDay(date) - startOfDay(new Date())) / 86_400_000
  );

  if (dayDiff === 0) return `${t('dueToday')} ${time}`;
  if (dayDiff === 1) return `${t('dueTomorrow')} ${time}`;
  if (dayDiff === -1) return `${t('dueYesterday')} ${time}`;

  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    // Only spell out the year when it isn't the current one.
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  });
}
