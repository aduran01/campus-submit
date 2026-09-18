import type { Assignment, AssignmentInput } from '../types'
import { STORAGE_KEYS } from '../config/appConfig'
import { readLocal, writeLocal } from './storage'

function generateId(): string {
  return `assignment-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** Returns all assignments, soonest deadline first. */
export function getAssignments(): Assignment[] {
  return readLocal<Assignment[]>(STORAGE_KEYS.assignments, [])
    .slice()
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
}

export function getAssignmentById(id: string): Assignment | undefined {
  return readLocal<Assignment[]>(STORAGE_KEYS.assignments, []).find((a) => a.id === id)
}

export function createAssignment(input: AssignmentInput): Assignment {
  const now = new Date().toISOString()
  const assignment: Assignment = {
    id: generateId(),
    title: input.title.trim(),
    description: input.description.trim(),
    dueDate: input.dueDate,
    createdAt: now,
    updatedAt: now,
  }

  const all = readLocal<Assignment[]>(STORAGE_KEYS.assignments, [])
  all.push(assignment)
  writeLocal(STORAGE_KEYS.assignments, all)
  return assignment
}

export function updateAssignment(id: string, input: AssignmentInput): Assignment | null {
  const all = readLocal<Assignment[]>(STORAGE_KEYS.assignments, [])
  const index = all.findIndex((a) => a.id === id)
  if (index === -1) return null

  const updated: Assignment = {
    ...all[index],
    title: input.title.trim(),
    description: input.description.trim(),
    dueDate: input.dueDate,
    updatedAt: new Date().toISOString(),
  }
  all[index] = updated
  writeLocal(STORAGE_KEYS.assignments, all)
  return updated
}

export function deleteAssignment(id: string): void {
  const all = readLocal<Assignment[]>(STORAGE_KEYS.assignments, [])
  writeLocal(
    STORAGE_KEYS.assignments,
    all.filter((a) => a.id !== id),
  )
}
