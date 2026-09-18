import type { ReactNode } from 'react'
import styles from './Badge.module.css'

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'primary'

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  icon?: ReactNode
}

export function Badge({ tone = 'neutral', children, icon }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </span>
  )
}
