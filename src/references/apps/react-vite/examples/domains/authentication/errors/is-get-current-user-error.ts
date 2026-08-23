import { AUTHENTICATION_ERROR_CODE } from './authentication-error-code'
import { AuthenticationDomainError } from './authentication-domain.error'
import type { GetCurrentUserError } from './get-current-user-error.type'

/**
 * Сужает unknown до ожидаемого failure получения текущей identity.
 */
export const isGetCurrentUserError = (error: unknown): error is GetCurrentUserError => {
  return (
    error instanceof AuthenticationDomainError &&
    error.details.code === AUTHENTICATION_ERROR_CODE.TEMPORARILY_UNAVAILABLE
  )
}
