/**
 * Возвращает число ожидающих заявок.
 * @param {string[]} queue Заявки в порядке отправки.
 * @returns {number} Число заявок до следующей отправки.
 */
export function countPending(queue: string[]): number {
  return queue.length
}

/**
 * Читает первую заявку, не меняя очередь.
 * @param ids Идентификаторы заявок в порядке отправки.
 */
export const peek = (queue: string[]): string | undefined => queue[0]

/**
 * Проверяет, поместится ли заявка в отправку.
 * @param limit Максимум заявок в отправке.
 * @param pending Число уже набранных заявок.
 */
export function hasRoom(pending: number, limit: number): boolean {
  return pending < limit
}

/**
 * Собирает заявки в отправку. Без ограничения берёт все заявки.
 * @param queue Идентификаторы заявок в порядке отправки.
 */
export const batch = (queue: string[], limit?: number): string[] => queue.slice(0, limit)

/**
 * Возвращает число ожидающих заявок.
 * @param queue
 */
export const size = (queue: string[]): number => queue.length

/** @see countPending */
export type BatchLimit = number | null
