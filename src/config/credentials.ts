import type { UserRole } from '../types'

/**
 * ============================================================================
 * DEMO CREDENTIALS — EDIT THIS FILE TO CHANGE WHO CAN LOG IN
 * ============================================================================
 * This is the ONLY place in the codebase that defines valid logins. Add,
 * remove, or edit entries in `DEMO_USERS` and the rest of the app (login
 * page, role-based routing, nav) picks it up automatically.
 *
 * Passwords are never stored or compared as plaintext. Each record stores a
 * SHA-256 hash (hex-encoded) of the password. When someone logs in, the app
 * hashes what they typed with the Web Crypto API and compares the resulting
 * hex string against `passwordHash` (see `src/services/authService.ts`).
 *
 * HOW TO CHANGE A DEMO PASSWORD
 * ------------------------------------------------------------------------
 * 1. Run the app locally (`npm run dev`) and open it in a browser.
 * 2. Open DevTools → Console and run:
 *
 *      await window.__hashPassword('your-new-password')
 *
 * 3. Copy the 64-character hex string it prints and paste it below as the
 *    `passwordHash` for the account you're changing.
 *
 * (`window.__hashPassword` only exists in dev builds — see `src/main.tsx`.)
 *
 * SECURITY NOTE — READ THIS
 * ------------------------------------------------------------------------
 * Hashing here happens entirely in the visitor's browser and exists only to
 * avoid keeping plaintext passwords in this file / in memory. It is NOT
 * real authentication:
 *   - There is no server to keep a secret from the client, so anyone can
 *     open DevTools, read this file from the bundled source, or simply
 *     inspect/patch the running JavaScript to bypass the check entirely.
 *   - There is no salting, so identical passwords produce identical hashes
 *     and the hashes below are vulnerable to precomputed ("rainbow table")
 *     lookups.
 *   - Do not reuse a real password here, and do not treat this scheme as
 *     adequate for anything beyond a local demo.
 * See the README's "Prototype & Security Limitations" section for what a
 * production login would need instead.
 * ============================================================================
 */

export interface DemoUserRecord {
  username: string
  /** SHA-256 hex digest of the account's password. Never the plaintext password. */
  passwordHash: string
  role: UserRole
  displayName: string
}

export const DEMO_USERS: DemoUserRecord[] = [
  {
    username: 'student',
    // password: ***REMOVED-SEED-PASSWORD***
    passwordHash: '***REMOVED-HASH***',
    role: 'student',
    displayName: 'Jordan Rivera',
  },
  {
    username: 'admin',
    // password: ***REMOVED-SEED-PASSWORD***
    passwordHash: '***REMOVED-HASH***',
    role: 'admin',
    displayName: 'Admin User',
  },
]
