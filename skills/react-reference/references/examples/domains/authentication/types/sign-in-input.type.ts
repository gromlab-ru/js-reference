/**
 * Предметные параметры входа пользователя.
 */
export type SignInInput = Readonly<{
  /** Пользовательский login без transport-specific naming. */
  login: string
  /** Transient password, который нельзя сохранять в state или cache. */
  password: string
}>
