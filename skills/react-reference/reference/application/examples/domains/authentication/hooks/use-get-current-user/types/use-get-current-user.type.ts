import type { GetCurrentUserError } from '../../../errors/get-current-user-error.type'
import type { CurrentUser } from '../../../types/current-user.type'

/**
 * React-представление lifecycle текущей auth identity.
 */
export type UseGetCurrentUserResponse = Readonly<{
  /** `undefined` до завершения запроса, `null` без сессии или текущий пользователь. */
  data: CurrentUser | null | undefined
  /** Ожидаемая временная недоступность Identity service. */
  error: GetCurrentUserError | undefined
  /** Неожиданный сбой для передачи в application boundary. */
  defect: unknown | undefined
  /** Признак первого запроса без доступного результата. */
  isLoading: boolean
  /** Повторно получает каноническую identity с сервера. */
  refresh: () => Promise<CurrentUser | null | undefined>
}>
