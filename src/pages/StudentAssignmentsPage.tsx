import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAssignments } from '../services/assignmentService'
import { getSubmissionsForStudent } from '../services/submissionService'
import type { Assignment, Submission } from '../types'
import { AssignmentCard } from '../components/assignments/AssignmentCard'
import { SubmissionPanel } from '../components/submission/SubmissionPanel'
import { CelebrationOverlay } from '../components/submission/CelebrationOverlay'
import { EmptyState } from '../components/ui/EmptyState'
import styles from './StudentAssignmentsPage.module.css'

export function StudentAssignmentsPage() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null)
  const [celebration, setCelebration] = useState<Submission | null>(null)

  function refresh() {
    if (!user) return
    setAssignments(getAssignments())
    setSubmissions(getSubmissionsForStudent(user.username))
  }

  useEffect(refresh, [user])

  function submissionFor(assignmentId: string): Submission | undefined {
    return submissions.find((s) => s.assignmentId === assignmentId)
  }

  function handleSubmitted(submission: Submission) {
    setActiveAssignment(null)
    refresh()
    setCelebration(submission)
  }

  const celebratedAssignment = celebration ? assignments.find((a) => a.id === celebration.assignmentId) : null

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Assignments</h1>
        <p className={styles.subtitle}>Review what's due and submit your work below.</p>
      </header>

      {assignments.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="Your instructor hasn't posted any assignments. Check back soon."
        />
      ) : (
        <div className={styles.list}>
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              submission={submissionFor(assignment.id)}
              onSubmitClick={setActiveAssignment}
            />
          ))}
        </div>
      )}

      <SubmissionPanel
        isOpen={activeAssignment !== null}
        assignment={activeAssignment}
        onClose={() => setActiveAssignment(null)}
        onSubmitted={handleSubmitted}
      />

      <CelebrationOverlay
        isOpen={celebration !== null}
        assignmentTitle={celebratedAssignment?.title ?? ''}
        fileName={celebration?.fileName ?? null}
        submittedAt={celebration?.submittedAt ?? null}
        wasLate={celebration?.status === 'submitted_late'}
        onDismiss={() => setCelebration(null)}
      />
    </div>
  )
}
