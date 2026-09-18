/**
 * Shared data model for the CampusSubmit prototype.
 *
 * These types describe the shape of data the app works with today (stored
 * in the browser via `services/storage.ts`). If this prototype is ever
 * connected to a real backend, these are a reasonable starting point for the
 * API's request/response DTOs — the field names and semantics shouldn't need
 * to change much, even though *where the data lives* would.
 */

export type UserRole = 'admin' | 'student'

/** The authenticated user as tracked for the current browser session. */
export interface AuthenticatedUser {
  username: string
  displayName: string
  role: UserRole
}

/** An assignment created by an admin and visible to students. */
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

export type SubmissionStatus = 'not_submitted' | 'submitted' | 'submitted_late'

/**
 * A student's submission record for one assignment. The prototype never
 * stores the actual file — only metadata about it — since no file is ever
 * uploaded anywhere (see README "Prototype Limitations").
 */
export interface Submission {
  id: string
  assignmentId: string
  studentUsername: string
  status: SubmissionStatus
  /** ISO 8601 datetime string, set the moment the simulated submission completes. */
  submittedAt: string | null
  fileName: string | null
  fileType: string | null
  fileSize: number | null
}

/** Generic result wrapper used by the service layer. */
export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
}
