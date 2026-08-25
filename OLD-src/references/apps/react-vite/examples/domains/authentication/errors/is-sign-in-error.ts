import { AUTHENTICATION_ERROR_CODE } from './authentication-error-code'
import { AuthenticationDomainError } from './authentication-domain.error'
import type { SignInError } from './sign-in-error.type'

/**
 * Сужает unknown до закрытого набора ожидаемых sign-in failures.
 */
export const isSignInError = (error: unknown): error is SignInError => {
  if (!(error instanceof AuthenticationDomainError)) {
    return false
  }

  return (
    error.details.code === AUTHENTICATION_ERROR_CODE.INVALID_CREDENTIALS ||
    error.details.code === AUTHENTICATION_ERROR_CODE.ACCOUNT_LOCKED ||
    error.details.code === AUTHENTICATION_ERROR_CODE.TEMPORARILY_UNAVAILABLE
  )
}
