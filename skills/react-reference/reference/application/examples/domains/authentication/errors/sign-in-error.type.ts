import type { AUTHENTICATION_ERROR_CODE } from './authentication-error-code'

/**
 * Ожидаемые failures операции sign-in.
 */
export type SignInError = Error & Readonly<{
  /** Имя runtime domain exception. */
  name: 'AuthenticationDomainError'
  /** Допустимые details именно операции sign-in. */
  details: Readonly<{
    /** Code, который обязан исчерпывающе обработать consumer. */
    code:
      | typeof AUTHENTICATION_ERROR_CODE.INVALID_CREDENTIALS
      | typeof AUTHENTICATION_ERROR_CODE.ACCOUNT_LOCKED
      | typeof AUTHENTICATION_ERROR_CODE.TEMPORARILY_UNAVAILABLE
  }>
}>
