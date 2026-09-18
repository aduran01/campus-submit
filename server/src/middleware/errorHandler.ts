import multer from 'multer'
import type { ErrorRequestHandler } from 'express'
import { config } from '../config.js'

/**
 * Central error handler. Multer's file-size limit throws before our route
 * handler runs at all, so it needs special-casing here rather than a normal
 * try/catch in the route — everything else falls back to a generic 500.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      error: `File is too large. Maximum allowed size is ${(config.maxUploadBytes / (1024 * 1024)).toFixed(0)} MB.`,
    })
    return
  }

  console.error(err)
  res.status(500).json({ error: 'Something went wrong on the server.' })
}
