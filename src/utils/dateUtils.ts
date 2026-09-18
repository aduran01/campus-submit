/** Formats an ISO datetime for display, e.g. "October 15, 2026 at 11:59 PM". */
export function formatDueDate(iso: string): string {
  const date = new Date(iso)
  const datePart = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${datePart} at ${timePart}`
}

/** Shorter format for timestamps, e.g. "Sep 18, 2026, 4:32 PM". */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Converts an ISO datetime to a value usable by `<input type="date">`. */
export function toDateInputValue(iso: string): string {
  const d = new Date(iso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** Converts an ISO datetime to a value usable by `<input type="time">`. */
export function toTimeInputValue(iso: string): string {
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

/**
 * Combines a `<input type="date">` value and an optional `<input type="time">`
 * value into an ISO datetime string. Defaults to 11:59 PM when no time is
 * given, since assignment deadlines are usually "end of day". Returns null
 * if `dateStr` is missing or the resulting date is invalid.
 */
export function combineDateAndTime(dateStr: string, timeStr: string): string | null {
  if (!dateStr) return null
  const time = timeStr && timeStr.trim() ? timeStr : '23:59'
  const combined = new Date(`${dateStr}T${time}:00`)
  if (Number.isNaN(combined.getTime())) return null
  return combined.toISOString()
}

/** Human-friendly relative label for a due date, e.g. "Due in 3 days" or "2 days overdue". */
export function getRelativeDueLabel(iso: string): string {
  const now = Date.now()
  const due = new Date(iso).getTime()
  const diffMs = due - now
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffMs < 0) {
    const overdueDays = Math.abs(diffDays)
    if (overdueDays === 0) return 'Was due today'
    return `${overdueDays} day${overdueDays === 1 ? '' : 's'} overdue`
  }
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  return `Due in ${diffDays} days`
}
