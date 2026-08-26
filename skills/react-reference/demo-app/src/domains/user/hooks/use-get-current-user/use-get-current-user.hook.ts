import useSWR from 'swr'
import { useGetCurrentSession } from 'domains/authentication'
import { getCurrentUser } from '../../adapters/get-current-user.adapter'
import { isGetCurrentUserError } from '../../errors/is-get-current-user-error'
import { getCurrentUserKey } from './get-current-user-key'
import type { GetCurrentUserKey } from './get-current-user-key'
import type { UseGetCurrentUserResponse } from './types/use-get-current-user.type'

/**
 * Получает профиль в приватной области кеша текущей сессии.
 */
export const useGetCurrentUser = (): UseGetCurrentUserResponse => {
  const currentSession = useGetCurrentSession()
  const userId = currentSession.data?.userId ?? null
  const key = getCurrentUserKey(userId)
  const response = useSWR<
    Awaited<ReturnType<typeof getCurrentUser>>,
    unknown,
    GetCurrentUserKey | null
  >(key, () => getCurrentUser())
  const error = isGetCurrentUserError(response.error)
    ? response.error
    : undefined
  const defect = response.error !== undefined && error === undefined
    ? response.error
    : undefined

  return {
    data: response.data,
    defect,
    error,
    isLoading: response.isLoading,
    refresh: response.mutate
  }
}
