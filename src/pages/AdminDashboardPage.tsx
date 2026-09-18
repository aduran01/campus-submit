import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAssignments } from '../services/assignmentService'
import { getAllSubmissions, isPastDue } from '../services/submissionService'
import type { Assignment, Submission } from '../types'
import { Card } from '../components/ui/Card'
import { formatDueDate, getRelativeDueLabel } from '../utils/dateUtils'
import styles from './AdminDashboardPage.module.css'

export function AdminDashboardPage() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    setAssignments(getAssignments())
    setSubmissions(getAllSubmissions())
  }, [])

  const stats = useMemo(() => {
    const receivedSubmissions = submissions.filter((s) => s.status !== 'not_submitted')
    const upcoming = assignments
      .filter((a) => !isPastDue(a.dueDate))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

    return {
      totalAssignments: assignments.length,
      totalSubmissions: receivedSubmissions.length,
      upcomingCount: upcoming.length,
      nextDeadline: upcoming[0],
    }
  }, [assignments, submissions])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.greeting}>Welcome back, {user?.displayName?.split(' ')[0] ?? 'Admin'}</h1>
          <p className={styles.subtitle}>Here's an overview of your course's assignments.</p>
        </div>
        <Link to="/assignments/new" className={styles.ctaLink}>
          + New Assignment
        </Link>
      </header>

      <div className={styles.statGrid}>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{stats.totalAssignments}</span>
          <span className={styles.statLabel}>Assignments Created</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{stats.totalSubmissions}</span>
          <span className={styles.statLabel}>Submissions Received</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{stats.upcomingCount}</span>
          <span className={styles.statLabel}>Upcoming Deadlines</span>
        </Card>
      </div>

      <Card className={styles.nextUpCard}>
        <h2 className={styles.sectionTitle}>Next deadline</h2>
        {stats.nextDeadline ? (
          <div className={styles.nextUpBody}>
            <div>
              <h3 className={styles.nextUpTitle}>{stats.nextDeadline.title}</h3>
              <p className={styles.nextUpMeta}>Due {formatDueDate(stats.nextDeadline.dueDate)}</p>
            </div>
            <span className={styles.relativeLabel}>{getRelativeDueLabel(stats.nextDeadline.dueDate)}</span>
          </div>
        ) : (
          <p className={styles.emptyText}>No upcoming deadlines. Create an assignment to get started.</p>
        )}
        <Link to="/assignments" className={styles.manageLink}>
          Manage all assignments →
        </Link>
      </Card>
    </div>
  )
}
