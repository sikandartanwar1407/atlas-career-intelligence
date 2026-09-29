/**
 * Storage Service
 * Abstraction layer over persistent storage.
 * Currently uses localStorage, structured to cleanly support future Supabase/Firebase migrations.
 */

export const STORAGE_KEYS = {
  APP_STATE: 'atlas-app-state-v1',
  PROFILE: 'atlas-profile-v1',
} as const;

export class StorageService {
  static getItem<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[StorageService] Failed to read "${key}" from localStorage:`, err);
      return fallback;
    }
  }

  static setItem<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`[StorageService] Failed to write "${key}" to localStorage:`, err);
      return false;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[StorageService] Failed to remove "${key}" from localStorage:`, err);
    }
  }

  static clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.APP_STATE);
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
    } catch (err) {
      console.warn('[StorageService] Failed to clear storage:', err);
    }
  }
}
