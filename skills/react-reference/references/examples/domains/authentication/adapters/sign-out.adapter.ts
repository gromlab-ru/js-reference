import {
  clearAccessToken,
  getAccessToken,
  identityApi
} from '@/infra/identity-api'
import { toApplicationDefect } from '@/shared/errors'

import { isNotAuthenticatedSourceError } from '../source-errors/is-not-authenticated-source-error'

/**
 * Идемпотентно завершает локальную сессию, даже если server token уже недействителен.
 */
export const signOut = async (): Promise<void> => {
  try {
    if (getAccessToken() === null) {
      return
    }

    try {
      await identityApi.authentication.signOut()
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
