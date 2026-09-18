import { useState } from 'react'
import { useAssignmentsData } from '../hooks/useAssignmentsData'
import { downloadSubmissionFile } from '../services/submissionService'
import { ApiError } from '../services/apiClient'
import { useToast } from '../context/ToastContext'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { PageLoading } from '../components/ui/PageLoading'
import { formatTimestamp } from '../utils/dateUtils'
import { formatFileSize } from '../utils/fileUtils'
import type { Submission } from '../types'
import styles from './AdminSubmissionsPage.module.css'

export function AdminSubmissionsPage() {
  const { showToast } = useToast()
  const { submissions, isLoading } = useAssignmentsData()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  async function handleDownload(submission: Submission) {
    setDownloadingId(submission.id)
    try {
      await downloadSubmissionFile(submission)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to download this file.', 'error')
    } finally {
      setDownloadingId(null)
    }
  }

  if (isLoading) {
    return <PageLoading />
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Submissions</h1>
        <p className={styles.subtitle}>Every submission received, across every assignment and student.</p>
      </header>

      {submissions.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          description="Once a student submits an assignment, it will show up here with a download link."
        />
      ) : (
        <div className={styles.list}>
          {submissions.map((submission) => (
            <Card key={submission.id} className={styles.row}>
              <div className={styles.info}>
                <div className={styles.titleLine}>
                  <h3 className={styles.assignmentTitle}>{submission.assignmentTitle}</h3>
                  <Badge tone={submission.status === 'submitted_late' ? 'warning' : 'success'}>
                    {submission.status === 'submitted_late' ? 'Submitted (Late)' : 'Submitted'}
                  </Badge>
                </div>
                <p className={styles.studentLine}>
                  {submission.studentDisplayName} <span className={styles.dot}>•</span> @{submission.studentUsername}
                </p>
                <p className={styles.fileLine}>
                  {submission.fileName} ({formatFileSize(submission.fileSize)}) <span className={styles.dot}>•</span>{' '}
                  Submitted {formatTimestamp(submission.submittedAt)}
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownload(submission)}
                isLoading={downloadingId === submission.id}
              >
                Download
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
