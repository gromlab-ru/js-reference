/**
 * Ключ приватного профиля текущего пользователя.
 */
export type GetCurrentUserKey = readonly [
  'private',
  string,
  'backend-api/identity/users/get-current-user'
]

/**
 * Возвращает ключ профиля в области текущего пользователя.
 */
export const getCurrentUserKey = (userId: string | null): GetCurrentUserKey | null => {
  if (userId === null) {
    return null
  }

  return ['private', userId, 'backend-api/identity/users/get-current-user']
}
