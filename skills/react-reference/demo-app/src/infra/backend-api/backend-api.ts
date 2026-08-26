import { appStore } from 'infra/app-store'
import { ApiError, createApiClient, HttpClient, operationsTree } from './generated'
import { clearAccessToken, getAccessToken } from './access-token-storage'

const httpClient = new HttpClient({
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
      appStore.getState().setAuthenticationStatus('unauthenticated')
      clearAccessToken()
    }

    throw error
  }
})

/**
 * Предоставляет операции серверного API через единый настроенный HTTP-клиент.
 */
export const backendApi = createApiClient(httpClient, operationsTree)
