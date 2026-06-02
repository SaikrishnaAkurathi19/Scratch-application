# Scratch — To-Do & Reminder App
## Requirements Document (Phase 2)
**Version:** 1.0  
**Date:** 2026-05-31  
**Status:** Approved

---

## 1. Functional Requirements

### 1.1 Task Management

| ID | Requirement |
|---|---|
| FR-001 | User can create a new task with a title (required) |
| FR-002 | User can add optional notes/description to a task |
| FR-003 | User can edit any field of an existing task |
| FR-004 | User can delete a task with a confirmation prompt |
| FR-005 | User can mark a task as complete with a single tap |
| FR-006 | User can un-complete a task (toggle back to active) |
| FR-007 | Completed tasks show a strikethrough on the title |
| FR-008 | User can set a priority: High, Medium, or Low |
| FR-009 | Tasks default to Medium priority if none selected |
| FR-010 | User can set a due date on any task |
| FR-011 | Due date supports quick-picks: Today, Tomorrow, Next Week |
| FR-012 | Tasks with no due date are valid and allowed |
| FR-013 | Overdue tasks (past due date, not complete) are visually flagged in red |
| FR-014 | User can swipe right on a task to complete it |
| FR-015 | User can swipe left on a task to delete it |
| FR-016 | User can long-press and drag a task to reorder it manually |

### 1.2 Subtasks

| ID | Requirement |
|---|---|
| FR-017 | User can add subtasks to any task |
| FR-018 | Each subtask has a title and a complete/incomplete state |
| FR-019 | Subtask progress is shown as "X / Y done" on the parent task card |
| FR-020 | Completing all subtasks does not auto-complete the parent task |
| FR-021 | User can delete individual subtasks |

### 1.3 Reminders & Notifications

| ID | Requirement |
|---|---|
| FR-022 | User can set a date and time reminder on any task |
| FR-023 | Reminder fires a local push notification at the exact scheduled time |
| FR-024 | Notification shows the task title and a preview of notes |
| FR-025 | Notification works when the app is closed or in background |
| FR-026 | User can set recurring reminders: Daily, Weekly, Monthly |
| FR-027 | User can snooze a notification: 10 minutes, 1 hour, or Tomorrow |
| FR-028 | User can cancel / remove a reminder from a task |
| FR-029 | If notification permission is denied, app shows a clear guide to enable it in phone settings |
| FR-030 | Reminders are stored locally — no internet required to fire |

### 1.4 Lists & Organisation

