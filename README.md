# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Firebase setup

This app uses **Firebase Auth** (email/password **and Google**) and **Cloud
Firestore** for the todo list. The email/password flow uses the Firebase JS SDK
and runs in Expo Go; **Google sign-in needs a development build** (see below).

### 1. Create a Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. In **Build → Authentication → Sign-in method**, enable **Email/Password** and **Google**.
3. In **Build → Firestore Database**, create a database (start in production mode).
4. In **Project settings → General → Your apps**, add a **Web app** (`</>`) and
   copy the config values.

### 2. Add your config

Copy `.env.example` to `.env` and fill in the values from the web app config:

```bash
cp .env.example .env
```

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Restart the dev server after editing `.env` (`npx expo start -c`).

### 3. Google sign-in

Google sign-in uses [`@react-native-google-signin/google-signin`](https://react-native-google-signin.github.io/),
which is native code. **It does not work in Expo Go** — you need a development
build. Everything else in the app still runs in Expo Go.

**a. Get the OAuth client IDs.** Enabling Google in
**Authentication → Sign-in method** creates them for you. Find them in
[Google Cloud Console](https://console.cloud.google.com/apis/credentials) →
**APIs & Services → Credentials**, in the same project as Firebase.

Add to `.env`:

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=1234...apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=1234...apps.googleusercontent.com
```

The **web** client ID is required on *every* platform — Firebase validates the
returned ID token against it. The **iOS** client ID is only needed on iOS.

**b. Register the native apps.** The app's ids are `com.oscetodo.app` (both
platforms, set in `app.json`):

- **iOS** — create an OAuth client of type *iOS* with bundle ID `com.oscetodo.app`.
- **Android** — create an OAuth client of type *Android* with package
  `com.oscetodo.app` **and your keystore's SHA-1**. Without the right SHA-1 you
  get `DEVELOPER_ERROR` on sign-in. For a local debug build:

  ```bash
  keytool -list -v -keystore ~/.android/debug.keystore \
    -alias androiddebugkey -storepass android -keypass android
  ```

  If you build with EAS, add the SHA-1 from `eas credentials` too.

**c. Build and run:**

```bash
npx expo run:ios       # or: npx expo run:android
```

Re-run this after changing `app.json` — the scheme and package name are baked
into the native project.

### 4. Firestore security rules

Each user's todos live under `users/{uid}/todos`. Paste these rules in
**Firestore → Rules** so users can only read/write their own data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/todos/{todoId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### How it fits together

- `lib/firebase.ts` — initializes the app, Auth (with AsyncStorage persistence), and Firestore.
- `lib/user.tsx` — `UserProvider` / `useUser`: sign up, sign in, Google sign-in, sign out, and live auth state.
- `lib/google-auth.ts` — native Google picker → ID token → `signInWithCredential`, plus error mapping.
- `components/GoogleButton.tsx` — the "Continue with Google" button and `or` divider.
- `lib/todos.ts` — `useTodos` (realtime) plus `addTodo` / `setTodoTitle` / `toggleTodo` / `deleteTodo`.
- `app/_layout.tsx` — auth gate that redirects between the auth screens and the app.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
