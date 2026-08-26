import { backendApi } from 'infra/backend-api'
import { toApplicationDefect } from 'shared/errors'
import { createUserUnavailableError } from '../errors/user-error.factory'
import { mapCurrentUserDto } from '../mappers/current-user.mapper'
import { isUserUnavailableSourceError } from '../source-errors/is-user-unavailable-source-error'
import type { CurrentUser } from '../types/current-user.type'

/**
 * Возвращает профиль текущего пользователя.
 */
export const getCurrentUser = async (): Promise<CurrentUser> => {
  try {
    const responseDto = await backendApi.users.getCurrentUser()

    return mapCurrentUserDto(responseDto)
  } catch (error) {
    if (isUserUnavailableSourceError(error)) {
      throw createUserUnavailableError()
    }

    throw toApplicationDefect('user.getCurrentUser', error)
  }
}
