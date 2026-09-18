import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAssignmentsData } from '../hooks/useAssignmentsData'
import { isPastDue } from '../services/submissionService'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { PageLoading } from '../components/ui/PageLoading'
import { formatDueDate, getRelativeDueLabel } from '../utils/dateUtils'
import styles from './StudentDashboardPage.module.css'

export function StudentDashboardPage() {
  const { user } = useAuth()
  const { assignments, submissions, isLoading } = useAssignmentsData()

  const stats = useMemo(() => {
    const submittedIds = new Set(submissions.map((s) => s.assignmentId))
    const submittedCount = assignments.filter((a) => submittedIds.has(a.id)).length
    const overdueCount = assignments.filter((a) => !submittedIds.has(a.id) && isPastDue(a.dueDate)).length
    const upcoming = assignments
      .filter((a) => !submittedIds.has(a.id) && !isPastDue(a.dueDate))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

    return {
      total: assignments.length,
      submittedCount,
      overdueCount,
      pendingCount: assignments.length - submittedCount,
      nextUp: upcoming[0],
    }
  }, [assignments, submissions])

  if (isLoading) {
    return <PageLoading />
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.greeting}>Welcome back, {user?.displayName?.split(' ')[0] ?? 'there'} 👋</h1>
        <p className={styles.subtitle}>Here's where things stand with your assignments.</p>
      </header>

      <div className={styles.statGrid}>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Total Assignments</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{stats.submittedCount}</span>
          <span className={styles.statLabel}>Submitted</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{stats.pendingCount}</span>
          <span className={styles.statLabel}>Pending</span>
        </Card>
        <Card className={`${styles.statCard} ${stats.overdueCount > 0 ? styles.statCardWarning : ''}`}>
          <span className={styles.statValue}>{stats.overdueCount}</span>
          <span className={styles.statLabel}>Overdue</span>
        </Card>
      </div>

      <Card className={styles.nextUpCard}>
        <div className={styles.nextUpHeader}>
          <h2 className={styles.sectionTitle}>Next up</h2>
          <Link to="/assignments" className={styles.viewAllLink}>
            View all assignments →
          </Link>
        </div>

        {stats.nextUp ? (
          <div className={styles.nextUpBody}>
            <div>
              <h3 className={styles.nextUpTitle}>{stats.nextUp.title}</h3>
              <p className={styles.nextUpMeta}>Due {formatDueDate(stats.nextUp.dueDate)}</p>
            </div>
            <Badge tone="primary">{getRelativeDueLabel(stats.nextUp.dueDate)}</Badge>
          </div>
        ) : (
          <p className={styles.emptyText}>Nothing pending — you're all caught up! 🎉</p>
        )}
      </Card>
    </div>
  )
}
