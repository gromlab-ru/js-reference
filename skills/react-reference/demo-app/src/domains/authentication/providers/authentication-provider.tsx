import { useEffect } from 'react'
import { useSWRConfig } from 'swr'
import {
  selectAuthenticationStatus,
  selectSetAuthenticationStatus,
  useAppStore
} from 'infra/app-store'
import { getCurrentSessionKey } from '../hooks/use-get-current-session/get-current-session-key'
import { useGetCurrentSession } from '../hooks/use-get-current-session/use-get-current-session.hook'
import { isPrivateCacheKey } from '../hooks/use-authentication-actions/is-private-cache-key'
import type { AuthenticationProviderProps } from './types/authentication-provider-props.type'

/**
 * Подключает жизненный цикл авторизации к общему состоянию и SWR-кешу.
 *
 * Используется для:
 *  - определения статуса авторизации при запуске
 *  - очистки сессии и приватного кеша после выхода или защищённого 401
 */
export const AuthenticationProvider = (props: AuthenticationProviderProps) => {
  const { children } = props
  const { mutate } = useSWRConfig()
  const currentSession = useGetCurrentSession()
  const authenticationStatus = useAppStore(selectAuthenticationStatus)
  const setAuthenticationStatus = useAppStore(selectSetAuthenticationStatus)

  useEffect(() => {
    if (currentSession.data === undefined) {
      return
    }

    setAuthenticationStatus(
      currentSession.data === null
        ? 'unauthenticated'
        : 'authenticated'
    )
  }, [currentSession.data, setAuthenticationStatus])

  useEffect(() => {
    if (authenticationStatus !== 'unauthenticated') {
      return
    }

    void Promise.all([
      mutate(getCurrentSessionKey(), null, { revalidate: false }),
      mutate(isPrivateCacheKey, undefined, { revalidate: false })
    ])
  }, [authenticationStatus, mutate])

  return children
}
