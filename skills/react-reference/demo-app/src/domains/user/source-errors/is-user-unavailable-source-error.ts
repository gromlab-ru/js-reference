import { isBackendApiError } from 'infra/backend-api'

/**
 * Проверяет временную недоступность профиля пользователя.
 */
export const isUserUnavailableSourceError = (error: unknown): boolean => {
  return isBackendApiError(error, 503, 'TEMPORARILY_UNAVAILABLE')
}
