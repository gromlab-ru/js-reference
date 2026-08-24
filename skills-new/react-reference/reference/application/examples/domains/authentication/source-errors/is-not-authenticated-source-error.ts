import { isIdentityApiError } from '@/infra/identity-api'

/**
 * Распознаёт отсутствие действующей Identity API session.
 */
export const isNotAuthenticatedSourceError = (error: unknown): boolean => {
  return isIdentityApiError(error, 401)
}
