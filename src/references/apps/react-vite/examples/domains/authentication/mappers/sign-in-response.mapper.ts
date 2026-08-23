import type { CurrentUser } from '../types/current-user.type'
import { mapCurrentUserDto } from './current-user.mapper'

/**
 * Проверенный внутренний результат sign-in mapping.
 */
export type MappedSignInResponse = Readonly<{
  /** JWT, который adapter передаёт infra storage и не публикует consumer. */
  accessToken: string
  /** Доменная identity новой сессии. */
  currentUser: CurrentUser
}>

/**
 * Проверяет sign-in response и отделяет credential от публичной доменной модели.
 */
export const mapSignInResponseDto = (value: unknown): MappedSignInResponse => {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('access_token' in value) ||
    typeof value.access_token !== 'string' ||
    value.access_token.trim() === '' ||
    !('user' in value)
  ) {
    throw new TypeError('Invalid sign-in response')
  }

  return {
    accessToken: value.access_token,
    currentUser: mapCurrentUserDto(value.user)
  }
}
