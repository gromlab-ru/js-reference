import { useSWRConfig } from 'swr'
import { signIn } from '../../adapters/sign-in.adapter'
import { signOut } from '../../adapters/sign-out.adapter'
import type { CurrentSession } from '../../types/current-session.type'
import type { SignInInput } from '../../types/sign-in-input.type'
import { getCurrentSessionKey } from '../use-get-current-session/get-current-session-key'
import { useGetCurrentSession } from '../use-get-current-session/use-get-current-session.hook'
import { isPrivateCacheKey } from './is-private-cache-key'
import type { UseAuthenticationActionsResponse } from './types/use-authentication-actions.type'

/**
 * Выполняет действия авторизации и синхронизирует SWR-кеш.
 */
export const useAuthenticationActions = (): UseAuthenticationActionsResponse => {
  const { mutate } = useSWRConfig()
  const currentSession = useGetCurrentSession()

  /**
   * Удаляет приватные данные указанного пользователя.
   */
  const clearPrivateCache = async (userId: string): Promise<void> => {
    await mutate(
      (key) => isPrivateCacheKey(key, userId),
      undefined,
      { revalidate: false }
    )
  }

  /**
   * Выполняет вход и заменяет кеш текущей сессии.
   */
  const handleSignIn = async (input: SignInInput): Promise<CurrentSession> => {
    const previousSession = currentSession.data

    if (previousSession !== undefined && previousSession !== null) {
      await mutate(getCurrentSessionKey(), null, { revalidate: false })
      await clearPrivateCache(previousSession.userId)
    }

    try {
      const nextSession = await signIn(input)

      await mutate(getCurrentSessionKey(), nextSession, { revalidate: false })

      return nextSession
    } catch (error) {
      if (previousSession !== undefined && previousSession !== null) {
        await mutate(getCurrentSessionKey(), previousSession, { revalidate: false })
      }

      throw error
    }
  }

  /**
   * Очищает кеш сессии и приватные данные перед выходом.
   */
  const handleSignOut = async (): Promise<void> => {
    const previousUserId = currentSession.data?.userId

    try {
      await mutate(getCurrentSessionKey(), null, { revalidate: false })

      if (previousUserId !== undefined) {
        await clearPrivateCache(previousUserId)
      }
    } finally {
      await signOut()
    }
  }

  return {
    signIn: handleSignIn,
    signOut: handleSignOut
  }
}
