/**
 * Wire-параметры входа в Identity API.
 */
export type SignInRequestDto = {
  /** Логин пользователя. */
  login: string
  /** Пароль, передаваемый только в теле sign-in запроса. */
  password: string
}
