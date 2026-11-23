/**
 * Ограничения одной отправки.
 */
export interface BatchWindow {
  /** Максимальное число заявок в отправке. */
  limit: number

  /**
   * Задержка до следующей отправки в миллисекундах.
   */
  delayMs: number
}

/** Состояние очереди перед отправкой. */
export interface QueueState {
  /** Число заявок в ожидании. */
  pending: number
}

export interface PendingBatch {
  /** Идентификаторы заявок в порядке отправки. */
  ids: string[]

  limit: number
}
