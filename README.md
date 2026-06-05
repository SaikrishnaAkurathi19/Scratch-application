# Scratch - To-Do & Reminder App

Modern offline-first task management app built with Expo, React Native, SQLite, Zustand, Expo Router, and Expo Notifications.

Version: v3.0.0

Status: Stable v3 Update

## Features

* Create, edit, complete, reopen, trash, and restore tasks
* Tasks tab with inline search and filter controls
* Bottom-right quick create button for new tasks
* Dynamic Calendar tab for scheduled tasks
* Custom categories/lists
* Category badge on every task card
* Expandable task cards with editable subtasks
* Due/start dates, reminders, repeat rules, custom repeat days, and repeat end dates
* Local SQLite storage and offline support
* Local notifications and reminders
* Progress dashboard with streaks, stats, and task health insights
* Android and web support

in list tab once the task is created its visible in list tab where we able to edit the subtasks we can add or delete its really a good feature we need this and continue this feature and alone with the when i used click on the task he able to see the all the details right here also the user need or able to edit the subtasks only - not the other features like priority, catogory, schedule he can't able to edit until he click on the edit button and chaneg there task details before enter into the edit he can only able edit the subtask alone he can able to edit - to add or delete the task

and comes to calender tab i need the full calender like the calander app - where when the user click on the dates he can able to taks over there in calander tab - now its not looks like a user frfiendly like today, tmr, week, month not looking implete the calander like the calaner app like - the jira calander or team oe outlook where they can see there meetings right like wise
  
in lists while try to create the cataory i can see the icon arrage is not good its not fiting the space - look like in place of 5 icons placed 4 icons - 1 icon space is looking empty - if possible try to chnage the look of the that catogory editing page make it more professional like 10+ years or more exp ui/ux designer developer

while hold and deletinng the tasks its taking too much time for hold to appear the delete icon - as told you i just wna the trash icon no need of trash text in that and also while seleting the taks to delete its not responding properly like when i click on the check box its not responding - when click on the center of the task then only its responding.. need it check this as well
comes progress tab change the entire ui/ux user are not happy with that progress tab change the entire look... if possible

## V3 Update Summary

* Renamed the first tab from Today to Tasks.
* Removed the standalone Search tab from the tab bar.
* Added a search icon and filter icon to the Tasks tab header.
* Moved new task creation to a bottom-right floating action button.
* Replaced the Upcoming tab with a Calendar tab grouped by task date.
* Added range filters to Calendar: Today, Tomorrow, This week, Month, and All.
* Added category banners to task cards.
* Added expandable subtask controls on task cards so users can add, delete, and mark subtasks complete without opening the detail screen.
* Added Reopen as the completed-task swipe action name for moving completed tasks back to active tasks.
* Changed the right swipe/trash action to show only the trash icon.
* Added None as the default priority option alongside High, Medium, and Low.
* Updated task creation so priority defaults to None instead of Medium.
* Added editable due/start date, reminder, repeat type, custom repeat days, and repeat end date controls on the task detail screen.
* Kept repeat end date hidden for Daily repeat tasks.
* Enhanced the Progress tab with completion rate, active today, scheduled task count, and high-priority count.
* Fixed missing Expo asset files referenced by app.json.
* Replaced invalid Ionicons name `calendar-check` with `calendar-outline`.

## Recommended Action Names

For completed tasks, the recommended action name is Reopen.

Why: it is short, familiar, and clearly means "move this completed task back to active tasks."

For no priority, the recommended name is None.

Why: it matches common task app language and reads naturally with High, Medium, and Low.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Expo SDK 51 + React Native 0.74 |
| Language | TypeScript |
| Database | Expo SQLite 14 |
| State Management | Zustand |
| Navigation | Expo Router |
| Notifications | Expo Notifications |
| Styling | NativeWind + React Native StyleSheet |
| Animations | React Native Reanimated |
| Gestures | React Native Gesture Handler |

## Project Structure

```text
app/
  (tabs)/
    index.tsx      Tasks tab
    upcoming.tsx   Calendar tab
    lists.tsx      Categories and smart views
    settings.tsx   Progress and settings
  task/
    new.tsx        Create task
    [id].tsx       Task detail and edit
components/
  tasks/
    TaskCard.tsx
    TaskList.tsx
    PriorityBadge.tsx
db/
  client.ts
  queries/
stores/
types/
utils/
assets/
```

## Install

```bash
npm install
```

## Run

```bash
npx expo start
```

Useful Expo options:

```text
a - Android emulator/device
w - Web browser
```

## Build APK

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

## Validation Completed

```bash
npx tsc --noEmit
npx expo config --type public
npx expo export --platform web
```

Results:

* TypeScript validation passed.
* Expo public config resolved.
* Web bundle/export completed successfully.
* Missing `./assets/icon.png` warning fixed.
* Invalid `calendar-check` Ionicon warning fixed.

## Notes

The source package should exclude generated folders such as `node_modules`, `.expo`, and `dist` when sharing the project zip.
