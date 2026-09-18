import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import { pool } from '../db.js'
import { config } from '../config.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import type { SubmissionStatus, SubmissionSummary } from '../types.js'

interface SubmissionRow {
  id: string
  assignment_id: string
  assignment_title: string
  student_username: string
  student_display_name: string
  status: SubmissionStatus
  submitted_at: Date
  file_name: string
  file_type: string
  file_size: number
}

function toSummary(row: SubmissionRow): SubmissionSummary {
  return {
    id: row.id,
    assignmentId: row.assignment_id,
    assignmentTitle: row.assignment_title,
    studentUsername: row.student_username,
    studentDisplayName: row.student_display_name,
    status: row.status,
    submittedAt: row.submitted_at.toISOString(),
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: row.file_size,
  }
}

const SUMMARY_SELECT = `
  SELECT
    s.id, s.assignment_id, a.title AS assignment_title,
    s.student_username, u.display_name AS student_display_name,
    s.status, s.submitted_at, s.file_name, s.file_type, s.file_size
  FROM submissions s
  JOIN assignments a ON a.id = s.assignment_id
  JOIN users u ON u.username = s.student_username
`

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadBytes },
})

function generateId(): string {
  return `submission-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const submissionsRouter = Router()

submissionsRouter.use(requireAuth)

/** Admins see every submission; students see only their own. */
submissionsRouter.get('/', async (req, res) => {
  if (req.user!.role === 'admin') {
    const { rows } = await pool.query<SubmissionRow>(`${SUMMARY_SELECT} ORDER BY s.submitted_at DESC`)
    res.json(rows.map(toSummary))
    return
  }

  const { rows } = await pool.query<SubmissionRow>(
    `${SUMMARY_SELECT} WHERE s.student_username = $1 ORDER BY s.submitted_at DESC`,
    [req.user!.username],
  )
  res.json(rows.map(toSummary))
})

submissionsRouter.post('/', requireRole('student'), upload.single('file'), async (req, res) => {
  const assignmentId = (req.body as { assignmentId?: string }).assignmentId
  const file = req.file

  if (!assignmentId) {
    res.status(400).json({ error: 'Missing assignmentId.' })
    return
  }
  if (!file) {
    res.status(400).json({ error: 'Please attach a file before submitting.' })
    return
  }

  const ext = path.extname(file.originalname).toLowerCase()
  if (!config.allowedExtensions.includes(ext)) {
    res
      .status(400)
      .json({ error: `Unsupported file type "${ext || 'unknown'}". Allowed types: ${config.allowedExtensions.join(', ')}.` })
    return
  }

  const { rows: assignmentRows } = await pool.query<{ due_date: Date }>(
    'SELECT due_date FROM assignments WHERE id = $1',
    [assignmentId],
  )
  if (assignmentRows.length === 0) {
    res.status(404).json({ error: 'That assignment no longer exists.' })
    return
  }

  const now = new Date()
  const isLate = now.getTime() > assignmentRows[0].due_date.getTime()
  const status: SubmissionStatus = isLate ? 'submitted_late' : 'submitted'

  await pool.query(
    `INSERT INTO submissions (id, assignment_id, student_username, status, submitted_at, file_name, file_type, file_size, file_data)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (assignment_id, student_username) DO UPDATE SET
       status = EXCLUDED.status,
       submitted_at = EXCLUDED.submitted_at,
       file_name = EXCLUDED.file_name,
       file_type = EXCLUDED.file_type,
       file_size = EXCLUDED.file_size,
       file_data = EXCLUDED.file_data`,
    [generateId(), assignmentId, req.user!.username, status, now, file.originalname, file.mimetype, file.size, file.buffer],
  )

  const { rows } = await pool.query<SubmissionRow>(`${SUMMARY_SELECT} WHERE s.assignment_id = $1 AND s.student_username = $2`, [
    assignmentId,
    req.user!.username,
  ])
  res.status(201).json(toSummary(rows[0]))
})

/** Admins can download any submission's file; students can only download their own. */
submissionsRouter.get('/:id/file', async (req, res) => {
  const { rows } = await pool.query<{
    file_name: string
    file_type: string
    file_data: Buffer
    student_username: string
  }>('SELECT file_name, file_type, file_data, student_username FROM submissions WHERE id = $1', [req.params.id])

  const row = rows[0]
  if (!row) {
    res.status(404).json({ error: 'Submission not found.' })
    return
  }
  if (req.user!.role !== 'admin' && req.user!.username !== row.student_username) {
    res.status(403).json({ error: "You don't have access to this file." })
    return
  }

  res.setHeader('Content-Type', row.file_type || 'application/octet-stream')
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(row.file_name)}"`)
  res.send(row.file_data)
})
