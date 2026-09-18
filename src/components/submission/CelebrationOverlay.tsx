import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { runConfetti } from '../../utils/confetti'
import { formatTimestamp } from '../../utils/dateUtils'
import { Button } from '../ui/Button'
import styles from './CelebrationOverlay.module.css'

interface CelebrationOverlayProps {
  isOpen: boolean
  assignmentTitle: string
  fileName: string | null
  submittedAt: string | null
  wasLate: boolean
  onDismiss: () => void
}

export function CelebrationOverlay({
  isOpen,
  assignmentTitle,
  fileName,
  submittedAt,
  wasLate,
  onDismiss,
}: CelebrationOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return
    const cleanup = runConfetti(canvasRef.current)
    return cleanup
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className={styles.overlay} role="alertdialog" aria-modal="true" aria-labelledby="celebration-title">
      <canvas ref={canvasRef} className={styles.confettiCanvas} aria-hidden="true" />

      <div className={styles.card}>
        <div className={styles.checkCircle}>
          <svg viewBox="0 0 52 52" className={styles.checkSvg} aria-hidden="true">
            <circle className={styles.checkCircleBg} cx="26" cy="26" r="24" />
            <path className={styles.checkMark} fill="none" d="M14 27l7 7 17-17" />
          </svg>
        </div>

        <h2 id="celebration-title" className={styles.title}>
          Assignment Submitted!
        </h2>
        <p className={styles.subtitle}>
          {wasLate ? 'Your submission was recorded, marked as late.' : "You're all set — your submission was recorded."}
        </p>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Assignment</span>
            <span className={styles.detailValue}>{assignmentTitle}</span>
          </div>
          {fileName && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>File</span>
              <span className={styles.detailValue}>{fileName}</span>
            </div>
          )}
          {submittedAt && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Submitted</span>
              <span className={styles.detailValue}>{formatTimestamp(submittedAt)}</span>
            </div>
          )}
        </div>

        <Button fullWidth onClick={onDismiss}>
          Back to Dashboard
        </Button>
      </div>
    </div>,
    document.body,
  )
}
