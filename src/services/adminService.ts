import { apiClient } from './apiClient'

/** Restores the seeded demo assignments and clears every submission — server-side, so it resets the shared state for every device, not just this browser. */
export function resetDemoData(): Promise<void> {
  return apiClient.post<void>('/api/admin/reset-demo-data')
}
