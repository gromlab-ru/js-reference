/**
 * Неожиданный технический сбой, передаваемый application boundary.
 */
export class ApplicationDefect extends Error {
  readonly name = 'ApplicationDefect'

  /**
   * Создаёт defect без интерпретации исходной ошибки как ожидаемого исхода.
   */
  constructor(
    readonly operation: string,
    readonly cause: unknown
  ) {
    super(`Unexpected defect in ${operation}`)
  }
}

/**
 * Нормализует неизвестный сбой ровно один раз.
 */
export const toApplicationDefect = (
  operation: string,
  cause: unknown
): ApplicationDefect => {
  if (cause instanceof ApplicationDefect) {
    return cause
  }

  return new ApplicationDefect(operation, cause)
}
