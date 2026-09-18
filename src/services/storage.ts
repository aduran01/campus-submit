/**
 * Thin wrapper around the browser's `localStorage`.
 *
 * The only thing stored client-side now is the signed-in session (a JWT +
 * display info) — assignments and submissions live on the backend (see
 * `apiClient.ts`). Every module that needs the session reads/writes it
 * through these functions rather than calling `localStorage` directly.
 */

function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch (err) {
    console.warn('[storage] Failed to parse stored value, using fallback.', err)
    return fallback
  }
}

export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    return safeParse(window.localStorage.getItem(key), fallback)
  } catch (err) {
    console.warn(`[storage] Failed to read localStorage key "${key}".`, err)
    return fallback
  }
}

export function writeLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`[storage] Failed to write localStorage key "${key}".`, err)
  }
}

export function removeLocal(key: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(key)
}
