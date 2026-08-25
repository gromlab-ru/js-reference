import { AUTHENTICATION_ERROR_CODE } from './authentication-error-code'

/**
 * Детали ожидаемого Authentication failure.
 */
export type AuthenticationErrorDetails =
  | Readonly<{
      /** Стабильный code отклонённых credentials. */
      code: typeof AUTHENTICATION_ERROR_CODE.INVALID_CREDENTIALS
    }>
  | Readonly<{
      /** Стабильный code заблокированной учётной записи. */
      code: typeof AUTHENTICATION_ERROR_CODE.ACCOUNT_LOCKED
    }>
  | Readonly<{
      /** Стабильный code временной недоступности. */
      code: typeof AUTHENTICATION_ERROR_CODE.TEMPORARILY_UNAVAILABLE
    }>

/**
 * Внутренняя runtime-реализация ожидаемой Authentication exception.
 */
export class AuthenticationDomainError extends Error {
  readonly name = 'AuthenticationDomainError'

  /**
   * Создаёт exception из закрытого набора ожидаемых details.
   */
  constructor(readonly details: AuthenticationErrorDetails) {
    super(`authentication:${details.code}`)
  }
}
