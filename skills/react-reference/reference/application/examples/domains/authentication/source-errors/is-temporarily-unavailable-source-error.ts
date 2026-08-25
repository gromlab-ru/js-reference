import { isIdentityApiError } from '@/infra/identity-api'

/**
 * Распознаёт временную недоступность Identity API.
 */
export const isTemporarilyUnavailableSourceError = (error: unknown): boolean => {
  return isIdentityApiError(error, 503)
}
