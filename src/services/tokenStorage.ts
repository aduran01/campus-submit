import type { AuthenticatedUser } from '../types'
import { STORAGE_KEYS } from '../config/appConfig'
import { readLocal, writeLocal, removeLocal } from './storage'

/**
 * Persists the signed-in session client-side. Only the token + display info
 * live here — the server is the source of truth for whether the token is
 * still valid (it's a signed JWT with its own 12h expiry, verified on every
 * API request).
 */
export function saveSession(token: string, user: AuthenticatedUser): void {
  writeLocal(STORAGE_KEYS.authToken, token)
  writeLocal(STORAGE_KEYS.authUser, user)
}

export function getToken(): string | null {
  return readLocal<string | null>(STORAGE_KEYS.authToken, null)
}

export function getStoredUser(): AuthenticatedUser | null {
  return readLocal<AuthenticatedUser | null>(STORAGE_KEYS.authUser, null)
}

export function clearSession(): void {
  removeLocal(STORAGE_KEYS.authToken)
  removeLocal(STORAGE_KEYS.authUser)
}
