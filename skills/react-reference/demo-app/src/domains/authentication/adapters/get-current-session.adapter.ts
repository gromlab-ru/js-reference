import { backendApi } from 'infra/backend-api'
import { toApplicationDefect } from 'shared/errors'
import { createAuthenticationUnavailableError } from '../errors/authentication-error.factory'
import { mapCurrentSessionDto } from '../mappers/current-session.mapper'
import { isAuthenticationUnavailableSourceError } from '../source-errors/is-authentication-unavailable-source-error'
import { isNotAuthenticatedSourceError } from '../source-errors/is-not-authenticated-source-error'
import type { CurrentSession } from '../types/current-session.type'

/**
 * Возвращает текущую сессию или null без авторизации.
 */
export const getCurrentSession = async (): Promise<CurrentSession | null> => {
  try {
    const responseDto = await backendApi.authentication.getCurrentSession()

    return mapCurrentSessionDto(responseDto)
  } catch (error) {
    if (isNotAuthenticatedSourceError(error)) {
      return null
    }

    if (isAuthenticationUnavailableSourceError(error)) {
      throw createAuthenticationUnavailableError()
    }

    throw toApplicationDefect('authentication.getCurrentSession', error)
  }
}
