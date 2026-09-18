import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { config } from '../config.js'
import type { AuthenticatedUser, UserRole } from '../types.js'

export function signToken(user: AuthenticatedUser): string {
  return jwt.sign(user, config.jwtSecret, { expiresIn: '12h' })
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null

  if (!token) {
    res.status(401).json({ error: 'Missing or invalid Authorization header.' })
    return
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret) as AuthenticatedUser
    next()
  } catch {
    res.status(401).json({ error: 'Your session has expired. Please log in again.' })
  }
}

export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.user?.role !== role) {
      res.status(403).json({ error: `This action requires the "${role}" role.` })
      return
    }
    next()
  }
}
