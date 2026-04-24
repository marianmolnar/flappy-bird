import { STORAGE_KEYS } from '../config/constants.ts';

/** Safe localStorage read with JSON parsing */
export function storageGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Safe localStorage write with JSON serialization */
export function storageSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded or private mode — silently skip
  }
}

/** Remove item from localStorage */
export function storageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Silent fail
  }
}

/** Clear all game-related storage */
export function storageClearAll(): void {
  storageRemove(STORAGE_KEYS.GAME_STATE);
  storageRemove(STORAGE_KEYS.SETTINGS);
}
