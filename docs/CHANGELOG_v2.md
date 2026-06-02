# Scratch v2.0 — Changelog

## Bugs Fixed

### 1. Reminder date picker error
- **Root cause:** `DateTimePicker` in `datetime` mode on Android can throw if the picker is dismissed without selecting. Now guarded — only applies date if `date` is truthy.
- **File:** `app/task/new.tsx`

### 2. Task completion not reflecting instantly in Lists tab
- **Root cause:** Lists tab used `useEffect` only, not `useFocusEffect`, so counts didn't re-query when switching tabs. 
- **Fix:** Replaced `useEffect` with `useFocusEffect` in `app/(tabs)/lists.tsx` — counts now refresh every time the tab is focused.

### 3. Tab switch lag
- **Root cause:** `StyleSheet.create()` was called inside render on every paint (styles were dynamic objects). 
- **Fix:** All screens now use a `makeStyles(colors)` pattern — styles are created once per theme change, not per render. Reduces GC pressure and re-render cost.

### 4. Progress bar not interactive
- **Root cause:** The progress bar was purely decorative (no `onPress`). "Progress" means showing completion ratio — it's a readout, not a control. 
- **Fix:** Made it visually clearer (taller: 5px → 6px, animated fill) and added a tap on the progress area to trigger a refresh. No ambiguous affordance.

### 5. New task: list not pre-selected if lists load late
- **Root cause:** `selectedListId` defaulted to `lists[0]?.id ?? ''` at render time — if lists hadn't loaded yet, it defaulted to empty string.
- **Fix:** Added a `useEffect` in `app/task/new.tsx` that sets `selectedListId` to `lists[0].id` whenever `lists` changes and `selectedListId` is still empty.

## New Features

### 6. Dark mode ✅
- Implemented full dark/light color palette in `constants/colors.ts` (`LightColors`, `DarkColors`).
- Created `hooks/useTheme.ts` — reads `useColorScheme()` from React Native, returns the correct color set automatically.
- All screens, components, and modals now use `useTheme()` — the app follows system dark mode toggle instantly with no restart required.

### 7. Trash / soft delete ✅
- **Swipe left → Trash** (was: permanent delete). Tasks go to trash, not immediately gone.
- **Bulk delete via long-press multi-select:** Long press any task → enters multi-select mode → select more → Trash all.
- **Trash screen:** Accessible from Lists tab → "Trash" smart view. Shows all trashed tasks.
- **Per-item actions in trash:** Restore (undo) or Delete forever (permanent).
- **Empty trash button:** In trash view header, and in Progress → Settings.
- **DB change:** Added `is_deleted` and `deleted_at` columns to `tasks` table. Migration runs safely on existing DBs.

### 8. Subtasks in new task form ✅
- Added a subtasks section at the bottom of `app/task/new.tsx`.
- Type a subtask → press Return or the checkmark → it appears as a chip. Tap ✕ to remove.
- Subtasks are saved to DB immediately after task creation.

### 9. Task detail: change priority, category, list ✅
- `app/task/[id].tsx` now shows tappable chip rows for Priority, Category, and List.
- Tapping a chip immediately updates the task in DB and refreshes the view.
- No need to enter "edit mode" to change these fields.

### 10. Work nature / category ✅
- New `WorkNature` type: `personal | work | shopping | health | other`.
- Shown as a coloured badge on task cards.
- Selectable during task creation and editable in task detail.

### 11. Recurring tasks with advanced options ✅
- Recurrence options: Daily, Weekly, Monthly, Yearly, Custom days.
- "Custom days" → day-of-week selector (tap to toggle Sun/Mon/Tue…).
- Optional end date for any recurrence pattern.
- All stored in `recurrence`, `recurrence_end_date`, `recurrence_days` columns.
- Recurrence badge (🔁 icon) shown on task cards.

### 12. Sort tasks ✅
- Sort by: Priority, Due date, Created, Name.
- Sort picker available on Today, Upcoming, and all list views via the funnel icon.
- Sort preference stored in `taskStore` (resets on app restart — intentional, no AsyncStorage dependency).

### 13. Progress screen: streak explanation & settings ✅
- Added info card explaining what the streak is and why it's useful.
- Added Settings section: toggle haptic feedback, toggle sound.
- Shows dark/light mode status (system-controlled).
- Shows trash count with quick "Empty trash" action.

