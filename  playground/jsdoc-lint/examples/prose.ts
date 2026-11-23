/**
 * Забирает первую заявку из очереди.
 *
 * `queue`: идентификаторы заявок в порядке отправки.
 *   - `[]` — заявок нет; вернётся `undefined`
 *   - непустая очередь — первый идентификатор будет удалён и возвращён
 */
export function takeNext(queue: string[]): string | undefined {
  return queue.shift()
}

/**
 * Забирает первую заявку из очереди.
 *
 * `ids`: идентификаторы заявок в порядке отправки.
 *   - `[]` — заявок нет; вернётся `undefined`
 *   - непустая очередь — первый идентификатор будет удалён и возвращён
 */
export function takeNextAfterRename(queue: string[]): string | undefined {
  return queue.shift()
}
