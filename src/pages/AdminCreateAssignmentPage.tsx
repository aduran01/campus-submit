import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createAssignment } from '../services/assignmentService'
import { ApiError } from '../services/apiClient'
import type { AssignmentInput } from '../types'
import { AssignmentForm } from '../components/assignments/AssignmentForm'
import { Card } from '../components/ui/Card'
import { useToast } from '../context/ToastContext'
import styles from './AdminCreateAssignmentPage.module.css'

export function AdminCreateAssignmentPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(input: AssignmentInput) {
    setIsSaving(true)
    try {
      await createAssignment(input)
      showToast(`"${input.title}" was created and is now visible to students.`, 'success')
      navigate('/assignments')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to create the assignment.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Create Assignment</h1>
        <p className={styles.subtitle}>New assignments become visible to students immediately after saving.</p>
      </header>

      <Card className={styles.card}>
        <AssignmentForm onSubmit={handleSubmit} submitLabel="Create Assignment" isSaving={isSaving} />
      </Card>
    </div>
  )
}
