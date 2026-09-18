import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from './ToastContext.module.css'

export type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const AUTO_DISMISS_MS = 4200

interface TimerState {
  timeoutId: number
  remainingMs: number
  startedAt: number
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counterRef = useRef(0)
  const timersRef = useRef(new Map<string, TimerState>())

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      window.clearTimeout(timer.timeoutId)
      timersRef.current.delete(id)
    }
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      counterRef.current += 1
      const id = `toast-${Date.now()}-${counterRef.current}`
      setToasts((prev) => [...prev, { id, message, variant }])
      const timeoutId = window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
      timersRef.current.set(id, { timeoutId, remainingMs: AUTO_DISMISS_MS, startedAt: Date.now() })
    },
    [dismiss],
  )

  // Pausing on hover/focus gives a screen-reader or slow-reading user time to
  // finish reading before a toast disappears out from under them.
  const pause = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (!timer) return
    window.clearTimeout(timer.timeoutId)
    timer.remainingMs -= Date.now() - timer.startedAt
  }, [])

  const resume = useCallback(
    (id: string) => {
      const timer = timersRef.current.get(id)
      if (!timer) return
      timer.startedAt = Date.now()
      timer.timeoutId = window.setTimeout(() => dismiss(id), Math.max(timer.remainingMs, 0))
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.container} role="status" aria-live="polite">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            className={`${styles.toast} ${styles[toast.variant]}`}
            onClick={() => dismiss(toast.id)}
            onMouseEnter={() => pause(toast.id)}
            onMouseLeave={() => resume(toast.id)}
            onFocus={() => pause(toast.id)}
            onBlur={() => resume(toast.id)}
          >
            {toast.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
