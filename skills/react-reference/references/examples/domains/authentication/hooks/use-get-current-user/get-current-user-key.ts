/**
 * Cache key единственного владельца текущей auth identity.
 */
export type GetCurrentUserKey = readonly ['authentication/current-user']

/**
 * Возвращает стабильный key текущей identity без credentials.
 */
export const getCurrentUserKey = (): GetCurrentUserKey => {
  return ['authentication/current-user']
}
