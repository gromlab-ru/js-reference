/** Планирует повторную отправку заявки. */
export interface DispatchClock {
  /**
   * Назначает повтор с указанной задержкой.
   * @param seconds Задержка перед повтором в миллисекундах.
   */
  retry(delayMs: number): void
}

/** Хранит задержку между повторными отправками. */
export class RetryTimer {
  #delayMs: number

  /**
   * Задаёт начальную задержку.
   * @param {number} delayMs Задержка перед первым повтором в миллисекундах.
   */
  constructor(delayMs: number) {
    this.#delayMs = delayMs
  }

  /** Увеличивает задержку между повторными отправками. */
  postpone(extraMs: number): void {
    this.#delayMs += extraMs
  }
}
