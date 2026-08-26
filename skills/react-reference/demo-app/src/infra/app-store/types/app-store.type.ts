/**
 * Допустимые статусы авторизации в приложении.
 */
export type AppAuthenticationStatus = 'unknown' | 'authenticated' | 'unauthenticated'

/**
 * Состояние и действия базового store приложения.
 */
export type AppStore = Readonly<{
  /**
   * Текущий статус авторизации для общих потребителей приложения.
   */
  authenticationStatus: AppAuthenticationStatus
  /**
   * Изменяет общий статус авторизации.
   */
  setAuthenticationStatus: (status: AppAuthenticationStatus) => void
}>

/**
 * Выбирает значение из базового store приложения.
 */
export type AppStoreSelector<TValue> = (store: AppStore) => TValue
