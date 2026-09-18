import type { ReactNode } from 'react'
import type { Assignment, Submission } from '../../types'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatDueDate, formatTimestamp, getRelativeDueLabel } from '../../utils/dateUtils'
import { isPastDue } from '../../services/submissionService'
import styles from './AssignmentCard.module.css'

interface AssignmentCardProps {
  assignment: Assignment
  submission?: Submission
  onSubmitClick: (assignment: Assignment) => void
}

export function AssignmentCard({ assignment, submission, onSubmitClick }: AssignmentCardProps) {
  const overdue = isPastDue(assignment.dueDate)
  const hasSubmitted = submission?.status === 'submitted' || submission?.status === 'submitted_late'

  let statusNode: ReactNode
  if (submission?.status === 'submitted') {
    statusNode = <Badge tone="success">Submitted</Badge>
  } else if (submission?.status === 'submitted_late') {
    statusNode = <Badge tone="warning">Submitted (Late)</Badge>
  } else if (overdue) {
    statusNode = <Badge tone="danger">Overdue</Badge>
  } else {
    statusNode = <Badge tone="neutral">Not Submitted</Badge>
  }

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{assignment.title}</h3>
          {assignment.description && <p className={styles.description}>{assignment.description}</p>}
        </div>
        {statusNode}
      </div>

      <div className={styles.meta}>
        <div className={styles.metaBlock}>
          <span className={styles.metaLabel}>Due</span>
          <span className={styles.metaValue}>{formatDueDate(assignment.dueDate)}</span>
          <span className={overdue && !hasSubmitted ? styles.overdueLabel : styles.relativeLabel}>
            {getRelativeDueLabel(assignment.dueDate)}
          </span>
        </div>

        {hasSubmitted && submission?.submittedAt && (
          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>Submitted</span>
            <span className={styles.metaValue}>{formatTimestamp(submission.submittedAt)}</span>
            {submission.fileName && <span className={styles.relativeLabel}>{submission.fileName}</span>}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <Button variant={hasSubmitted ? 'secondary' : 'primary'} onClick={() => onSubmitClick(assignment)}>
          {hasSubmitted ? 'Resubmit Assignment' : 'Submit Assignment'}
        </Button>
      </div>
    </Card>
  )
}
