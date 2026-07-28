import {
  GoogleSignin,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebase';

// Client IDs come from the Google Cloud console of the *same* project that
// backs Firebase (see .env.example for where to find them).
//
// - webClientId is what Firebase validates the ID token against, so it is
//   required on every platform — including Android and iOS.
// - iosClientId is only needed on iOS.
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export function isGoogleConfigured(): boolean {
  return typeof webClientId === 'string' && webClientId.length > 0;
}

// Configure lazily rather than at module load: the native module does not
// exist in Expo Go, and touching it on import would take the whole app down.
let configured = false;
function ensureConfigured() {
  if (configured) return;
  GoogleSignin.configure({ webClientId, iosClientId });
  configured = true;
}

/** Thrown when the user backs out of the Google account picker. */
export class GoogleSignInCancelled extends Error {
  constructor() {
    super('Google sign-in was cancelled');
    this.name = 'GoogleSignInCancelled';
  }
}

/**
 * Runs the native Google account picker and exchanges the resulting ID token
 * for a Firebase session. The auth listener in `UserProvider` picks it up from
 * there, so nothing needs to be returned.
 *
 * Throws `GoogleSignInCancelled` if the user dismissed the picker.
 */
export async function signInWithGoogle(): Promise<void> {
  if (!isGoogleConfigured()) {
    throw new Error('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set');
  }

  ensureConfigured();

  // No-op on iOS; on Android it surfaces the "update Play Services" dialog.
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) {
    throw new GoogleSignInCancelled();
  }

  const { idToken } = response.data;
  if (!idToken) {
    throw new Error('Google did not return an ID token');
  }

  await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
}

/**
 * Clears the cached Google account so the next sign-in shows the picker again.
 * Safe to call when the user signed in with email/password instead.
 */
export async function signOutFromGoogle(): Promise<void> {
  if (!isGoogleConfigured()) return;
  try {
    ensureConfigured();
    await GoogleSignin.signOut();
  } catch {
    // Nothing cached, or the native module is unavailable — either way the
    // Firebase sign-out is what actually ends the session.
  }
}

/** Map a Google sign-in failure to one of our i18n keys. */
export function googleErrorKey(error: unknown): string {
  if (error instanceof GoogleSignInCancelled) return 'googleCancelled';

  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? (error as { code: unknown }).code
      : undefined;

  switch (code) {
    case statusCodes.SIGN_IN_CANCELLED:
      return 'googleCancelled';
    case statusCodes.IN_PROGRESS:
      return 'signInInProgress';
    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
      return 'playServicesMissing';
    default:
      break;
  }

  // The native module is missing — almost always means the app is running in
  // Expo Go instead of a development build.
  const message = error instanceof Error ? error.message : String(error);
  if (/native module|RNGoogleSignin|not.*linked/i.test(message)) {
    return 'googleNeedsDevBuild';
  }

  return 'genericError';
}
