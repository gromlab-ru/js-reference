import { isBackendApiError } from 'infra/backend-api'

/**
 * Проверяет отсутствие действующей сессии в серверном API.
 */
export const isNotAuthenticatedSourceError = (error: unknown): boolean => {
  return isBackendApiError(error, 401, 'NOT_AUTHENTICATED')
}
