/**
 * Thin wrapper around the browser's `localStorage` / `sessionStorage`.
 *
 * Every other module in this app reads and writes persisted data through
 * these functions rather than calling `localStorage` directly. That keeps
 * the "how data is persisted" decision in exactly one place — if this
 * prototype ever grows a real backend, this is the file that gets replaced
 * with `fetch` calls, and nothing else needs to change.
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

export function readSession<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    return safeParse(window.sessionStorage.getItem(key), fallback)
  } catch (err) {
    console.warn(`[storage] Failed to read sessionStorage key "${key}".`, err)
    return fallback
  }
}

export function writeSession<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`[storage] Failed to write sessionStorage key "${key}".`, err)
  }
}

export function removeSession(key: string): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(key)
}
