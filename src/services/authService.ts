import { DEMO_USERS } from '../config/credentials'
import { STORAGE_KEYS } from '../config/appConfig'
import { readSession, writeSession, removeSession } from './storage'
import type { AuthenticatedUser, ServiceResult } from '../types'

/**
 * Hashes a password with SHA-256 via the browser's native Web Crypto API and
 * returns the hex-encoded digest. Used both to check a login attempt against
 * `DEMO_USERS` and (in dev mode, via `window.__hashPassword`) to generate new
 * hashes when someone wants to change a demo password.
 *
 * NOTE: this is client-side hashing for prototype hygiene (avoiding
 * plaintext passwords in source/memory), not a secure authentication
 * mechanism. See `src/config/credentials.ts` for details.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoded = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Attempts to authenticate against the configured demo users. Resolves with
 * a `ServiceResult` rather than throwing, so callers can render a friendly
 * inline error message for any failure case (unknown user, wrong password,
 * empty fields).
 */
export async function login(username: string, password: string): Promise<ServiceResult<AuthenticatedUser>> {
  const trimmedUsername = username.trim()

  if (!trimmedUsername || !password) {
    return { success: false, error: 'Please enter both a username and a password.' }
  }

  const record = DEMO_USERS.find((u) => u.username.toLowerCase() === trimmedUsername.toLowerCase())
  if (!record) {
    return { success: false, error: 'Invalid username or password.' }
  }

  const hashedAttempt = await hashPassword(password)
  if (hashedAttempt !== record.passwordHash) {
    return { success: false, error: 'Invalid username or password.' }
  }

  const user: AuthenticatedUser = {
    username: record.username,
    displayName: record.displayName,
    role: record.role,
  }

  writeSession(STORAGE_KEYS.session, user)
  return { success: true, data: user }
}

/** Clears the current session. Does not affect assignments/submissions data. */
export function logout(): void {
  removeSession(STORAGE_KEYS.session)
}

/** Returns the currently logged-in user for this browser tab/session, if any. */
export function getSession(): AuthenticatedUser | null {
  return readSession<AuthenticatedUser | null>(STORAGE_KEYS.session, null)
}
