import type { GetCurrentSessionError } from '../../../errors/get-current-session-error.type'
import type { CurrentSession } from '../../../types/current-session.type'

/**
 * React-представление состояния текущей сессии.
 */
export type UseGetCurrentSessionResponse = Readonly<{
  /**
   * Неопределённое значение до ответа, null без сессии или текущая сессия.
   */
  data: CurrentSession | null | undefined
  /**
   * Неожиданный сбой для общей границы приложения.
   */
  defect: unknown | undefined
  /**
   * Ожидаемая временная недоступность авторизации.
   */
  error: GetCurrentSessionError | undefined
  /**
   * Признак первого запроса без результата.
   */
  isLoading: boolean
  /**
   * Повторно получает каноническую сессию.
   */
  refresh: () => Promise<CurrentSession | null | undefined>
}>
