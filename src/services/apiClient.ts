import { API_BASE_URL } from '../config/appConfig'
import { getToken, clearSession } from './tokenStorage'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** Plain objects are sent as JSON; a FormData instance is sent as-is (for file uploads) with no Content-Type override, so the browser sets the correct multipart boundary. */
  body?: unknown
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string }
    return data.error ?? `Request failed (${response.status}).`
  } catch {
    return `Request failed (${response.status}).`
  }
}

/** Core fetch wrapper: adds the base URL and auth header, and normalizes errors into a single ApiError type every caller can catch the same way. */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken()
  const isFormData = options.body instanceof FormData

  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (options.body !== undefined && !isFormData) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : isFormData ? (options.body as FormData) : JSON.stringify(options.body),
    })
  } catch {
    throw new ApiError(
      "Couldn't reach the server. If it's been idle a while, it may take up to 30 seconds to wake up — please try again.",
      0,
    )
  }

  if (response.status === 401) {
    // The token is missing/expired/invalid — there's no recovering from this
    // client-side, so clear the stale session rather than let the app sit in
    // a confusing half-logged-in state.
    clearSession()
    throw new ApiError('Your session has expired. Please log in again.', 401)
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

/** For downloading a file that requires the auth header (a plain <a href> can't attach one). */
export async function fetchAuthorizedBlob(path: string): Promise<Blob> {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status)
  }
  return response.blob()
}
