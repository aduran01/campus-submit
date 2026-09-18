import type { AuthenticatedUser, ServiceResult } from '../types'
import { apiClient, ApiError } from './apiClient'
import { saveSession, getStoredUser, clearSession } from './tokenStorage'

interface LoginResponse {
  token: string
  user: AuthenticatedUser
}

/** Authenticates against the backend. Resolves with a ServiceResult rather than throwing, so callers can render a friendly inline error. */
export async function login(username: string, password: string): Promise<ServiceResult<AuthenticatedUser>> {
  if (!username.trim() || !password) {
    return { success: false, error: 'Please enter both a username and a password.' }
  }

  try {
    const { token, user } = await apiClient.post<LoginResponse>('/api/auth/login', { username, password })
    saveSession(token, user)
    return { success: true, data: user }
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Unable to log in.'
    return { success: false, error: message }
  }
}

export function logout(): void {
  clearSession()
}

/** Returns the current session's user, if any — trusted at face value client-side; every API call re-verifies the underlying token server-side. */
export function getSession(): AuthenticatedUser | null {
  return getStoredUser()
}
