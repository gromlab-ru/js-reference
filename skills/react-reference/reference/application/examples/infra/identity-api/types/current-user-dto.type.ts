/**
 * Wire-представление текущего пользователя Identity API.
 */
export type CurrentUserDto = {
  /** Идентификатор пользователя во внешней системе. */
  id: string
  /** Отображаемое имя пользователя. */
  display_name: string
  /** Адрес электронной почты. */
  email: string
  /** Выданные пользователю разрешения. */
  permissions: string[]
}
