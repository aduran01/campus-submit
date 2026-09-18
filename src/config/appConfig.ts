/**
 * ============================================================================
 * APPLICATION CONFIGURATION
 * ============================================================================
 * Centralized, easy-to-edit knobs for the app. Nothing outside this file
 * should hardcode the API URL, file-size limits, allowed file types, or
 * storage keys.
 * ============================================================================
 */

export const APP_NAME = 'CampusSubmit'

/**
 * The backend API's base URL. Set via the VITE_API_URL build-time env var
 * (see .env.development / .env.production); falls back to the local dev
 * server address if unset.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export const FILE_UPLOAD_CONFIG = {
  /** Maximum accepted file size, in bytes. Must match server/src/config.ts's maxUploadBytes — the server is the authority; this just gives fast client-side feedback. */
  maxSizeBytes: 10 * 1024 * 1024, // 10 MB

  /** File extensions accepted by the attachment control (case-insensitive, must include the leading dot). Must match server/src/config.ts's allowedExtensions. */
  allowedExtensions: ['.pdf', '.doc', '.docx', '.txt', '.zip', '.png', '.jpg', '.jpeg'],
}

/** localStorage keys — only the auth session lives client-side now; assignments/submissions live on the server. */
export const STORAGE_KEYS = {
  authToken: 'campus-submit.auth-token.v1',
  authUser: 'campus-submit.auth-user.v1',
}
