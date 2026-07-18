import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type User = {
  fullName: string;
};

type UserContextValue = {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

// Turn an email/phone into a readable display name, e.g. "john.doe@x.com" → "John Doe"
export function displayNameFromContact(contact: string): string {
  const local = contact.trim().split('@')[0] ?? '';
  const cleaned = local.replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return contact.trim();
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      setUser: setUserState,
      clearUser: () => setUserState(null),
    }),
    [user]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}
