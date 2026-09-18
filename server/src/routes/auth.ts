import { Router } from 'express'
import { pool } from '../db.js'
import { verifyPassword } from '../utils/passwords.js'
import { signToken } from '../middleware/auth.js'
import type { AuthenticatedUser, UserRole } from '../types.js'

interface UserRow {
  username: string
  password_hash: string
  role: UserRole
  display_name: string
}

export const authRouter = Router()

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string }

  if (!username?.trim() || !password) {
    res.status(400).json({ error: 'Please enter both a username and a password.' })
    return
  }

  const { rows } = await pool.query<UserRow>('SELECT * FROM users WHERE lower(username) = lower($1)', [
    username.trim(),
  ])
  const row = rows[0]

  if (!row || !(await verifyPassword(password, row.password_hash))) {
    res.status(401).json({ error: 'Invalid username or password.' })
    return
  }

  const user: AuthenticatedUser = { username: row.username, displayName: row.display_name, role: row.role }
  res.json({ token: signToken(user), user })
})
