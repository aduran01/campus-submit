import type { Assignment } from '../types'
import { STORAGE_KEYS } from '../config/appConfig'
import { readLocal, writeLocal } from './storage'

/** Returns an ISO datetime string `daysFromNow` days from this moment, at the given local hour/minute. */
function isoDaysFromNow(daysFromNow: number, hour: number, minute: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

/**
 * Builds a fresh set of demo assignments, timestamped relative to "now" so
 * the demo always shows sensible upcoming (and one intentionally overdue)
 * due dates no matter when the app is actually run.
 */
function buildDemoAssignments(): Assignment[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'assignment-demo-intro-systems',
      title: 'Introduction to Computer Systems',
      description:
        'Submit a short written summary (1–2 pages) covering the topics from Weeks 1–3: binary representation, the CPU fetch-decode-execute cycle, and the memory hierarchy.',
      dueDate: isoDaysFromNow(12, 23, 59),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'assignment-demo-networking',
      title: 'Networking Fundamentals',
      description:
        'Complete the lab worksheet on the OSI model and TCP/IP stack, then submit your written answers along with your packet-capture screenshots.',
      dueDate: isoDaysFromNow(20, 23, 59),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'assignment-demo-final-project',
      title: 'Final Project Submission',
      description:
        'Submit your final project deliverable, including your source files and a short write-up describing your design decisions and how to run your project.',
      dueDate: isoDaysFromNow(45, 23, 59),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'assignment-demo-practice-overdue',
      title: 'Practice Exercise (Past Due Example)',
      description:
        'This assignment is intentionally past its deadline so you can see how CampusSubmit displays an overdue assignment and a late submission.',
      dueDate: isoDaysFromNow(-3, 23, 59),
      createdAt: now,
      updatedAt: now,
    },
  ]
}

/** Seeds demo assignments the very first time the app runs in a browser. Never overwrites existing data. */
export function ensureDemoDataSeeded(): void {
  const alreadySeeded = readLocal<boolean>(STORAGE_KEYS.seeded, false)
  if (alreadySeeded) return

  writeLocal(STORAGE_KEYS.assignments, buildDemoAssignments())
  writeLocal(STORAGE_KEYS.submissions, [])
  writeLocal(STORAGE_KEYS.seeded, true)
}

/**
 * Restores the demo assignments to their original state and clears all
 * submissions. Destructive and intended to be triggered explicitly by an
 * admin (see the "Reset Demo Data" action on the admin Assignments page).
 */
export function resetDemoData(): void {
  writeLocal(STORAGE_KEYS.assignments, buildDemoAssignments())
  writeLocal(STORAGE_KEYS.submissions, [])
  writeLocal(STORAGE_KEYS.seeded, true)
}
