import { ApiError, HttpClient } from './generated'
import { clearAccessToken, getAccessToken } from './access-token-storage'

/**
 * Выполняет запросы серверного API с общей JWT-политикой.
 */
export const backendHttpClient = new HttpClient({
  baseUrl: '/api',
  timeout: 10_000,
  headers: {
    Accept: 'application/json'
  },
  onRequest(request) {
    if (request.secure !== true) {
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
