import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { initDatabase } from './db.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authRouter } from './routes/auth.js'
import { assignmentsRouter } from './routes/assignments.js'
import { submissionsRouter } from './routes/submissions.js'
import { adminRouter } from './routes/admin.js'

async function main() {
  await initDatabase()

  const app = express()

  app.use(
    cors({
      origin: config.corsOrigins,
      // Not currently read by the frontend (it sets the download filename
      // itself from the JSON response instead), but exposing it keeps the
      // header meaningful for any client that opens the file URL directly.
      exposedHeaders: ['Content-Disposition'],
    }),
  )
  app.use(express.json())

  // Render's free tier spins the service down after 15 min idle; this lets
  // the frontend (and you, manually) check whether the server is awake yet.
  app.get('/health', (_req, res) => res.json({ status: 'ok' }))

  app.use('/api/auth', authRouter)
  app.use('/api/assignments', assignmentsRouter)
  app.use('/api/submissions', submissionsRouter)
  app.use('/api/admin', adminRouter)

  app.use(errorHandler)

  app.listen(config.port, () => {
    console.log(`CampusSubmit API listening on port ${config.port}`)
  })
}

main().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
