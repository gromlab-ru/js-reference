import { createStore } from 'zustand/vanilla'
import type { AppStore } from './types/app-store.type'

/**
 * Хранит общие клиентские состояния времени жизни приложения.
 */
export const appStore = createStore<AppStore>()((set) => ({
  authenticationStatus: 'unknown',
  setAuthenticationStatus: (authenticationStatus) => set({ authenticationStatus })
}))
