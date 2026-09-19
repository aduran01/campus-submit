import pg from 'pg'
import { config } from './config.js'
import { hashPassword } from './utils/passwords.js'
import { buildDemoAssignments } from './utils/demoAssignments.js'

const { Pool } = pg

export const pool = new Pool({
  connectionString: config.databaseUrl,
  // Render/Neon-hosted Postgres require SSL for external connections; a
  // local Postgres on localhost does not use (or need) it.
  ssl: config.databaseUrl.includes('localhost') ? undefined : { rejectUnauthorized: false },
})

async function createSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
      display_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      due_date TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
      student_username TEXT NOT NULL REFERENCES users(username),
      status TEXT NOT NULL CHECK (status IN ('submitted', 'submitted_late')),
      submitted_at TIMESTAMPTZ NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_data BYTEA NOT NULL,
      UNIQUE (assignment_id, student_username)
    );
  `)
}

const STUDENT_USERNAME = 'crimbawa'
const LEGACY_STUDENT_USERNAME = 'student'

/**
 * Seeds the two demo accounts (idempotent — safe to call on every boot).
 * The student account is also re-synced on every boot, so an already-seeded
 * database picks up the current username/password, and any submissions made
 * under the old 'student' username are carried over to the new one.
 *
 * Seed passwords come from env vars (ADMIN_SEED_PASSWORD / STUDENT_SEED_PASSWORD
 * — see config.ts), never string literals, and are hashed immediately below;
 * only the bcrypt hash is ever written to the database.
 */
async function seedUsers(): Promise<void> {
  const [adminHash, studentHash] = await Promise.all([
    hashPassword(config.adminSeedPassword),
    hashPassword(config.studentSeedPassword),
  ])

  await pool.query(
    `INSERT INTO users (username, password_hash, role, display_name) VALUES ($1, $2, 'admin', $3)
     ON CONFLICT (username) DO NOTHING`,
    ['admin', adminHash, 'Admin User'],
  )

  await pool.query(
    `INSERT INTO users (username, password_hash, role, display_name) VALUES ($1, $2, 'student', $3)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [STUDENT_USERNAME, studentHash, 'Camille Rimbawa'],
  )

  await pool.query('UPDATE submissions SET student_username = $1 WHERE student_username = $2', [
    STUDENT_USERNAME,
    LEGACY_STUDENT_USERNAME,
  ])
  await pool.query("DELETE FROM users WHERE username = $1 AND role = 'student'", [LEGACY_STUDENT_USERNAME])
}

/** Seeds the demo assignments only if the table is completely empty (first boot). */
async function seedAssignmentsIfEmpty(): Promise<void> {
  const { rows } = await pool.query<{ count: string }>('SELECT count(*)::text FROM assignments')
  if (Number(rows[0].count) > 0) return
  await insertDemoAssignments()
}

async function insertDemoAssignments(): Promise<void> {
  for (const assignment of buildDemoAssignments()) {
    await pool.query(
      `INSERT INTO assignments (id, title, description, due_date) VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [assignment.id, assignment.title, assignment.description, assignment.dueDate],
    )
  }
}

/** Used by POST /api/admin/reset-demo-data — wipes submissions/assignments and re-seeds. */
export async function resetDemoData(): Promise<void> {
  await pool.query('DELETE FROM submissions')
  await pool.query('DELETE FROM assignments')
  await insertDemoAssignments()
}

export async function initDatabase(): Promise<void> {
  await createSchema()
  await seedUsers()
  await seedAssignmentsIfEmpty()
}
