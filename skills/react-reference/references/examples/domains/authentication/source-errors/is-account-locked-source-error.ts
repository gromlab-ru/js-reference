import { isIdentityApiError } from '@/infra/identity-api'

/**
 * Распознаёт wire-code заблокированной учётной записи.
 */
export const isAccountLockedSourceError = (error: unknown): boolean => {
  return isIdentityApiError(error, 423, 'account_locked')
}
