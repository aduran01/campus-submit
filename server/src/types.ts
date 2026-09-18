export type UserRole = 'admin' | 'student'

export interface AuthenticatedUser {
  username: string
  displayName: string
  role: UserRole
}

export interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  createdAt: string
  updatedAt: string
}

export type SubmissionStatus = 'submitted' | 'submitted_late'

/** A submission as returned by the API — never includes the file bytes (those are streamed separately from the /file route). */
export interface SubmissionSummary {
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

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
    }
  }
}
