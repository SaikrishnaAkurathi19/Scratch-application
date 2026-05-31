# Scratch — To-Do & Reminder App
## Project Planning Document (Phase 1)
**Version:** 1.0  
**Date:** 2026-05-31  
**Status:** Approved

---

## 1. Project Overview

| Field | Detail |
|---|---|
| App Name | Scratch |
| Type | Mobile To-Do & Reminder Application |
| Platform | Android (primary), iOS (future) |
| Storage | Local only — fully offline |
| Language | English |
| Current Phase | Phase 1 — Planning ✅ |

---

## 2. Problem Statement

People need a fast, reliable, distraction-free way to capture tasks and set reminders — without depending on an internet connection, without creating an account, and without a cluttered UI. Existing apps are either too complex, ad-supported, or require cloud sign-up. Scratch is a clean, professional, offline-first alternative built for personal daily use with a path to public release.

---

## 3. Project Goals

### Primary Goals (Phase 1 — Local MVP)
- Build a fully functional, production-quality to-do and reminder app
- Works 100% offline — no internet required at any point
- Runs on Android devices (via Expo/React Native)
- Clean, smooth, professional UI/UX
- Zero bugs that affect user experience

### Secondary Goals (Future — Phase 2+)
- Publish to Google Play Store (Android)
- Publish to Apple App Store (iOS)
- Add cloud sync (Supabase backend)
- Multi-user / sharing features

---

## 4. Scope

### In Scope (This Build)
- Task management: create, edit, delete, complete tasks
- Priority levels: High, Medium, Low
- Due dates with quick-pick options
- Time-based reminders (local push notifications)
- Recurring reminders (daily, weekly, monthly)
- Snooze from notification
- Overdue task detection and surfacing
- Lists / projects (Work, Personal, etc.)
- Tags / labels with colour coding
- Subtasks with progress indicator
- Smart views: Today, Upcoming, All, Completed, High Priority
- Dark mode (auto follows system)
- Haptic feedback
- Drag-to-reorder tasks
- Completion animations
- Search across all tasks
- Stats: tasks completed, streaks
- Data export (JSON backup)

### Out of Scope (This Build)
- Cloud sync / backend
- User accounts / authentication
- Push notifications via server (FCM/APNs)
- Sharing tasks with other users
- Calendar app integration
- Home screen widgets (deferred to Phase 2)
- Multilingual support
- Tablet or web version

---

## 5. Tech Stack (Finalised)

| Layer | Technology | Reason |
|---|---|---|
| Framework | Expo (SDK 51+) + React Native | Cross-platform, fast setup, great DX |
| Language | TypeScript | Type safety, fewer runtime bugs |
| Database | expo-sqlite + Drizzle ORM | Local SQLite, structured queries |
| Notifications | expo-notifications | Local reminders, fully offline |
| Navigation | Expo Router (file-based) | Clean, modern navigation pattern |
| State | Zustand | Lightweight, simple global state |
| Styling | NativeWind (Tailwind for RN) | Rapid, consistent, professional UI |
| Animations | React Native Reanimated | 60fps smooth animations |
| Gestures | React Native Gesture Handler | Swipe-to-complete, drag-to-reorder |
| Icons | Expo Vector Icons (Ionicons) | Native-quality icon set |
| Testing | Jest + React Native Testing Library | Unit and component tests |

**Total cost: $0** — all open source, all free tiers.

---

## 6. Project Structure (Planned)

```
scratch/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Bottom tab navigator
│   │   ├── index.tsx       # Today view
│   │   ├── upcoming.tsx    # Upcoming 7 days
│   │   ├── lists.tsx       # All lists
│   │   └── settings.tsx    # Settings
│   ├── task/
│   │   ├── [id].tsx        # Task detail / edit
│   │   └── new.tsx         # New task screen
│   └── list/
│       └── [id].tsx        # List detail screen
├── components/             # Reusable UI components
│   ├── tasks/
│   ├── reminders/
│   └── ui/
├── db/                     # Database layer
│   ├── schema.ts           # Drizzle schema
│   ├── migrations/         # DB migrations
│   └── queries/            # All DB query functions
├── stores/                 # Zustand state stores
├── hooks/                  # Custom React hooks
├── utils/                  # Helper functions
├── constants/              # App-wide constants
├── types/                  # TypeScript type definitions
└── docs/                   # This folder — all SDLC documents
```

---

## 7. Timeline Estimate

| Phase | Description | Duration |
|---|---|---|
| 1 — Planning | ✅ Complete | Done |
| 2 — Requirements | Write FRD, user stories, acceptance criteria | 2–3 days |
| 3 — System Design | Architecture, DB schema, navigation map | 3–4 days |
| 4 — UI/UX Design | Wireframes, mockups, design system | 4–5 days |
| 5 — Development | Build all screens and features | 4–6 weeks |
| 6 — Testing & QA | Test, fix bugs, performance tuning | 1 week |
| 7 — Deployment | Production build, optional store publish | 1–2 days |
| **Total** | | **~8–10 weeks** |

---

## 8. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Notification permissions denied by OS | Medium | Handle gracefully, guide user to settings |
| SQLite migration issues after schema changes | Medium | Use Drizzle ORM migrations, never raw schema edits |
| Android/iOS behaviour differences | Medium | Test on both platforms from day one using Expo Go |
| Scope creep (adding features mid-build) | High | All new features go to a backlog, not the current sprint |
| Reanimated/Gesture Handler setup issues | Low | Known setup — follow Expo docs precisely |

---

## 9. Success Criteria

The app is considered successfully complete when:

1. A user can create, edit, complete, and delete tasks without any crashes
2. Local notifications fire at the correct scheduled time, even when app is closed
3. All data persists correctly after app restart
4. The app works with zero internet connection
5. Dark mode works correctly on system toggle
6. Swipe gestures, haptics, and animations are smooth (no jank)
7. All acceptance criteria from the Requirements document are met

---

## 10. Document Sign-off

| Role | Name | Status |
|---|---|---|
| Project Owner | You | ✅ Approved |
| Technical Lead | Claude | ✅ Approved |

**Phase 1 — Planning is now CLOSED.**  
**Next: Phase 2 — Requirements Document**

