import type { CurrentUserDto } from './current-user-dto.type'

/**
 * Wire-результат успешного входа.
 */
export type SignInResponseDto = {
  /** JWT access token для последующих защищённых запросов. */
  access_token: string
  /** Текущий пользователь новой сессии. */
  user: CurrentUserDto
}
