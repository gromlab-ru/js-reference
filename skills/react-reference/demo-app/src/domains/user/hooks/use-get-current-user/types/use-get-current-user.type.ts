import type { GetCurrentUserError } from '../../../errors/get-current-user-error.type'
import type { CurrentUser } from '../../../types/current-user.type'

/**
 * React-представление состояния профиля пользователя.
 */
export type UseGetCurrentUserResponse = Readonly<{
  /**
   * Профиль после успешного запроса.
   */
  data: CurrentUser | undefined
  /**
   * Неожиданный сбой для общей границы приложения.
   */
  defect: unknown | undefined
  /**
   * Ожидаемая временная недоступность профиля.
   */
  error: GetCurrentUserError | undefined
  /**
   * Признак первого запроса без результата.
   */
  isLoading: boolean
  /**
   * Повторно получает профиль пользователя.
   */
  refresh: () => Promise<CurrentUser | undefined>
}>
