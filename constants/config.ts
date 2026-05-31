export const Config = {
  APP_NAME: 'Scratch',
  DB_NAME: 'scratch.db',
  DB_VERSION: 1,

  DEFAULT_LISTS: [
    { name: 'Personal', color: '#6C63FF', icon: 'person', isDefault: 1 },
    { name: 'Work',     color: '#3B82F6', icon: 'briefcase', isDefault: 1 },
    { name: 'Shopping', color: '#D97706', icon: 'cart', isDefault: 1 },
  ],

  SNOOZE_OPTIONS: [
    { label: '10 minutes', minutes: 10 },
    { label: '1 hour',     minutes: 60 },
    { label: 'Tomorrow',   minutes: 60 * 24 },
  ],

  QUICK_DATES: ['Today', 'Tomorrow', 'Next Week'],

  RECURRENCE_OPTIONS: [
    { label: 'None',    value: null },
    { label: 'Daily',   value: 'daily' },
    { label: 'Weekly',  value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
  ],

  DEFAULT_REMINDER_HOUR: 9,
  DEFAULT_REMINDER_MINUTE: 0,

  MAX_TASKS_DISPLAY: 1000,
  SEARCH_DEBOUNCE_MS: 150,
};
