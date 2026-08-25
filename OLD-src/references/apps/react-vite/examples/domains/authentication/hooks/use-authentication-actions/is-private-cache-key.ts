/**
 * Проверяет принадлежность cache key приватному scope указанного пользователя.
 */
export const isPrivateCacheKey = (key: unknown, userId: string): boolean => {
  return Array.isArray(key) && key[0] === 'private' && key[1] === userId
}
