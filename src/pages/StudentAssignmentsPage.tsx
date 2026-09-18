import { useState } from 'react'
import { useAssignmentsData } from '../hooks/useAssignmentsData'
import type { Assignment, Submission } from '../types'
import { AssignmentCard } from '../components/assignments/AssignmentCard'
import { SubmissionPanel } from '../components/submission/SubmissionPanel'
import { CelebrationOverlay } from '../components/submission/CelebrationOverlay'
import { EmptyState } from '../components/ui/EmptyState'
import { PageLoading } from '../components/ui/PageLoading'
import styles from './StudentAssignmentsPage.module.css'

export function StudentAssignmentsPage() {
  const { assignments, submissions, isLoading, refresh } = useAssignmentsData()
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null)
  const [celebration, setCelebration] = useState<Submission | null>(null)

  function submissionFor(assignmentId: string): Submission | undefined {
    return submissions.find((s) => s.assignmentId === assignmentId)
  }

  async function handleSubmitted(submission: Submission) {
    setActiveAssignment(null)
    await refresh()
    setCelebration(submission)
  }

  if (isLoading) {
    return <PageLoading />
  }

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
        assignmentTitle={celebration?.assignmentTitle ?? ''}
        fileName={celebration?.fileName ?? null}
        submittedAt={celebration?.submittedAt ?? null}
        wasLate={celebration?.status === 'submitted_late'}
        onDismiss={() => setCelebration(null)}
      />
    </div>
  )
}
