import { useState } from 'react'
import { Link } from 'react-router-dom'
import { updateAssignment, deleteAssignment } from '../services/assignmentService'
import { resetDemoData } from '../services/adminService'
import { ApiError } from '../services/apiClient'
import { useAssignmentsData } from '../hooks/useAssignmentsData'
import type { Assignment, AssignmentInput } from '../types'
import { AdminAssignmentRow } from '../components/assignments/AdminAssignmentRow'
import { AssignmentForm } from '../components/assignments/AssignmentForm'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { PageLoading } from '../components/ui/PageLoading'
import { useToast } from '../context/ToastContext'
import styles from './AdminAssignmentsPage.module.css'

export function AdminAssignmentsPage() {
  const { showToast } = useToast()
  const { assignments, submissions, isLoading, refresh } = useAssignmentsData()
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  function submissionCountFor(assignmentId: string): number {
    return submissions.filter((s) => s.assignmentId === assignmentId).length
  }

  async function handleEditSubmit(input: AssignmentInput) {
    if (!editingAssignment) return
    setIsSaving(true)
    try {
      await updateAssignment(editingAssignment.id, input)
      setEditingAssignment(null)
      await refresh()
      showToast('Assignment updated.', 'success')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to update the assignment.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deletingAssignment) return
    try {
      await deleteAssignment(deletingAssignment.id)
      setDeletingAssignment(null)
      await refresh()
      showToast('Assignment deleted.', 'success')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to delete the assignment.', 'error')
    }
  }

  async function confirmReset() {
    try {
      await resetDemoData()
      setIsResetConfirmOpen(false)
      await refresh()
      showToast('Demo data has been reset for everyone.', 'success')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to reset demo data.', 'error')
    }
  }

  if (isLoading) {
    return <PageLoading />
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Assignments</h1>
          <p className={styles.subtitle}>Create, edit, and manage the assignments students see.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" size="sm" onClick={() => setIsResetConfirmOpen(true)}>
            Reset Demo Data
          </Button>
          <Link to="/assignments/new" className={styles.ctaLink}>
            + New Assignment
          </Link>
        </div>
      </header>

      {assignments.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="Create your first assignment and it will immediately become visible to students."
          action={
            <Link to="/assignments/new" className={styles.ctaLink}>
              + New Assignment
            </Link>
          }
        />
      ) : (
        <div className={styles.list}>
          {assignments.map((assignment) => (
            <AdminAssignmentRow
              key={assignment.id}
              assignment={assignment}
              submissionCount={submissionCountFor(assignment.id)}
              onEdit={setEditingAssignment}
              onDelete={setDeletingAssignment}
            />
          ))}
        </div>
      )}

      <Modal isOpen={editingAssignment !== null} onClose={() => setEditingAssignment(null)} title="Edit Assignment">
        {editingAssignment && (
          <AssignmentForm
            initialAssignment={editingAssignment}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingAssignment(null)}
            submitLabel="Save Changes"
            isSaving={isSaving}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deletingAssignment !== null}
        title="Delete assignment?"
        message={`This will permanently delete "${deletingAssignment?.title}" and any student submissions for it, for every student. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeletingAssignment(null)}
      />

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset demo data?"
        message="This restores the original demo assignments and clears every submission — for every device, not just this one. This cannot be undone."
        confirmLabel="Reset"
        danger
        onConfirm={confirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  )
}
