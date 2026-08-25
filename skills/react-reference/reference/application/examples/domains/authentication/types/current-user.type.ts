/**
 * Авторизованный пользователь в предметных терминах SPA.
 */
export type CurrentUser = Readonly<{
  /** Стабильная identity для private cache keys. */
  id: string
  /** Имя для отображения в интерфейсе. */
  displayName: string
  /** Нормализованный адрес электронной почты. */
  email: string
  /** Разрешения текущей сессии. */
  permissions: readonly string[]
}>
