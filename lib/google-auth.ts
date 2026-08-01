import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebase';

// `@react-native-google-signin/google-signin` calls
// `TurboModuleRegistry.getEnforcing('RNGoogleSignin')` at the top level of its
// own module, so a plain `import` throws on any runtime without the native
// binary — i.e. Expo Go — and takes the whole app down before React mounts.
// Require it lazily instead, and treat a failure as "not available here".
type GoogleSigninModule = typeof import('@react-native-google-signin/google-signin');

let nativeModule: GoogleSigninModule | null | undefined;

function loadGoogleSignin(): GoogleSigninModule | null {
  if (nativeModule === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      nativeModule = require('@react-native-google-signin/google-signin') as GoogleSigninModule;
    } catch {
      nativeModule = null;
    }
  }
  return nativeModule;
}

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

let configured = false;
function ensureConfigured(google: GoogleSigninModule) {
  if (configured) return;
  google.GoogleSignin.configure({ webClientId, iosClientId });
  configured = true;
}

/** Thrown when the user backs out of the Google account picker. */
export class GoogleSignInCancelled extends Error {
  constructor() {
    super('Google sign-in was cancelled');
    this.name = 'GoogleSignInCancelled';
  }
}

/** Thrown when the native module isn't in the binary (Expo Go). */
export class GoogleSignInUnavailable extends Error {
  constructor() {
    super('RNGoogleSignin is not available — a development build is required');
    this.name = 'GoogleSignInUnavailable';
  }
}

/**
 * Runs the native Google account picker and exchanges the resulting ID token
 * for a Firebase session. The auth listener in `UserProvider` picks it up from
 * there, so nothing needs to be returned.
 *
 * Throws `GoogleSignInCancelled` if the user dismissed the picker, or
 * `GoogleSignInUnavailable` when running without the native module.
 */
export async function signInWithGoogle(): Promise<void> {
  if (!isGoogleConfigured()) {
    throw new Error('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set');
  }

  const google = loadGoogleSignin();
  if (!google) {
    throw new GoogleSignInUnavailable();
  }

  ensureConfigured(google);

  // No-op on iOS; on Android it surfaces the "update Play Services" dialog.
  await google.GoogleSignin.hasPlayServices({
    showPlayServicesUpdateDialog: true,
  });

  const response = await google.GoogleSignin.signIn();
  if (!google.isSuccessResponse(response)) {
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
  const google = loadGoogleSignin();
  if (!google) return;
  try {
    ensureConfigured(google);
    await google.GoogleSignin.signOut();
  } catch {
    // Nothing cached, or the native module is unavailable — either way the
    // Firebase sign-out is what actually ends the session.
  }
}

/** Map a Google sign-in failure to one of our i18n keys. */
export function googleErrorKey(error: unknown): string {
  if (error instanceof GoogleSignInCancelled) return 'googleCancelled';
  if (error instanceof GoogleSignInUnavailable) return 'googleNeedsDevBuild';

  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? (error as { code: unknown }).code
      : undefined;

  // `statusCodes` lives in the same module as the native binding, so it is
  // only reachable when the module actually loaded.
  const statusCodes = loadGoogleSignin()?.statusCodes;
  if (statusCodes) {
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
  }

  // The native module is missing — almost always means the app is running in
  // Expo Go instead of a development build.
  const message = error instanceof Error ? error.message : String(error);
  if (/native module|RNGoogleSignin|not.*linked/i.test(message)) {
    return 'googleNeedsDevBuild';
  }

  return 'genericError';
}
