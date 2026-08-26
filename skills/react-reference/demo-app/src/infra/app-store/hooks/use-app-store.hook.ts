import { useStore } from 'zustand'
import { appStore } from '../app.store'
import type { AppStoreSelector } from '../types/app-store.type'

/**
 * Подписывает React-компонент на выбранное значение базового store приложения.
 */
export const useAppStore = <TValue>(selector: AppStoreSelector<TValue>): TValue => {
  return useStore(appStore, selector)
}
