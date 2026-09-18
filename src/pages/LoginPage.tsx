import { useId, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { GraduationCap, Lock, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { APP_NAME } from '../config/appConfig'
import { Button } from '../components/ui/Button'
import styles from './LoginPage.module.css'

interface IconInputProps {
  label: string
  icon: ReactNode
  type?: string
  value: string
  onChange: (value: string) => void
  autoComplete: string
  autoFocus?: boolean
}

function IconInput({ label, icon, type = 'text', value, onChange, autoComplete, autoFocus }: IconInputProps) {
  const id = useId()
  return (
    <div className={styles.inputWrap}>
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <span className={styles.inputIcon} aria-hidden="true">
        {icon}
      </span>
      <input
        id={id}
        className={styles.input}
        type={type}
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required
      />
    </div>
  )
}

export function LoginPage() {
  const { user, isInitializing, login } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isInitializing && user) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    const result = await login(username, password)

    setIsSubmitting(false)
    if (!result.success) {
      setError(result.error ?? 'Unable to log in.')
      return
    }
    navigate('/dashboard', { replace: true })
  }

  //pls dont flame me i did not feel like encrypting this
  function fillDemo(role: 'student' | 'admin') {
    if (role === 'student') {
      setUsername('crimbawa')
      setPassword('***REMOVED-SEED-PASSWORD***')
    } else {
      setUsername('admin')
      setPassword('***REMOVED-SEED-PASSWORD***')
    }
    setError(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconBadge} aria-hidden="true">
          <GraduationCap size={28} />
        </div>

        <h1 className={styles.title}>Sign in to {APP_NAME}</h1>
        <p className={styles.subtitle}>Assignment submission, made simple.</p>

        <div className={styles.demoBanner} role="note">
          Welcome Student! Are you ready to submit your assignments?
        </div>

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <IconInput
            label="Username"
            icon={<User size={16} />}
            value={username}
            onChange={setUsername}
            autoComplete="username"
            autoFocus
          />
          <IconInput
            label="Password"
            type="password"
            icon={<Lock size={16} />}
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth isLoading={isSubmitting} className={styles.submit}>
            Log In
          </Button>
        </form>

        <div className={styles.divider} aria-hidden="true">
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>Demo access</span>
          <span className={styles.dividerLine} />
        </div>

        <details className={styles.demoCredentials}>
          <summary>Need demo credentials?</summary>
          <div className={styles.demoCredentialsBody}>
            <button type="button" className={styles.demoRow} onClick={() => fillDemo('student')}>
              <span className={styles.demoRoleLabel}>Student</span>
              <span className={styles.demoRoleValue}>
                student <span className={styles.demoSeparator}>/</span> ***REMOVED-SEED-PASSWORD***
              </span>
            </button>
            <button type="button" className={styles.demoRow} onClick={() => fillDemo('admin')}>
              <span className={styles.demoRoleLabel}>Admin</span>
              <span className={styles.demoRoleValue}>
                admin <span className={styles.demoSeparator}>/</span> ***REMOVED-SEED-PASSWORD***
              </span>
            </button>
            <p className={styles.demoHint}>Click either row to autofill the form. Changeable in src/config/credentials.ts.</p>
          </div>
        </details>
      </div>
    </div>
  )
}
