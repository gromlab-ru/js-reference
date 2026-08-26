import useSWR from 'swr'
import { getCurrentSession } from '../../adapters/get-current-session.adapter'
import { isGetCurrentSessionError } from '../../errors/is-get-current-session-error'
import { getCurrentSessionKey } from './get-current-session-key'
import type { GetCurrentSessionKey } from './get-current-session-key'
import type { UseGetCurrentSessionResponse } from './types/use-get-current-session.type'

/**
 * Предоставляет текущую сессию через единую запись SWR-кеша.
 */
export const useGetCurrentSession = (): UseGetCurrentSessionResponse => {
  const response = useSWR<
    Awaited<ReturnType<typeof getCurrentSession>>,
    unknown,
    GetCurrentSessionKey
  >(getCurrentSessionKey(), () => getCurrentSession())
  const error = isGetCurrentSessionError(response.error)
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
