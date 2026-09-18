/**
 * ============================================================================
 * APPLICATION CONFIGURATION
 * ============================================================================
 * Centralized, easy-to-edit knobs for the prototype. Nothing outside this
 * file should hardcode file-size limits, allowed file types, or storage keys.
 * ============================================================================
 */

export const APP_NAME = 'CampusSubmit'

export const FILE_UPLOAD_CONFIG = {
  /** Maximum accepted file size, in bytes. Change this to adjust the limit shown to students. */
  maxSizeBytes: 10 * 1024 * 1024, // 10 MB

  /** File extensions accepted by the attachment control (case-insensitive, must include the leading dot). */
  allowedExtensions: ['.pdf', '.doc', '.docx', '.txt', '.zip', '.png', '.jpg', '.jpeg'],
}

export const SUBMISSION_CONFIG = {
  /**
   * When true, assignments past their due date are shown as "Overdue" and a
   * new submission is recorded with a "submitted late" status instead of
   * "submitted". When false, due dates are informational only.
   */
  enforceDeadlines: true,
}

/**
 * localStorage / sessionStorage keys. Versioned with a suffix so a future
 * change to the stored data shape can bump the version without needing a
 * migration for this prototype's throwaway data.
 */
export const STORAGE_KEYS = {
  session: 'campus-submit.session.v1',
  assignments: 'campus-submit.assignments.v1',
  submissions: 'campus-submit.submissions.v1',
  seeded: 'campus-submit.seeded.v1',
}
