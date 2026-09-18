/**
 * Shared data model for the CampusSubmit frontend.
 *
 * These mirror the backend's response shapes (see `server/src/types.ts`) —
 * assignments and submissions live on the server now, fetched via
 * `services/apiClient.ts`. Only the auth session is still stored client-side
 * (see `services/tokenStorage.ts`).
 */

export type UserRole = 'admin' | 'student'

/** The authenticated user, decoded from the signed-in session's JWT. */
export interface AuthenticatedUser {
  username: string
  displayName: string
  role: UserRole
}

/** An assignment created by an admin and visible to every student. */
export interface Assignment {
  id: string
  title: string
  description: string
  /** ISO 8601 datetime string, e.g. "2026-10-15T23:59:00.000Z". */
  dueDate: string
  createdAt: string
  updatedAt: string
}

/** Fields an admin supplies when creating or editing an assignment. */
export interface AssignmentInput {
  title: string
  description: string
  dueDate: string
}

export type SubmissionStatus = 'submitted' | 'submitted_late'

/**
 * A student's submission for one assignment, as returned by the API. There
 * is no "not_submitted" status here — the server only ever returns records
 * that exist; the UI treats the absence of a Submission for a given
 * assignment as "not submitted" (see AssignmentCard).
 */
export interface Submission {
  id: string
  assignmentId: string
  assignmentTitle: string
  studentUsername: string
  studentDisplayName: string
  status: SubmissionStatus
  submittedAt: string
  fileName: string
  fileType: string
  fileSize: number
}

/** Generic result wrapper used by the service layer. */
export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
}
