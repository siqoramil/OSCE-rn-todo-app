import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  // @ts-expect-error - getReactNativePersistence is exported by firebase/auth
  // but is missing from the published type declarations in some versions.
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Config is read from EXPO_PUBLIC_* env vars (see .env.example).
// Expo automatically inlines any EXPO_PUBLIC_-prefixed variable at build time.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn(
    '[firebase] Missing config. Copy .env.example to .env and fill in your Firebase project credentials.'
  );
}

// Initialize once (guards against Fast Refresh re-running this module).
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// initializeAuth wires up AsyncStorage so the session survives app restarts.
// On Fast Refresh it may already be initialized, so fall back to getAuth.
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export { app, auth };
export const db = getFirestore(app);
