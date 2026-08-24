import type { CurrentUser } from '../../../types/current-user.type'
import type { SignInInput } from '../../../types/sign-in-input.type'

/**
 * Изменяющие Authentication actions с синхронизацией identity cache.
 */
export type UseAuthenticationActionsResponse = Readonly<{
  /** Выполняет sign-in и публикует новую identity в SWR cache. */
  signIn: (input: SignInInput) => Promise<CurrentUser>
  /** Завершает сессию и очищает identity cache. */
  signOut: () => Promise<void>
}>
