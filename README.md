# Scratch — To-Do & Reminder App

Modern offline-first task management application built with Expo, React Native, SQLite, Zustand, and Expo Notifications.

Version: v2.0.0

Status: Stable Release

---

## Features

* Create, Edit and Delete Tasks
* Smart Views

  * Today
  * Upcoming
  * High Priority
  * Completed
* Custom Lists
* Local SQLite Storage
* Offline Support
* Local Notifications & Reminders
* Search Tasks
* Progress Tracking
* Android Support
* 
Done. I kept the v2 structure intact and made focused fixes only.

Fixed:

Reminder scheduling: Android channel added, duplicate scheduling removed, Android reminder picker now date then time.
Dark mode: System / Light / Dark control added, bottom tabs now follow app theme.
Haptics: feedback made stronger and more noticeable.
Task detail: opens in preview mode; editing unlocks changes.
Category/List UX: task creation now uses one CATEGORY picker based on user-created lists.
Long-press delete: delete bar hides when no task is selected; close button removed.
Sorting: replaced old pill bar with a cleaner shared sort menu.
Today tab: now also shows upcoming tasks.
Category creation: renamed list wording, enriched icon picker with labels.
---

## Tech Stack

| Layer            | Technology                        |
| ---------------- | --------------------------------- |
| Framework        | Expo SDK 51 + React Native 0.74   |
| Language         | TypeScript                        |
| Database         | Expo SQLite 14.0.6                |
| State Management | Zustand                           |
| Navigation       | Expo Router 3.5                   |
| Notifications    | Expo Notifications 0.28           |
| Styling          | NativeWind v4                     |
| Animations       | React Native Reanimated 3.10      |
| Gestures         | React Native Gesture Handler 2.16 |

---

## Project Structure

```text
scratch-app/
│
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx
│   │   ├── upcoming.tsx
│   │   ├── lists.tsx
│   │   ├── search.tsx
│   │   ├── settings.tsx
│   │   └── _layout.tsx
│   │
│   ├── task/
│   │   ├── [id].tsx
│   │   └── new.tsx
│   │
│   ├── list/
│   │   ├── [id].tsx
│   │   └── new.tsx
│   │
│   └── _layout.tsx
│
├── assets/
├── components/
│   ├── lists/
│   ├── tasks/
│   └── ui/
│
├── constants/
├── db/
│   └── queries/
├── docs/
├── hooks/
├── services/
├── stores/
├── types/
├── utils/
│
├── app.json
├── babel.config.js
├── eas.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## Prerequisites

Install the following:

* Node.js 18+
* npm
* Git
* Expo CLI
* Expo Go App (Android)

Verify installation:

```bash
node -v
npm -v
git --version
```

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
```

Navigate to the project:

```bash
cd scratch-app
```

Install dependencies:

```bash
npm install
```

---

## Run the Application

Start the Expo development server:

```bash
npx expo start
```

Options:

```text
a → Android Emulator
w → Web Browser
```

Or scan the QR code using Expo Go.

---

## Run on Another System

### Step 1

Install Node.js

https://nodejs.org

Verify:

```bash
node -v
npm -v
```

### Step 2

Clone repository:

```bash
git clone <repository-url>
cd scratch-app
```

### Step 3

Install dependencies:

```bash
npm install
```

### Step 4

Verify Expo project health:

```bash
npx expo-doctor
```

Expected:

```text
17/17 checks passed
```

### Step 5

Run application:

```bash
npx expo start --clear
```

### Step 6

Open using:

* Expo Go
* Android Emulator
* Web Browser

---

## Build APK

### Cloud Build (Recommended)

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

Download the APK from the generated Expo URL.

---

### Production Build

```bash
eas build --platform android --profile production
```

---

## Database

Storage Engine:

```text
SQLite Local Database
```

Database initializes automatically during first launch.

---

## Notifications

Uses:

```text
expo-notifications
```

Supports:

* Local reminders
* Scheduled notifications
* Android notification channels

---

## Troubleshooting

### Clear Metro Cache

```bash
npx expo start --clear
```

### Dependency Issues

Windows:

```bash
rmdir /s /q node_modules
npm install
```

### Verify Project

```bash
npx expo-doctor
```

Expected:

```text
17/17 checks passed
```

---

## Release Notes (v1.0.0)

Major fixes completed:

* SQLite compatibility fixes
* NativeWind configuration fixes
* Notification compatibility fixes
* Android permission fixes
* Progress calculation fixes
* Smart View navigation fixes
* Render-loop fixes
* Build configuration fixes
* Expo SDK 51 compatibility fixes

---

## Future Enhancements

* Cloud Sync
* Recurring Tasks
* Dark Mode
* Widgets
* Backup & Restore
* Multi-device Sync

---

## Author

Krishna

Version 1.0.0
Stable Release
