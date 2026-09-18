import { useState } from 'react'
import type { Assignment, Submission } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { FileDropzone } from './FileDropzone'
import { validateFile } from '../../utils/fileUtils'
import { formatDueDate } from '../../utils/dateUtils'
import { isPastDue, submitAssignment } from '../../services/submissionService'
import { ApiError } from '../../services/apiClient'
import styles from './SubmissionPanel.module.css'

interface SubmissionPanelProps {
  isOpen: boolean
  assignment: Assignment | null
  onClose: () => void
  onSubmitted: (submission: Submission) => void
}

export function SubmissionPanel({ isOpen, assignment, onClose, onSubmitted }: SubmissionPanelProps) {
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
    if (!assignment || isSubmitting) return // guard against duplicate/rapid clicks

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

    try {
      const submission = await submitAssignment(assignment.id, selectedFile)
      setSelectedFile(null)
      setFileError(null)
      onSubmitted(submission)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Something went wrong submitting this. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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

      <p className={styles.disclaimer}>Your instructor will be able to see and download this file.</p>
    </Modal>
  )
}
