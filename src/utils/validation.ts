import type { AssignmentInput } from '../types'

export interface FormValidationResult {
  valid: boolean
  errors: Partial<Record<keyof AssignmentInput, string>>
}

/** Validates the admin "create/edit assignment" form. Pure function — no side effects, easy to unit test. */
export function validateAssignmentInput(input: AssignmentInput): FormValidationResult {
  const errors: Partial<Record<keyof AssignmentInput, string>> = {}

  if (!input.title.trim()) {
    errors.title = 'Assignment name is required.'
  } else if (input.title.trim().length > 120) {
    errors.title = 'Assignment name must be 120 characters or fewer.'
  }

  if (!input.dueDate) {
    errors.dueDate = 'A due date is required.'
  } else if (Number.isNaN(new Date(input.dueDate).getTime())) {
    errors.dueDate = 'That due date is not valid.'
  }

  if (input.description.length > 2000) {
    errors.description = 'Description must be 2000 characters or fewer.'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
