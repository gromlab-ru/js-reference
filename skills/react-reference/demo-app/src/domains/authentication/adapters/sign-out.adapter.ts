import { backendApi, clearAccessToken, getAccessToken } from 'infra/backend-api'
import { toApplicationDefect } from 'shared/errors'
import { isNotAuthenticatedSourceError } from '../source-errors/is-not-authenticated-source-error'

/**
 * Идемпотентно завершает локальную авторизованную сессию.
 */
export const signOut = async (): Promise<void> => {
  try {
    if (getAccessToken() === null) {
      return
    }

    try {
      await backendApi.authentication.signOut()
    } catch (error) {
      if (!isNotAuthenticatedSourceError(error)) {
        throw error
      }
    }
  } catch (error) {
    throw toApplicationDefect('authentication.signOut', error)
  } finally {
    try {
      clearAccessToken()
    } catch (error) {
      throw toApplicationDefect('authentication.clearAccessToken', error)
    }
  }
}
