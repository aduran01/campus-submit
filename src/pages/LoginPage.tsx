import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { APP_NAME } from '../config/appConfig'
import { Button } from '../components/ui/Button'
import { TextField } from '../components/ui/FormField'
import styles from './LoginPage.module.css'

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
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            CS
          </span>
          <span className={styles.brandName}>{APP_NAME}</span>
        </div>

        <p className={styles.tagline}>Assignment submission, made simple.</p>

        <div className={styles.demoBanner} role="note">
          Welcome Student! Are you ready to submit your assignments?
        </div>

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Log In
          </Button>
        </form>

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
