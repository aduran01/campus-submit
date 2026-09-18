import { Router } from 'express'
import { resetDemoData } from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const adminRouter = Router()

adminRouter.use(requireAuth, requireRole('admin'))

adminRouter.post('/reset-demo-data', async (_req, res) => {
  await resetDemoData()
  res.status(204).end()
})
