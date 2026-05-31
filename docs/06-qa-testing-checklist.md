# Scratch — QA Testing Checklist (Phase 6)
**Version:** 1.0 | **Date:** 2026-05-31

Run every item below before releasing. Mark ✅ pass or ❌ fail with notes.

---

## 1. Core Task Management

| # | Test | Expected Result | Status |
|---|---|---|---|
| T-001 | Tap + button on Today screen | New task modal opens smoothly | |
| T-002 | Enter title and tap Save | Task appears in list immediately | |
| T-003 | Try saving with empty title | Error alert shown, not saved | |
| T-004 | Tap task checkbox | Task shows strikethrough, moves to Completed | |
| T-005 | Swipe right on task | Task completes with haptic feedback | |
| T-006 | Swipe left on task | Delete confirmation shown | |
| T-007 | Confirm delete | Task removed, not recoverable | |
| T-008 | Tap task title | Task detail screen opens | |
| T-009 | Edit task title on detail screen | Changes saved on tap Save | |
| T-010 | Add subtask on detail screen | Subtask appears with checkbox | |
| T-011 | Complete all subtasks | Progress shows "X/X done" | |
| T-012 | Delete subtask | Subtask removed immediately | |

---

## 2. Priority & Due Dates

| # | Test | Expected Result | Status |
|---|---|---|---|
| T-013 | Set High priority on new task | Red badge with flame icon shown | |
| T-014 | Set Medium priority | Amber badge shown | |
| T-015 | Set Low priority | Green badge shown | |
| T-016 | Tap "Today" quick date | Due date set to today | |
| T-017 | Tap "Tomorrow" quick date | Due date set to tomorrow | |
| T-018 | Tap "Next Week" quick date | Due date set 7 days from now | |
| T-019 | Tap "Pick" and select a date | Custom date shown on pill | |
| T-020 | Task past due date, not completed | Red overdue badge shown, surfaced in Today | |

---

## 3. Reminders & Notifications

| # | Test | Expected Result | Status |
|---|---|---|---|
| T-021 | Set a reminder 2 minutes from now | Notification fires at exact time | |
| T-022 | Close app, wait for reminder | Notification still fires | |
| T-023 | Tap notification | App opens to that task's detail screen | |
| T-024 | Set daily recurring reminder | Notification repeats every day | |
| T-025 | Remove reminder from task | Notification cancelled, no longer fires | |
| T-026 | Deny notification permissions | App shows guide to enable in settings | |

---

## 4. Lists & Organisation

| # | Test | Expected Result | Status |
|---|---|---|---|
| T-027 | Open Lists tab | Personal, Work, Shopping visible with icons | |
| T-028 | Tap "Today" smart view | Shows today's tasks | |
| T-029 | Tap "Upcoming" smart view | Tasks grouped by day for next 7 days | |
| T-030 | Tap "High Priority" smart view | Only high priority tasks shown | |
| T-031 | Tap + on Lists screen | New list modal opens | |
| T-032 | Create list with name, color, icon | List appears in My Lists | |
| T-033 | Long press default list (Personal) | Alert: cannot delete | |
| T-034 | Long press custom list | Delete confirmation shown | |
| T-035 | Delete list with tasks inside | Tasks move to Personal list | |
| T-036 | Assign task to a list | Task appears in that list's detail | |

---

## 5. Search

| # | Test | Expected Result | Status |
|---|---|---|---|
| T-037 | Open Search tab | Empty state with search prompt | |
| T-038 | Type a word in search | Results update in real-time | |
| T-039 | Search by task notes content | Task found and shown | |
| T-040 | Clear search input | Results cleared | |
| T-041 | Search with no matches | "No results" empty state shown | |
| T-042 | Complete task from search results | Task marked done, removed from results | |

---

## 6. Stats & Streaks

| # | Test | Expected Result | Status |
|---|---|---|---|
| T-043 | Complete a task | Today count increments by 1 | |
| T-044 | Complete task on day 1, check streak | Streak shows 1 | |
| T-045 | Complete task next day | Streak increments to 2 | |
| T-046 | Miss a day | Streak resets to 1 on next completion | |
| T-047 | Beat longest streak | "New record!" text shown | |
| T-048 | View progress tab | Streak card, all 4 stat cards visible | |

---

## 7. Data Persistence

| # | Test | Expected Result | Status |
|---|---|---|---|
| T-049 | Create tasks and lists, close app fully | All data intact on reopen | |
| T-050 | Force-kill app | No data lost | |
| T-051 | Reboot device | Data still present | |
| T-052 | Export data from Settings | JSON file shared/saved | |

---

## 8. UX & Performance

| # | Test | Expected Result | Status |
|---|---|---|---|
| T-053 | Cold launch app | Loads in under 2 seconds | |
| T-054 | Navigate between all 5 tabs | Transitions are instant and smooth | |
| T-055 | Create 50 tasks | List scrolls without lag | |
| T-056 | Toggle system dark mode | App stays in light mode (system: auto in Phase 2) | |
| T-057 | Complete task | Haptic feedback fires | |
| T-058 | All text readable | No clipped labels or overflow anywhere | |
| T-059 | Enable airplane mode | All features work identically | |
| T-060 | Rotate to landscape | App handles gracefully (portrait locked OK) | |

---

## Acceptance Criteria Final Check

| AC | Description | Pass? |
|---|---|---|
| AC-001 | Create task in max 2 taps | |
| AC-002 | Complete task via tap or swipe with haptic | |
| AC-003 | Notification fires when app is closed | |
| AC-004 | Airplane mode — full functionality | |
| AC-005 | All data persists after app restart | |
| AC-006 | Overdue tasks surface with red indicator | |
| AC-007 | Search results update per keystroke | |

---

## Sign-off

| Role | Status |
|---|---|
| Developer | |
| Tester (you) | |

**When all 60 tests pass and all 7 AC checks pass → Phase 6 is CLOSED → move to Phase 7: Deployment.**
