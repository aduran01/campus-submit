import type { Submission, SubmissionStatus } from '../types'
import { STORAGE_KEYS, SUBMISSION_CONFIG } from '../config/appConfig'
import { readLocal, writeLocal } from './storage'

function generateId(): string {
  return `submission-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** Returns whether `dueDate` has already passed, honoring the `enforceDeadlines` config flag. */
export function isPastDue(dueDate: string): boolean {
  if (!SUBMISSION_CONFIG.enforceDeadlines) return false
  return Date.now() > new Date(dueDate).getTime()
}

export function getAllSubmissions(): Submission[] {
  return readLocal<Submission[]>(STORAGE_KEYS.submissions, [])
}

export function getSubmission(assignmentId: string, studentUsername: string): Submission | undefined {
  return getAllSubmissions().find((s) => s.assignmentId === assignmentId && s.studentUsername === studentUsername)
}

export function getSubmissionsForStudent(studentUsername: string): Submission[] {
  return getAllSubmissions().filter((s) => s.studentUsername === studentUsername)
}

/** Number of submissions recorded for a given assignment, across all students. Used by the admin dashboard. */
export function countSubmissionsForAssignment(assignmentId: string): number {
  return getAllSubmissions().filter((s) => s.assignmentId === assignmentId && s.status !== 'not_submitted').length
}

export interface RecordSubmissionInput {
  assignmentId: string
  studentUsername: string
  dueDate: string
  fileName: string
  fileType: string
  fileSize: number
}

/**
 * Records a simulated submission. No file is ever transmitted anywhere —
 * this only persists metadata about the file the student selected
 * (name/type/size) plus a timestamp, standing in for what a real backend
 * would record after actually storing the upload.
 */
export function recordSubmission(input: RecordSubmissionInput): Submission {
  const now = new Date()
  const late = SUBMISSION_CONFIG.enforceDeadlines && now.getTime() > new Date(input.dueDate).getTime()
  const status: SubmissionStatus = late ? 'submitted_late' : 'submitted'

  const all = getAllSubmissions()
  const existingIndex = all.findIndex(
    (s) => s.assignmentId === input.assignmentId && s.studentUsername === input.studentUsername,
  )

  const submission: Submission = {
    id: existingIndex >= 0 ? all[existingIndex].id : generateId(),
    assignmentId: input.assignmentId,
    studentUsername: input.studentUsername,
    status,
    submittedAt: now.toISOString(),
    fileName: input.fileName,
    fileType: input.fileType || 'unknown',
    fileSize: input.fileSize,
  }

  if (existingIndex >= 0) {
    all[existingIndex] = submission
  } else {
    all.push(submission)
  }

  writeLocal(STORAGE_KEYS.submissions, all)
  return submission
}

/** Removes every submission tied to an assignment. Called when that assignment is deleted. */
export function deleteSubmissionsForAssignment(assignmentId: string): void {
  const all = getAllSubmissions()
  writeLocal(
    STORAGE_KEYS.submissions,
    all.filter((s) => s.assignmentId !== assignmentId),
  )
}
