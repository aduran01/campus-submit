import type { Assignment } from '../types.js'

function isoDaysFromNow(daysFromNow: number, hour: number, minute: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

/**
 * Same seed data the frontend used to generate locally before this backend
 * existed — kept here so a fresh database starts in the same demo-friendly
 * state (a few upcoming assignments plus one intentionally overdue one).
 */
export function buildDemoAssignments(): Array<Omit<Assignment, 'createdAt' | 'updatedAt'>> {
  return [
    {
      id: 'assignment-demo-intro-systems',
      title: 'Introduction to Computer Systems',
      description:
        'Submit a short written summary (1–2 pages) covering the topics from Weeks 1–3: binary representation, the CPU fetch-decode-execute cycle, and the memory hierarchy.',
      dueDate: isoDaysFromNow(12, 23, 59),
    },
    {
      id: 'assignment-demo-networking',
      title: 'Networking Fundamentals',
      description:
        'Complete the lab worksheet on the OSI model and TCP/IP stack, then submit your written answers along with your packet-capture screenshots.',
      dueDate: isoDaysFromNow(20, 23, 59),
    },
    {
      id: 'assignment-demo-final-project',
      title: 'Final Project Submission',
      description:
        'Submit your final project deliverable, including your source files and a short write-up describing your design decisions and how to run your project.',
      dueDate: isoDaysFromNow(45, 23, 59),
    },
    {
      id: 'assignment-demo-practice-overdue',
      title: 'Practice Exercise (Past Due Example)',
      description:
        'This assignment is intentionally past its deadline so you can see how CampusSubmit displays an overdue assignment and a late submission.',
      dueDate: isoDaysFromNow(-3, 23, 59),
    },
  ]
}
