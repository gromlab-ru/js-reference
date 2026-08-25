import {
  getCurrentUser as getCurrentUserOperation,
  identityHttpClient
} from '@/infra/identity-api'
import { toApplicationDefect } from '@/shared/errors'

import { createAuthenticationUnavailableError } from '../errors/authentication-error.factory'
import { mapCurrentUserDto } from '../mappers/current-user.mapper'
import { isNotAuthenticatedSourceError } from '../source-errors/is-not-authenticated-source-error'
import { isTemporarilyUnavailableSourceError } from '../source-errors/is-temporarily-unavailable-source-error'
import type { CurrentUser } from '../types/current-user.type'

/**
 * Возвращает текущую identity или `null`, когда действующей сессии нет.
 */
export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  try {
    const currentUserDto = await getCurrentUserOperation(identityHttpClient)

    return mapCurrentUserDto(currentUserDto)
  } catch (error) {
    if (isNotAuthenticatedSourceError(error)) {
      return null
    }

    if (isTemporarilyUnavailableSourceError(error)) {
      throw createAuthenticationUnavailableError()
    }

    throw toApplicationDefect('authentication.getCurrentUser', error)
  }
}
