import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Assignment, AssignmentInput } from '../../types'
import { TextField, TextAreaField } from '../ui/FormField'
import { Button } from '../ui/Button'
import { validateAssignmentInput } from '../../utils/validation'
import { toDateInputValue, toTimeInputValue, combineDateAndTime } from '../../utils/dateUtils'
import styles from './AssignmentForm.module.css'

interface AssignmentFormProps {
  initialAssignment?: Assignment
  onSubmit: (input: AssignmentInput) => void
  onCancel?: () => void
  submitLabel?: string
  isSaving?: boolean
}

const DEFAULT_TIME = '23:59'

export function AssignmentForm({
  initialAssignment,
  onSubmit,
  onCancel,
  submitLabel = 'Create Assignment',
  isSaving = false,
}: AssignmentFormProps) {
  const [title, setTitle] = useState(initialAssignment?.title ?? '')
  const [description, setDescription] = useState(initialAssignment?.description ?? '')
  const [date, setDate] = useState(initialAssignment ? toDateInputValue(initialAssignment.dueDate) : '')
  const [time, setTime] = useState(initialAssignment ? toTimeInputValue(initialAssignment.dueDate) : DEFAULT_TIME)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const dueDate = combineDateAndTime(date, time)
    const input: AssignmentInput = {
      title,
      description,
      dueDate: dueDate ?? '',
    }

    const result = validateAssignmentInput(input)
    if (!result.valid) {
      setErrors(result.errors)
      return
    }

    setErrors({})
    onSubmit(input)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <TextField
        label="Assignment Name"
        placeholder="e.g. Introduction to Computer Systems"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        required
        maxLength={120}
      />

      <TextAreaField
        label="Description"
        placeholder="Optional details students should know about this assignment"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
        hint="Optional"
        rows={4}
      />

      <div className={styles.dateRow}>
        <TextField
          label="Due Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.dueDate}
          required
        />
        <TextField
          label="Due Time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          hint="Defaults to 11:59 PM"
        />
      </div>

      <div className={styles.actions}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSaving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
