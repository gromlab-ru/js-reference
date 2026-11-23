/** Источник заявки для журнала отправки. */
export type RequestSource = 'user' | 'retry'

/** Ограничения одной отправки. */
export type BatchOptions = {
  /** Максимум заявок за раз; `null` снимает ограничение. */
  limit: number | null
}

/** Настройки отправки до выбора тарифа. */
export const defaultBatch = {
  /** Сколько заявок можно отправить одновременно. */
  limit: 10
}

/** Принимает заявки на будущую отправку. */
export interface Outbox {
  /** Число заявок в ожидании. */
  readonly pending: number

  /**
   * Ставит заявку в конец очереди.
   * @param id Идентификатор заявки из журнала.
   */
  enqueue(id: string): void
}

/** Состояние заявки в журнале отправки. */
export enum DispatchState {
  /** Заявка ждёт отправки. */
  Waiting = 0,
  /** Перевозчик принял заявку. */
  Sent = 1
}

/**
 * Забирает первую заявку из очереди.
 *
 * @param queue Идентификаторы заявок в порядке отправки.
 *   - `[]` — заявок нет; вернётся `undefined`
 *   - непустая очередь — первый идентификатор будет удалён и возвращён
 */
export function takeNext(queue: string[]): string | undefined {
  return queue.shift()
}

/**
 * Проверяет, поместится ли ещё одна заявка в текущую отправку.
 * @param pending Число уже набранных заявок.
 * @param limit Максимум заявок; `null` означает, что лимита нет.
 */
export const hasRoom = (pending: number, limit: number | null): boolean =>
  limit === null || pending < limit

/** Хранит заявки одного перевозчика в порядке поступления. */
export class DispatchQueue {
  /** Название перевозчика для журнала отправки. */
  readonly carrier: string

  #ids: string[] = []

  /**
   * Открывает пустую очередь перевозчика.
   * @param carrier Название перевозчика в журнале.
   */
  constructor(carrier: string) {
    this.carrier = carrier
  }

  /**
   * Ставит заявку в конец очереди.
   * @param id Идентификатор заявки из журнала.
   */
  enqueue(id: string): void {
    this.#ids.push(id)
  }
}

/**
 * Забирает первую заявку из очереди старого диспетчера.
 * @param queue Идентификаторы заявок в порядке отправки.
 * @deprecated Используй `takeNext`.
 */
export const popRequest = (queue: string[]): string | undefined => takeNext(queue)
