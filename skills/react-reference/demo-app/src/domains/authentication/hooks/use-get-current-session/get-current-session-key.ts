/**
 * Ключ единственного владельца текущей сессии.
 */
export type GetCurrentSessionKey = readonly ['authentication/current-session']

/**
 * Возвращает стабильный ключ сессии без JWT.
 */
export const getCurrentSessionKey = (): GetCurrentSessionKey => {
  return ['authentication/current-session']
}
