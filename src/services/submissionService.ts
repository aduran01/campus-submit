import type { Submission } from '../types'
import { apiClient, fetchAuthorizedBlob } from './apiClient'

/**
 * Returns submissions scoped to whoever is signed in: the server sends back
 * every submission for an admin, or only the caller's own for a student —
 * same endpoint, role-aware response, so the frontend doesn't need two
 * separate functions.
 */
export function getSubmissions(): Promise<Submission[]> {
  return apiClient.get<Submission[]>('/api/submissions')
}

export async function submitAssignment(assignmentId: string, file: File): Promise<Submission> {
  const formData = new FormData()
  formData.append('assignmentId', assignmentId)
  formData.append('file', file)
  return apiClient.post<Submission>('/api/submissions', formData)
}

/** Triggers a browser download of a submission's file — a plain <a href> can't attach the auth header this needs, so this fetches the bytes first. */
export async function downloadSubmissionFile(submission: Submission): Promise<void> {
  const blob = await fetchAuthorizedBlob(`/api/submissions/${submission.id}/file`)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = submission.fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/** Purely a client-side display hint (e.g. the "Overdue" badge before a submission exists) — the server independently decides submitted vs. submitted_late when it records a real submission. */
export function isPastDue(dueDate: string): boolean {
  return Date.now() > new Date(dueDate).getTime()
}
