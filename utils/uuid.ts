/**
 * Generate a UUID v4-compatible unique ID.
 * Uses crypto.getRandomValues when available (React Native with
 * react-native-get-random-values), falls back to Math.random.
 */
export function generateId(): string {
  try {
    // react-native-get-random-values polyfills crypto.getRandomValues
    require('react-native-get-random-values');
    const { v4: uuidv4 } = require('uuid');
    return uuidv4();
  } catch {
    // Fallback: time + random, good enough for offline local IDs
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