| ID | Requirement |
|---|---|
| FR-031 | App ships with 3 default lists: Personal, Work, Shopping |
| FR-032 | User can create a custom named list |
| FR-033 | User can rename any list |
| FR-034 | User can delete a list (tasks inside move to a default "Inbox" list) |
| FR-035 | Each list shows a task count badge |
| FR-036 | User can assign any task to a list |
| FR-037 | User can create colour-coded tags (e.g. #urgent, #errands) |
| FR-038 | User can assign multiple tags to a task |
| FR-039 | User can filter the task view by tag |

### 1.5 Smart Views

| ID | Requirement |
|---|---|
| FR-040 | "Today" view shows all tasks due today + overdue tasks |
| FR-041 | "Upcoming" view shows tasks due in the next 7 days, grouped by day |
| FR-042 | "All Tasks" view shows every incomplete task across all lists |
| FR-043 | "Completed" view shows all completed tasks, sorted by completion date |
| FR-044 | "High Priority" view shows only High priority incomplete tasks |
| FR-045 | Each smart view shows an empty state illustration when no tasks exist |

### 1.6 Search

| ID | Requirement |
|---|---|
| FR-046 | User can search across all tasks by title and notes |
| FR-047 | Search results update in real time as user types |
| FR-048 | Search matches are highlighted in the results |
| FR-049 | Search works fully offline |

### 1.7 Stats & Streaks

| ID | Requirement |
|---|---|
| FR-050 | App tracks total tasks completed today |
| FR-051 | App tracks total tasks completed this week |
| FR-052 | App tracks a daily completion streak (consecutive days with at least 1 task completed) |
| FR-053 | Stats are shown on a dedicated Stats screen |
| FR-054 | Stats persist across app restarts |

### 1.8 Data & Backup

| ID | Requirement |
|---|---|
| FR-055 | All data is stored in a local SQLite database |
| FR-056 | Data persists permanently until user deletes the app |
| FR-057 | User can export all data as a JSON file to device storage |
| FR-058 | Export includes all tasks, subtasks, lists, tags, and reminders |

### 1.9 Settings

| ID | Requirement |
|---|---|
| FR-059 | User can set a default reminder time (e.g. 09:00 AM) |
| FR-060 | User can toggle haptic feedback on/off |
| FR-061 | User can toggle notification sounds on/off |
| FR-062 | User can view app version |
| FR-063 | User can trigger data export from settings |
| FR-064 | Dark mode follows the system setting automatically |

---

## 2. Non-Functional Requirements

### 2.1 Performance

| ID | Requirement |
|---|---|
| NFR-001 | App cold-start time must be under 2 seconds on mid-range Android devices |
| NFR-002 | All screen transitions must be smooth at 60 fps |
| NFR-003 | Task list must handle up to 1,000 tasks without lag or jank |
| NFR-004 | Search results must appear within 100ms of keystroke |
| NFR-005 | Database read/write operations must complete within 50ms |

### 2.2 Reliability

| ID | Requirement |
|---|---|
| NFR-006 | App must never lose user data due to a crash |
| NFR-007 | All DB writes are wrapped in transactions — partial writes are not allowed |
| NFR-008 | Reminders must fire accurately within 60 seconds of scheduled time |
| NFR-009 | App must recover gracefully from any unexpected error without crashing |
| NFR-010 | App must function fully with zero network connectivity |

### 2.3 Usability

| ID | Requirement |
|---|---|
| NFR-011 | Any core action (create task, set reminder) must be reachable in max 2 taps from home |
| NFR-012 | All tap targets must be minimum 44x44pt (Apple/Google accessibility standard) |
| NFR-013 | All text must meet WCAG AA contrast ratio in both light and dark mode |
| NFR-014 | Empty states must always provide a clear call-to-action |
| NFR-015 | Error messages must be human-readable — no raw error codes shown to user |

### 2.4 Compatibility

| ID | Requirement |
|---|---|
| NFR-016 | Must run on Android 10 (API level 29) and above |
| NFR-017 | Must run on iOS 15 and above (for future compatibility) |
| NFR-018 | Must support both light and dark mode |
| NFR-019 | Must support standard phone screen sizes (360dp – 430dp width) |

---

## 3. User Stories

| ID | User Story | Priority |
|---|---|---|
| US-001 | As a user, I want to quickly add a task so that I never forget something important | Must have |
| US-002 | As a user, I want to set a reminder so that I get notified at the right time | Must have |
| US-003 | As a user, I want to see all my tasks due today so that I know exactly what to focus on | Must have |
| US-004 | As a user, I want to swipe to complete a task so that checking things off feels fast and satisfying | Must have |
| US-005 | As a user, I want to organise tasks into lists so that my work and personal life stay separate | Must have |
| US-006 | As a user, I want to set recurring reminders so that I never miss a habit or routine | Must have |
| US-007 | As a user, I want to search my tasks so that I can find anything instantly | Should have |
| US-008 | As a user, I want to see my completion streak so that I stay motivated every day | Should have |
| US-009 | As a user, I want to add subtasks so that I can break big tasks into manageable steps | Should have |
| US-010 | As a user, I want to export my data so that I have a backup and never lose anything | Should have |
| US-011 | As a user, I want dark mode so that the app is comfortable to use at night | Must have |
| US-012 | As a user, I want haptic feedback when I complete a task so that it feels rewarding | Nice to have |

---

## 4. Acceptance Criteria

### AC-001 — Create a task
- GIVEN I am on any screen
- WHEN I tap the "+" button
- THEN a new task creation sheet opens
- AND I can type a title
- AND I can save the task
- AND the task appears immediately in the correct list

### AC-002 — Complete a task
- GIVEN a task exists in my list
- WHEN I tap the checkbox OR swipe right
- THEN the task shows a strikethrough
- AND haptic feedback fires (if enabled)
- AND the task moves to the Completed view
- AND the completion is saved to the database

### AC-003 — Reminder fires correctly
- GIVEN I have set a reminder on a task for a specific date and time
- WHEN that date and time is reached
- THEN a push notification appears on my phone
- AND tapping the notification opens the task detail screen
- AND this works even if the app is closed

### AC-004 — Offline functionality
- GIVEN my device has no internet connection (airplane mode)
- WHEN I open the app
- THEN all features work exactly as normal
- AND no error or warning is shown to the user

### AC-005 — Data persistence
- GIVEN I have created tasks, lists, and reminders
- WHEN I fully close and reopen the app
- THEN all data is exactly as I left it
- AND no data is lost

### AC-006 — Overdue detection
- GIVEN a task has a due date that has passed
- AND the task is not completed
- WHEN I view my task list
- THEN that task appears with a red overdue indicator
- AND it surfaces at the top of the Today view

### AC-007 — Search
- GIVEN tasks exist with various titles and notes
- WHEN I type a word in the search bar
- THEN only tasks containing that word in title or notes are shown
- AND results update with every keystroke

---

## 5. Document Sign-off

| Role | Status |
|---|---|
| Project Owner | ✅ Approved |
| Technical Lead | ✅ Approved |

**Phase 2 — Requirements is now CLOSED.**  
**Next: Phase 3 — System Design**

