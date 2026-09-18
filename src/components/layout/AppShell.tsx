import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { APP_NAME } from '../../config/appConfig'
import styles from './AppShell.module.css'

const STUDENT_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/assignments', label: 'Assignments' },
  { to: '/profile', label: 'Profile' },
]

const ADMIN_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/assignments', label: 'Assignments' },
  { to: '/assignments/new', label: 'Create Assignment' },
]

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const links = user?.role === 'admin' ? ADMIN_LINKS : STUDENT_LINKS

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              CS
            </span>
            <span className={styles.brandName}>{APP_NAME}</span>
          </div>

          <nav className={styles.nav} aria-label="Primary">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.userArea}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.displayName}</span>
              <span className={styles.userRole}>{user?.role === 'admin' ? 'Administrator' : 'Student'}</span>
            </div>
            <button type="button" className={styles.logoutButton} onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
