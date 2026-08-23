import { ApiError, HttpClient } from '@gromlab/rest-api-codegen'

import { clearAccessToken, getAccessToken } from './access-token-storage'

/**
 * Общий browser transport Identity API.
 *
 * Он добавляет JWT только к secure operations и завершает локальную сессию после их ответа 401.
 */
export const identityHttpClient = new HttpClient({
  baseUrl: '/api/identity',
  timeout: 10_000,
  headers: {
    Accept: 'application/json'
  },
  onRequest(request) {
    if (!request.secure) {
      return request
    }

    const accessToken = getAccessToken()

    if (accessToken === null) {
      return request
    }

    const headers = new Headers(request.headers)
    headers.set('Authorization', `Bearer ${accessToken}`)

    return { ...request, headers }
  },
  onError(error) {
    if (
      error instanceof ApiError &&
      error.status === 401 &&
      error.request.secure === true
    ) {
      clearAccessToken()
    }

    throw error
  }
})
