/**
 * Safe local storage utility functions for YellowHouse Tailoring OS.
 * Provides safe local storage methods with SSR window checks,
 * JSON parsing try/catch error handling, and safe fallback returns.
 */

export function getLocalStorage<T>(key: string, fallbackValue: T): T {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return fallbackValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    if (item === null || item === undefined || item === 'null' || item === 'undefined') {
      return fallbackValue;
    }
    const parsed = JSON.parse(item);
    if (parsed === null || parsed === undefined) {
      return fallbackValue;
    }
    if (Array.isArray(fallbackValue) && !Array.isArray(parsed)) {
      return fallbackValue;
    }
    return parsed as T;
  } catch (error) {
    console.warn(`[storage-utils] Error reading key "${key}" from localStorage:`, error);
    return fallbackValue;
  }
}

export function setLocalStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false;
  }
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.warn(`[storage-utils] Error setting key "${key}" in localStorage:`, error);
    return false;
  }
}

export function removeLocalStorage(key: string): boolean {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false;
  }
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`[storage-utils] Error removing key "${key}" from localStorage:`, error);
    return false;
  }
}
