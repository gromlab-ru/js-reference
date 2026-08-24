import type { AUTHENTICATION_ERROR_CODE } from './authentication-error-code'

/**
 * Ожидаемый failure получения текущей identity.
 */
export type GetCurrentUserError = Error & Readonly<{
  /** Имя runtime domain exception. */
  name: 'AuthenticationDomainError'
  /** Допустимые details операции чтения identity. */
  details: Readonly<{
    /** Code временной недоступности Identity service. */
    code: typeof AUTHENTICATION_ERROR_CODE.TEMPORARILY_UNAVAILABLE
  }>
}>
