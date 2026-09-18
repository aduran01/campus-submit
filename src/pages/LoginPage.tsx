import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { APP_NAME } from '../config/appConfig'
import { DEMO_ACCOUNTS } from '../config/credentials'
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

  function fillDemo(account: (typeof DEMO_ACCOUNTS)[number]) {
    setUsername(account.username)
    setPassword(account.password)
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
          This is a demo application. Assignments and submissions are shared across every device that signs in —
          they're stored on a small demo server, not just in this browser.
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
          {isSubmitting && (
            <p className={styles.wakingHint}>
              First login after a while can take up to ~30s — the free-tier server is waking up.
            </p>
          )}
        </form>

        <details className={styles.demoCredentials}>
          <summary>Need demo credentials?</summary>
          <div className={styles.demoCredentialsBody}>
            {DEMO_ACCOUNTS.map((account) => (
              <button key={account.username} type="button" className={styles.demoRow} onClick={() => fillDemo(account)}>
                <span className={styles.demoRoleLabel}>{account.role === 'admin' ? 'Admin' : 'Student'}</span>
                <span className={styles.demoRoleValue}>
                  {account.username} <span className={styles.demoSeparator}>/</span> {account.password}
                </span>
              </button>
            ))}
            <p className={styles.demoHint}>Click either row to autofill the form. Changeable in src/config/credentials.ts.</p>
          </div>
        </details>
      </div>
    </div>
  )
}
