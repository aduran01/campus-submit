import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAssignments, updateAssignment, deleteAssignment } from '../services/assignmentService'
import { countSubmissionsForAssignment, deleteSubmissionsForAssignment } from '../services/submissionService'
import { resetDemoData } from '../services/demoData'
import type { Assignment, AssignmentInput } from '../types'
import { AdminAssignmentRow } from '../components/assignments/AdminAssignmentRow'
import { AssignmentForm } from '../components/assignments/AssignmentForm'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { useToast } from '../context/ToastContext'
import styles from './AdminAssignmentsPage.module.css'

export function AdminAssignmentsPage() {
  const { showToast } = useToast()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  function refresh() {
    setAssignments(getAssignments())
  }

  useEffect(refresh, [])

  function handleEditSubmit(input: AssignmentInput) {
    if (!editingAssignment) return
    setIsSaving(true)
    updateAssignment(editingAssignment.id, input)
    setIsSaving(false)
    setEditingAssignment(null)
    refresh()
    showToast('Assignment updated.', 'success')
  }

  function confirmDelete() {
    if (!deletingAssignment) return
    deleteAssignment(deletingAssignment.id)
    deleteSubmissionsForAssignment(deletingAssignment.id)
    setDeletingAssignment(null)
    refresh()
    showToast('Assignment deleted.', 'success')
  }

  function confirmReset() {
    resetDemoData()
    setIsResetConfirmOpen(false)
    refresh()
    showToast('Demo data has been reset.', 'success')
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
              submissionCount={countSubmissionsForAssignment(assignment.id)}
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
        message={`This will permanently delete "${deletingAssignment?.title}" and any student submissions for it. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeletingAssignment(null)}
      />

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset demo data?"
        message="This restores the original demo assignments and clears every submission. Useful before a fresh demo run. This cannot be undone."
        confirmLabel="Reset"
        danger
        onConfirm={confirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  )
}
