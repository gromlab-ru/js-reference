import { isIdentityApiError } from '@/infra/identity-api'

/**
 * Распознаёт wire-code отклонённых credentials.
 */
export const isInvalidCredentialsSourceError = (error: unknown): boolean => {
  return isIdentityApiError(error, 401, 'invalid_credentials')
}
