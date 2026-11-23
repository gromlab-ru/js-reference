/**
 * Читает первую заявку, не меняя переданную очередь.
 * @param queue Идентификаторы заявок в порядке отправки.
 * @returns Первый идентификатор или `undefined`, если очередь пуста.
 */
export function peek(queue: string[]): string | undefined {
  return queue.shift()
}

/**
 * Ограничения одной отправки.
 *
 * `maxCount`: верхний предел числа заявок; `null` снимает ограничение.
 */
export interface BatchOptions {
  /** Число или `null`. */
  limit: number | null
}
