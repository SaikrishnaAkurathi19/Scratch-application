# Scratch — System Design Document (Phase 3)
**Version:** 1.0 | **Date:** 2026-05-31 | **Status:** Approved

---

## 1. App Architecture

```
┌─────────────────────────────────────────┐
│              UI Layer                   │
│   Expo Router Screens + NativeWind      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│           State Layer                   │
│         Zustand Stores                  │
│  (tasks, lists, tags, settings, stats)  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│           Database Layer                │
│      Drizzle ORM + expo-sqlite          │
│   (queries, mutations, migrations)      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Services Layer                  │
│  NotificationService  │  ExportService  │
│  (expo-notifications) │  (JSON export)  │
└─────────────────────────────────────────┘
```

---

## 2. Navigation Structure

```
App Root
├── (tabs)/                    ← Bottom Tab Navigator
│   ├── index          [Today]
│   ├── upcoming       [Upcoming 7 days]
│   ├── lists          [All Lists]
│   ├── search         [Search]
│   └── settings       [Settings]
│
├── task/new               ← Modal: Create task
├── task/[id]              ← Stack: Task detail & edit
├── list/[id]              ← Stack: List detail (tasks in list)
└── stats                  ← Stack: Stats & streaks screen
```

---

## 3. Database Schema

### tasks
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | UUID |
| title | TEXT NOT NULL | Task title |
| notes | TEXT | Optional description |
| priority | TEXT | 'high' / 'medium' / 'low' |
| list_id | TEXT FK | → lists.id |
| due_date | INTEGER | Unix timestamp, nullable |
| reminder_at | INTEGER | Unix timestamp, nullable |
| reminder_id | TEXT | expo-notifications identifier |
| recurrence | TEXT | null / 'daily' / 'weekly' / 'monthly' |
| is_completed | INTEGER | 0 or 1 |
| completed_at | INTEGER | Unix timestamp, nullable |
| sort_order | INTEGER | Manual drag order |
| created_at | INTEGER | Unix timestamp |
| updated_at | INTEGER | Unix timestamp |

### subtasks
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | UUID |
| task_id | TEXT FK | → tasks.id (CASCADE DELETE) |
| title | TEXT NOT NULL | |
| is_completed | INTEGER | 0 or 1 |
| sort_order | INTEGER | |
| created_at | INTEGER | Unix timestamp |

### lists
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | UUID |
| name | TEXT NOT NULL | |
| color | TEXT | Hex color string |
| icon | TEXT | Icon name string |
| is_default | INTEGER | 0 or 1 — cannot be deleted |
| sort_order | INTEGER | |
| created_at | INTEGER | Unix timestamp |

### tags
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | UUID |
| name | TEXT NOT NULL | |
| color | TEXT | Hex color string |
| created_at | INTEGER | Unix timestamp |

### task_tags (junction)
| Column | Type | Notes |
|---|---|---|
| task_id | TEXT FK | → tasks.id |
| tag_id | TEXT FK | → tags.id |
| PRIMARY KEY | (task_id, tag_id) | |

### stats
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | Always 1 (single row) |
| current_streak | INTEGER | Days |
| longest_streak | INTEGER | Days |
| last_completed_date | TEXT | ISO date string |
| total_completed | INTEGER | All time count |

---

## 4. Folder Structure

```
scratch/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Tab navigator config
│   │   ├── index.tsx           # Today screen
│   │   ├── upcoming.tsx        # Upcoming screen
│   │   ├── lists.tsx           # Lists screen
│   │   ├── search.tsx          # Search screen
│   │   └── settings.tsx        # Settings screen
│   ├── task/
│   │   ├── new.tsx             # New task modal
│   │   └── [id].tsx            # Task detail/edit
│   ├── list/
│   │   └── [id].tsx            # List detail
│   ├── stats.tsx               # Stats screen
│   └── _layout.tsx             # Root layout
│
├── components/
│   ├── tasks/
│   │   ├── TaskCard.tsx        # Individual task row
│   │   ├── TaskList.tsx        # FlatList of tasks
│   │   ├── SubtaskItem.tsx     # Individual subtask row
│   │   ├── PriorityBadge.tsx   # High/Med/Low badge
│   │   └── DueDateBadge.tsx    # Due date display
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Sheet.tsx           # Bottom sheet
│   │   ├── EmptyState.tsx
│   │   └── SwipeableRow.tsx    # Swipe gesture wrapper
│   └── lists/
│       └── ListCard.tsx
│
├── db/
│   ├── client.ts               # SQLite connection
│   ├── schema.ts               # Drizzle table definitions
│   ├── migrations/             # Auto-generated migrations
│   └── queries/
│       ├── tasks.ts
│       ├── lists.ts
│       ├── tags.ts
│       └── stats.ts
│
├── stores/
│   ├── taskStore.ts
│   ├── listStore.ts
│   ├── tagStore.ts
│   └── settingsStore.ts
│
├── services/
│   ├── NotificationService.ts
│   └── ExportService.ts
│
├── hooks/
│   ├── useTasks.ts
│   ├── useReminder.ts
│   └── useHaptics.ts
│
├── utils/
│   ├── date.ts                 # Date formatting helpers
│   ├── uuid.ts                 # UUID generator
│   └── colors.ts               # Priority/tag color maps
│
├── constants/
│   ├── colors.ts               # Design tokens
│   └── config.ts               # App-wide config
│
├── types/
│   └── index.ts                # All TypeScript interfaces
│
└── docs/                       # SDLC documents
```

---

## 5. State Management Design

### Zustand stores and their responsibilities

**taskStore** — tasks[], loading, error, CRUD actions, filter state  
**listStore** — lists[], selected list, CRUD actions  
**tagStore** — tags[], CRUD actions  
**settingsStore** — defaultReminderTime, hapticsEnabled, soundEnabled (persisted via AsyncStorage)

### Data flow
```
User Action → Component → Store Action → DB Query → Store Update → UI Re-render
```

---

## 6. Notification Architecture

```
User sets reminder
        ↓
NotificationService.schedule(task)
        ↓
expo-notifications registers local trigger
        ↓
OS handles scheduling (no server needed)
        ↓
Notification fires at exact time
        ↓
User taps → app opens task/[id] screen
```

Recurring: after each notification fires, reschedule next occurrence automatically.

---

**Phase 3 — System Design is now CLOSED.**
**Next: Phase 4 — UI/UX Design**
