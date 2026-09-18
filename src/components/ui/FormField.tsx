import { useId } from 'react'
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'
import styles from './FormField.module.css'

interface BaseFieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
}

interface FieldWrapperProps extends BaseFieldProps {
  children: (id: string, describedBy: string | undefined) => ReactNode
}

function FieldWrapper({ label, error, hint, required, children }: FieldWrapperProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children(id, describedBy)}
      {hint && !error && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

type TextFieldProps = BaseFieldProps & InputHTMLAttributes<HTMLInputElement>

export function TextField({ label, error, hint, required, ...inputProps }: TextFieldProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required}>
      {(id, describedBy) => (
        <input
          id={id}
          className={`${styles.control} ${error ? styles.controlError : ''}`}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          required={required}
          {...inputProps}
        />
      )}
    </FieldWrapper>
  )
}

type TextAreaFieldProps = BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>

export function TextAreaField({ label, error, hint, required, ...textareaProps }: TextAreaFieldProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required}>
      {(id, describedBy) => (
        <textarea
          id={id}
          className={`${styles.control} ${styles.textarea} ${error ? styles.controlError : ''}`}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          required={required}
          {...textareaProps}
        />
      )}
    </FieldWrapper>
  )
}
