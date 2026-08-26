import type { AppStore } from '../types/app-store.type'

/**
 * Возвращает текущий статус авторизации приложения.
 */
export const selectAuthenticationStatus = (store: AppStore): AppStore['authenticationStatus'] => {
  return store.authenticationStatus
}

/**
 * Возвращает действие изменения статуса авторизации.
 */
export const selectSetAuthenticationStatus = (store: AppStore): AppStore['setAuthenticationStatus'] => {
  return store.setAuthenticationStatus
}
