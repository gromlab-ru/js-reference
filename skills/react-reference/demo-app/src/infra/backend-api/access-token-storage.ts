const ACCESS_TOKEN_KEY = 'react-reference.identity.access-token'

/**
 * Возвращает сохранённый JWT как непрозрачную строку.
 */
export const getAccessToken = (): string | null => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)

  if (accessToken === null) {
    return null
  }

  if (accessToken.trim() === '') {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    return null
  }

  return accessToken
}

/**
 * Сохраняет непустой JWT текущей сессии.
 */
export const setAccessToken = (accessToken: string): void => {
  const normalizedAccessToken = accessToken.trim()

  if (normalizedAccessToken === '') {
    throw new TypeError('Access token must not be empty')
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, normalizedAccessToken)
}

/**
 * Идемпотентно удаляет JWT текущей сессии.
 */
export const clearAccessToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}
