import { AUTHENTICATION_ERROR_CODE } from './authentication-error-code'
import { AuthenticationDomainError } from './authentication-domain.error'

/**
 * Создаёт ошибку отклонённых credentials.
 */
export const createInvalidCredentialsError = (): AuthenticationDomainError => {
  return new AuthenticationDomainError({
    code: AUTHENTICATION_ERROR_CODE.INVALID_CREDENTIALS
  })
}

/**
 * Создаёт ошибку заблокированной учётной записи.
 */
export const createAccountLockedError = (): AuthenticationDomainError => {
  return new AuthenticationDomainError({
    code: AUTHENTICATION_ERROR_CODE.ACCOUNT_LOCKED
  })
}

/**
 * Создаёт ошибку временной недоступности Identity service.
 */
export const createAuthenticationUnavailableError = (): AuthenticationDomainError => {
  return new AuthenticationDomainError({
    code: AUTHENTICATION_ERROR_CODE.TEMPORARILY_UNAVAILABLE
  })
}
