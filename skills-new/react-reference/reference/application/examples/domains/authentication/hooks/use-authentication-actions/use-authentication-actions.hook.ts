import { useSWRConfig } from 'swr'

import { signIn } from '../../adapters/sign-in.adapter'
import { signOut } from '../../adapters/sign-out.adapter'
import type { CurrentUser } from '../../types/current-user.type'
import type { SignInInput } from '../../types/sign-in-input.type'
import { getCurrentUserKey } from '../use-get-current-user/get-current-user-key'
import { useGetCurrentUser } from '../use-get-current-user/use-get-current-user.hook'
import { isPrivateCacheKey } from './is-private-cache-key'
import type { UseAuthenticationActionsResponse } from './types/use-authentication-actions.type'

/**
 * Предоставляет auth mutations и синхронизирует единственный cache entry identity.
 */
export const useAuthenticationActions = (): UseAuthenticationActionsResponse => {
  const { mutate } = useSWRConfig()
  const currentUser = useGetCurrentUser()

  /**
   * Удаляет private cache entries конкретной auth identity.
   */
  const clearPrivateCache = async (userId: string): Promise<void> => {
    await mutate(
      (key) => isPrivateCacheKey(key, userId),
      undefined,
      { revalidate: false }
    )
  }

  /**
   * Выполняет вход и заменяет cache identity без дополнительного GET.
   */
  const handleSignIn = async (input: SignInInput): Promise<CurrentUser> => {
    const previousCurrentUser = currentUser.data

    if (previousCurrentUser !== undefined && previousCurrentUser !== null) {
      await mutate(getCurrentUserKey(), null, { revalidate: false })
      await clearPrivateCache(previousCurrentUser.id)
    }

    let nextCurrentUser: CurrentUser

    try {
      nextCurrentUser = await signIn(input)
    } catch (error) {
      if (previousCurrentUser !== undefined && previousCurrentUser !== null) {
        await mutate(getCurrentUserKey(), previousCurrentUser, { revalidate: false })
      }

      throw error
    }

    await mutate(getCurrentUserKey(), nextCurrentUser, { revalidate: false })

    return nextCurrentUser
  }

  /**
   * Очищает identity cache независимо от результата server-side отзыва token.
   */
  const handleSignOut = async (): Promise<void> => {
    const previousUserId = currentUser.data?.id

    try {
      await mutate(getCurrentUserKey(), null, { revalidate: false })

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
