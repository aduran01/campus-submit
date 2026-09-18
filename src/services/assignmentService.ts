import type { Assignment, AssignmentInput } from '../types'
import { apiClient } from './apiClient'

export function getAssignments(): Promise<Assignment[]> {
  return apiClient.get<Assignment[]>('/api/assignments')
}

export function createAssignment(input: AssignmentInput): Promise<Assignment> {
  return apiClient.post<Assignment>('/api/assignments', input)
}

export function updateAssignment(id: string, input: AssignmentInput): Promise<Assignment> {
  return apiClient.put<Assignment>(`/api/assignments/${id}`, input)
}

export function deleteAssignment(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/assignments/${id}`)
}
