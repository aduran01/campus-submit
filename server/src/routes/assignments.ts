import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import type { Assignment } from '../types.js'

interface AssignmentRow {
  id: string
  title: string
  description: string
  due_date: Date
  created_at: Date
  updated_at: Date
}

function toAssignment(row: AssignmentRow): Assignment {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date.toISOString(),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

function generateId(): string {
  return `assignment-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function validateInput(body: unknown): { title: string; description: string; dueDate: string } | null {
  const input = body as { title?: unknown; description?: unknown; dueDate?: unknown }
  const title = typeof input.title === 'string' ? input.title.trim() : ''
  const description = typeof input.description === 'string' ? input.description.trim() : ''
  const dueDate = typeof input.dueDate === 'string' ? input.dueDate : ''

  if (!title || title.length > 120) return null
  if (!dueDate || Number.isNaN(new Date(dueDate).getTime())) return null
  if (description.length > 2000) return null

  return { title, description, dueDate }
}

export const assignmentsRouter = Router()

assignmentsRouter.use(requireAuth)

assignmentsRouter.get('/', async (_req, res) => {
  const { rows } = await pool.query<AssignmentRow>('SELECT * FROM assignments ORDER BY due_date ASC')
  res.json(rows.map(toAssignment))
})

assignmentsRouter.post('/', requireRole('admin'), async (req, res) => {
  const input = validateInput(req.body)
  if (!input) {
    res.status(400).json({ error: 'Assignment name and a valid due date are required.' })
    return
  }

  const { rows } = await pool.query<AssignmentRow>(
    `INSERT INTO assignments (id, title, description, due_date) VALUES ($1, $2, $3, $4) RETURNING *`,
    [generateId(), input.title, input.description, input.dueDate],
  )
  res.status(201).json(toAssignment(rows[0]))
})

assignmentsRouter.put('/:id', requireRole('admin'), async (req, res) => {
  const input = validateInput(req.body)
  if (!input) {
    res.status(400).json({ error: 'Assignment name and a valid due date are required.' })
    return
  }

  const { rows } = await pool.query<AssignmentRow>(
    `UPDATE assignments SET title = $1, description = $2, due_date = $3, updated_at = now()
     WHERE id = $4 RETURNING *`,
    [input.title, input.description, input.dueDate, req.params.id],
  )

  if (rows.length === 0) {
    res.status(404).json({ error: 'Assignment not found.' })
    return
  }
  res.json(toAssignment(rows[0]))
})

assignmentsRouter.delete('/:id', requireRole('admin'), async (req, res) => {
  await pool.query('DELETE FROM assignments WHERE id = $1', [req.params.id])
  res.status(204).end()
})
