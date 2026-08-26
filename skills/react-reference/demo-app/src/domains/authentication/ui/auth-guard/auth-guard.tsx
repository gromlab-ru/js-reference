import { selectAuthenticationStatus, useAppStore } from 'infra/app-store'
import { useGetCurrentSession } from '../../hooks/use-get-current-session/use-get-current-session.hook'
import type { AuthGuardProps } from './types/auth-guard-props.type'

/**
 * Ограничивает содержимое действующей сессией.
 *
 * Используется для:
 *  - условного отображения защищённой разметки
 *  - передачи состояний авторизации внешнему владельцу отображения
 */
export const AuthGuard = (props: AuthGuardProps) => {
  const {
    children,
    pendingFallback = null,
    renderError,
    unauthenticatedFallback = null
  } = props
  const currentSession = useGetCurrentSession()
  const authenticationStatus = useAppStore(selectAuthenticationStatus)

  /**
   * Повторяет проверку текущей сессии.
   */
  const handleRetry = (): void => {
    void currentSession.mutate()
  }

  if (authenticationStatus === 'unauthenticated') {
    return unauthenticatedFallback
  }

  if (authenticationStatus === 'unknown') {
    if (currentSession.error !== undefined) {
      return renderError?.({
        error: currentSession.error,
        retry: handleRetry
      }) ?? null
    }

    return pendingFallback
  }

  return children
}
