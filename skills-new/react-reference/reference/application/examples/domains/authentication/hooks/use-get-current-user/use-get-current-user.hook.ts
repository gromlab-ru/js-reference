import useSWR from 'swr'

import { getCurrentUser } from '../../adapters/get-current-user.adapter'
import { isGetCurrentUserError } from '../../errors/is-get-current-user-error'
import { getCurrentUserKey } from './get-current-user-key'
import type { GetCurrentUserKey } from './get-current-user-key'
import type { UseGetCurrentUserResponse } from './types/use-get-current-user.type'

/**
 * Предоставляет текущую auth identity через единый SWR cache entry домена.
 */
export const useGetCurrentUser = (): UseGetCurrentUserResponse => {
  const response = useSWR<
    Awaited<ReturnType<typeof getCurrentUser>>,
    unknown,
    GetCurrentUserKey
  >(getCurrentUserKey(), () => getCurrentUser())
  const error = isGetCurrentUserError(response.error)
    ? response.error
    : undefined
  const defect = response.error !== undefined && error === undefined
    ? response.error
    : undefined

  return {
    data: response.data,
    error,
    defect,
    isLoading: response.isLoading,
    refresh: response.mutate
  }
}
