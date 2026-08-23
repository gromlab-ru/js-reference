/**
 * Стабильные codes ожидаемых Authentication failures.
 */
export const AUTHENTICATION_ERROR_CODE = {
  /** Переданные credentials не приняты. */
  INVALID_CREDENTIALS: 'AUTHENTICATION_INVALID_CREDENTIALS',
  /** Учётная запись временно заблокирована. */
  ACCOUNT_LOCKED: 'AUTHENTICATION_ACCOUNT_LOCKED',
  /** Identity service временно не может выполнить операцию. */
  TEMPORARILY_UNAVAILABLE: 'AUTHENTICATION_TEMPORARILY_UNAVAILABLE'
} as const
