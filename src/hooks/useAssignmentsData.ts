import { useCallback, useEffect, useState } from 'react'
import { getAssignments } from '../services/assignmentService'
import { getSubmissions } from '../services/submissionService'
import type { Assignment, Submission } from '../types'
import { useToast } from '../context/ToastContext'

interface UseAssignmentsDataResult {
  assignments: Assignment[]
  submissions: Submission[]
  isLoading: boolean
  refresh: () => Promise<void>
}

/**
 * Every page in the app ends up needing assignments + submissions together
 * (submission status/counts are always shown alongside the assignment
 * they belong to), fetched from the API in parallel with a loading state
 * and a toast on failure — this centralizes that instead of repeating it in
 * four pages.
 */
export function useAssignmentsData(): UseAssignmentsDataResult {
  const { showToast } = useToast()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const [assignmentsData, submissionsData] = await Promise.all([getAssignments(), getSubmissions()])
      setAssignments(assignmentsData)
      setSubmissions(submissionsData)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load data.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { assignments, submissions, isLoading, refresh }
}
