import type { Assignment } from '../../types'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { formatDueDate, getRelativeDueLabel } from '../../utils/dateUtils'
import { isPastDue } from '../../services/submissionService'
import styles from './AdminAssignmentRow.module.css'

interface AdminAssignmentRowProps {
  assignment: Assignment
  submissionCount: number
  onEdit: (assignment: Assignment) => void
  onDelete: (assignment: Assignment) => void
}

export function AdminAssignmentRow({ assignment, submissionCount, onEdit, onDelete }: AdminAssignmentRowProps) {
  const overdue = isPastDue(assignment.dueDate)

  return (
    <Card className={styles.row}>
      <div className={styles.info}>
        <h3 className={styles.title}>{assignment.title}</h3>
        {assignment.description && <p className={styles.description}>{assignment.description}</p>}
        <div className={styles.metaLine}>
          <span>Due {formatDueDate(assignment.dueDate)}</span>
          <span className={styles.dot}>•</span>
          <span className={overdue ? styles.overdue : undefined}>{getRelativeDueLabel(assignment.dueDate)}</span>
          <span className={styles.dot}>•</span>
          <span>
            {submissionCount} submission{submissionCount === 1 ? '' : 's'} received
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" size="sm" onClick={() => onEdit(assignment)}>
          Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(assignment)}>
          Delete
        </Button>
      </div>
    </Card>
  )
}
