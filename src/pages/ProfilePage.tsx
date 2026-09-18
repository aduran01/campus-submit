import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import styles from './ProfilePage.module.css'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Profile</h1>

      <Card className={styles.card}>
        <div className={styles.avatar} aria-hidden="true">
          {user?.displayName?.charAt(0) ?? '?'}
        </div>
        <div className={styles.info}>
          <h2 className={styles.name}>{user?.displayName}</h2>
          <p className={styles.username}>@{user?.username}</p>
          <Badge tone="primary">{user?.role === 'admin' ? 'Administrator' : 'Student'}</Badge>
        </div>
      </Card>

      <Card className={styles.noteCard}>
        <h3 className={styles.noteTitle}>About this session</h3>
        <p className={styles.noteText}>
          You're logged in via CampusSubmit's demo authentication. Your session is kept in this browser tab's storage,
          so refreshing the page keeps you logged in, but closing the browser (or opening a private window) will not.
        </p>
      </Card>

      <Button variant="secondary" onClick={handleLogout}>
        Log out
      </Button>
    </div>
  )
}
