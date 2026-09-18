import type { UserRole } from '../types'

/**
 * ============================================================================
 * DEMO CREDENTIALS — DISPLAY HINT ONLY
 * ============================================================================
 * Authentication is now handled entirely by the backend (see
 * server/src/routes/auth.ts and server/src/db.ts, where the same two demo
 * accounts are seeded with bcrypt-hashed passwords). This file no longer
 * verifies anything — it exists purely to drive the "Need demo credentials?"
 * hint on the login page, so those strings live in one documented place
 * instead of being typed inline in a component.
 *
 * If you change a demo password, update it in BOTH places:
 *   1. Here (so the on-screen hint stays accurate)
 *   2. server/src/db.ts's seedUsers() (so the login actually accepts it) —
 *      note seedUsers() only runs once, on an empty database, so you'll also
 *      need to update the row directly (or wipe the users table) if the
 *      database has already been seeded.
 * ============================================================================
 */

export interface DemoAccountHint {
  username: string
  password: string
  role: UserRole
  displayName: string
}

export const DEMO_ACCOUNTS: DemoAccountHint[] = [
  { username: 'student', password: '***REMOVED-SEED-PASSWORD***', role: 'student', displayName: 'Jordan Rivera' },
  { username: 'admin', password: '***REMOVED-SEED-PASSWORD***', role: 'admin', displayName: 'Admin User' },
]
