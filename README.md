# Scratch — To-Do & Reminder App
## Fixed & Production-Ready Build

---

## What Was Fixed

### Critical Bugs Resolved

| # | Bug | Fix Applied |
|---|-----|-------------|
| 1 | `expo-sqlite` missing `SQLiteDatabase` module | Pinned to `~14.0.6` (the first stable release with sync API) |
| 2 | Missing `assets/` folder | Created `icon.png`, `adaptive-icon.png`, `splash.png`, `notification-icon.png` |
| 3 | `babel.config.js` — NativeWind v4 wrong preset format | Changed to `['babel-preset-expo', { jsxImportSource: 'nativewind' }]` |
| 4 | `NotificationService.ts` used `SchedulableTriggerInputTypes` enum (not in v0.28) | Replaced with plain object trigger format compatible with expo-notifications 0.28 |
| 5 | `app.json` referenced `UIBackgroundModes` (iOS-only key in wrong format) | Removed; replaced with correct iOS section |
| 6 | `app.json` missing `POST_NOTIFICATIONS` Android 13+ permission | Added |
| 7 | `db/client.ts` used async dynamic `import()` inside sync function | Replaced with inline data, made fully synchronous |
| 8 | `lists.tsx` used `FlatList` with `data={[]}` + `renderItem={null}` | Replaced with `ScrollView` |
| 9 | `app/_layout.tsx` missing `list/new` screen registration | Added `list/new` Stack.Screen |
| 10 | `_layout.tsx` no error boundary around `initDatabase()` | Wrapped in try/catch |
| 11 | `taskStore.ts` — all DB calls unguarded | Added try/catch to every operation |
| 12 | `index.tsx` progress bar logic incorrect | Fixed calculation to include completed tasks in total |
| 13 | `uuid.ts` hard-imported `react-native-get-random-values` at module level | Changed to lazy require with fallback |
| 14 | `package.json` used `~14.0.0` for expo-sqlite (broken build path) | Pinned to `~14.0.6` |
| 15 | `newArchEnabled` not explicitly disabled (causes build failures) | Set `"newArchEnabled": false` |
| 16 | `tailwindcss` unpinned (v4 incompatible with NativeWind 4) | Pinned to `3.4.15` |
| 17 | `.npmrc` had only `ignore-scripts=false` | Added `legacy-peer-deps=true` to fix peer dep conflicts |
| 18 | `tsconfig.json` missing `skipLibCheck` | Added; prevents TS errors from third-party types |
| 19 | `shouldSetBadge: true` in notification handler (requires extra permission) | Set to `false` |
| 20 | `router.push()` calls missing `as any` TypeScript cast for dynamic paths | Added throughout |

---

## Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npx expo start

# 3. Scan QR code with Expo Go app on Android
```

---

## Build APK (Production-Ready)

### Option A: EAS Build (Recommended — cloud build, no Android SDK needed)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account (free)
eas login

# Build APK for sideloading / testing
eas build --platform android --profile preview

# Download APK from the URL printed after build completes
```

### Option B: Local Build (requires Android Studio + JDK 17)

```bash
# Generate native Android project
npx expo prebuild --platform android --clean

# Build debug APK
cd android && ./gradlew assembleDebug

# APK will be at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Project Structure

```
scratch/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Bottom tab navigator
│   │   ├── index.tsx       # Today view ✅ Fixed
│   │   ├── upcoming.tsx    # Upcoming 7 days
│   │   ├── lists.tsx       # All lists ✅ Fixed
│   │   ├── search.tsx      # Search
│   │   └── settings.tsx    # Progress/Stats
│   ├── task/
│   │   ├── [id].tsx        # Task detail / edit
│   │   └── new.tsx         # New task screen
│   ├── list/
│   │   └── [id].tsx        # List detail (handles smart views too)
│   │   └── new.tsx         # New list screen
│   └── _layout.tsx         # Root layout ✅ Fixed
├── assets/                 # ✅ Created (icon, splash, notification-icon)
├── db/
│   ├── client.ts           # ✅ Fixed (sync seed, error handling)
│   └── queries/            # All DB query functions
├── services/
│   └── NotificationService.ts  # ✅ Fixed (compatible trigger format)
├── stores/
│   └── taskStore.ts        # ✅ Fixed (error handling on all ops)
├── utils/
│   └── uuid.ts             # ✅ Fixed (safe fallback)
├── package.json            # ✅ Fixed (pinned versions)
├── babel.config.js         # ✅ Fixed (NativeWind v4 preset)
├── app.json                # ✅ Fixed (permissions, newArchEnabled)
├── eas.json                # ✅ Fixed (build profiles)
└── .npmrc                  # ✅ Fixed (legacy-peer-deps)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 51 + React Native 0.74 |
| Language | TypeScript |
| Database | expo-sqlite 14.0.6 (local SQLite) |
| Notifications | expo-notifications 0.28 |
| Navigation | Expo Router 3.5 |
| State | Zustand |
| Styling | NativeWind v4 + StyleSheet |
| Animations | React Native Reanimated 3.10 |
| Gestures | React Native Gesture Handler 2.16 |

