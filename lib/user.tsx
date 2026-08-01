import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { auth } from './firebase';
import { signInWithGoogle, signOutFromGoogle } from './google-auth';

type User = {
  uid: string;
  email: string | null;
  fullName: string;
};

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Turn an email into a readable display name, e.g. "john.doe@x.com" → "John Doe"
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

// Map a thrown Firebase auth error to one of our i18n keys.
export function authErrorKey(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'emailInUse';
    case 'auth/invalid-email':
      return 'invalidEmail';
    case 'auth/weak-password':
      return 'shortPassword';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'wrongCredentials';
    case 'auth/network-request-failed':
      return 'networkError';
    case 'auth/too-many-requests':
      return 'tooManyRequests';
    default:
      return 'genericError';
  }
}

// Turn a firebase user into our lean app user. Falls back to the email local
// part when the profile has no display name yet.
function toUser(fb: FirebaseUser): User {
  const fromEmail = fb.email ? displayNameFromContact(fb.email) : '';
  return {
    uid: fb.uid,
    email: fb.email,
    // Google accounts arrive with displayName already set.
    fullName: fb.displayName?.trim() || fromEmail,
  };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fb) => {
      setUser(fb ? toUser(fb) : null);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      signUp: async (fullName, email, password) => {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        await updateProfile(cred.user, { displayName: fullName.trim() });
        // updateProfile doesn't re-fire the auth listener, so sync manually.
        setUser(toUser(cred.user));
      },
      signIn: async (email, password) => {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      },
      signInWithGoogle: async () => {
        await signInWithGoogle();
      },
      resetPassword: async (email) => {
        try {
          await sendPasswordResetEmail(auth, email.trim());
        } catch (e) {
          // "No such user" is deliberately swallowed: reporting it would let
          // anyone probe which emails have accounts. The screen shows the same
          // "check your inbox" message either way.
          const code =
            typeof e === 'object' && e !== null && 'code' in e
              ? String((e as { code: unknown }).code)
              : '';
          if (code !== 'auth/user-not-found') throw e;
        }
      },
      signOut: async () => {
        // Clear the cached Google account too, otherwise the next sign-in
        // silently reuses it instead of showing the picker.
        await signOutFromGoogle();
        await firebaseSignOut(auth);
      },
    }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useUser() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}
