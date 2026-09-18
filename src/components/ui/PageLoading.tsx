import { Spinner } from './Spinner'
import styles from './PageLoading.module.css'

export function PageLoading() {
  return (
    <div className={styles.wrapper}>
      <Spinner />
    </div>
  )
}
