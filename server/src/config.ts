import 'dotenv/config'

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  /** Plaintext seed passwords for the two demo accounts — read once at boot and immediately bcrypt-hashed (see db.ts's seedUsers()). Never hardcode these; set them as env vars (Render dashboard in production, server/.env locally). */
  adminSeedPassword: required('ADMIN_SEED_PASSWORD'),
  studentSeedPassword: required('STUDENT_SEED_PASSWORD'),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  /** Matches the client-side FILE_UPLOAD_CONFIG in the frontend — kept in sync manually since these are two separate apps. */
  maxUploadBytes: 10 * 1024 * 1024,
  allowedExtensions: ['.pdf', '.doc', '.docx', '.txt', '.zip', '.png', '.jpg', '.jpeg'],
}
