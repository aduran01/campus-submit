import { useState } from 'react'
import type { Assignment, Submission } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { FileDropzone } from './FileDropzone'
import { validateFile } from '../../utils/fileUtils'
import { formatDueDate } from '../../utils/dateUtils'
import { isPastDue, recordSubmission } from '../../services/submissionService'
import { useAuth } from '../../context/AuthContext'
import styles from './SubmissionPanel.module.css'

interface SubmissionPanelProps {
  isOpen: boolean
  assignment: Assignment | null
  onClose: () => void
  onSubmitted: (submission: Submission) => void
}

// Simulated network delay so the loading state is visible without feeling sluggish.
const SIMULATED_SUBMIT_DELAY_MS = 900

export function SubmissionPanel({ isOpen, assignment, onClose, onSubmitted }: SubmissionPanelProps) {
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetAndClose() {
    if (isSubmitting) return // don't allow closing mid-submit
    setSelectedFile(null)
    setFileError(null)
    setFormError(null)
    onClose()
  }

  function handleFileSelected(file: File) {
    const result = validateFile(file)
    setSelectedFile(file)
    setFileError(result.valid ? null : result.error ?? 'That file cannot be used.')
    setFormError(null)
  }

  function handleFileRemoved() {
    setSelectedFile(null)
    setFileError(null)
  }

  async function handleSubmit() {
    if (!assignment || !user || isSubmitting) return // guard against duplicate/rapid clicks

    if (!selectedFile) {
      setFormError('Please attach a file before submitting.')
      return
    }
    if (fileError) {
      setFormError('Please resolve the file error above before submitting.')
      return
    }

    setFormError(null)
    setIsSubmitting(true)

    // Simulate the round-trip a real upload would take.
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_SUBMIT_DELAY_MS))

    const submission = recordSubmission({
      assignmentId: assignment.id,
      studentUsername: user.username,
      dueDate: assignment.dueDate,
      fileName: selectedFile.name,
      fileType: selectedFile.type,
      fileSize: selectedFile.size,
    })

    setIsSubmitting(false)
    setSelectedFile(null)
    setFileError(null)
    onSubmitted(submission)
  }

  if (!assignment) return null

  const overdue = isPastDue(assignment.dueDate)

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={`Submit: ${assignment.title}`}
      disableDismiss={isSubmitting}
      footer={
        <>
          <Button variant="secondary" onClick={resetAndClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit Assignment'}
          </Button>
        </>
      }
    >
      <p className={styles.dueDate}>
        Due {formatDueDate(assignment.dueDate)}
        {overdue && <span className={styles.overdueTag}>This assignment is past due — it will be marked late.</span>}
      </p>

      <FileDropzone
        selectedFile={selectedFile}
        onFileSelected={handleFileSelected}
        onFileRemoved={handleFileRemoved}
        error={fileError}
        disabled={isSubmitting}
      />

      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}

      <p className={styles.disclaimer}>
        This is a demo — your file stays in your browser and is never uploaded anywhere.
      </p>
    </Modal>
  )
}
