/**
 * Исключает только null и undefined из типа значения.
 *
 * Сохраняет допустимые значения 0, false и пустую строку.
 */
export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value != null
}

/**
 * Проверяет, что значение равно null или undefined.
 *
 * Не считает отсутствующими 0, false и пустую строку.
 */
export const isNotDefined = <T>(value: T | null | undefined): value is null | undefined => {
  return value == null
}

/**
 * Проверяет, что неизвестное значение является строкой.
 *
 * Проверяет только тип без требований к содержимому строки.
 */
export const isString = (value: unknown): value is string => {
  return typeof value === 'string'
}

/**
 * Проверяет тип number, включая NaN и бесконечности.
 */
export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number'
}

/**
 * Проверяет, что неизвестное значение является логическим.
 *
 * Принимает только литеральные значения true и false.
 */
export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean'
}

/**
 * Проверяет, что в строке есть хотя бы один непробельный символ.
 */
export const isNonEmptyString = (value: string): boolean => {
  return value.trim().length > 0
}

/**
 * Проверяет, что значение является массивом без проверки элементов.
 *
 * Для проверки формы элементов используй isArrayOf.
 */
export const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value)
}

/**
 * Метка существует только в типах: обычный T[] может содержать пропуски.
 */
declare const DENSE_ARRAY: unique symbol

/**
 * Массив, в котором на момент проверки есть собственный элемент по каждому индексу.
 */
type DenseArray<T> = T[] & {
  /** Отличает подтверждённый массив от произвольного T[] в ветке отказа. */
  readonly [DENSE_ARRAY]: true
}

/**
 * Проверяет каждый индекс внешнего массива, в том числе когда T допускает undefined.
 */
export const isArrayOf = <T>(value: unknown, isItem: (item: unknown) => item is T): value is DenseArray<T> => {
  if (!isArray(value)) {
    return false
  }

  for (let index = 0; index < value.length; index += 1) {
    if (!hasOwn(value, index) || !isItem(value[index])) {
      return false
    }
  }

  return true
}

/**
 * Считает null, undefined и массив без элементов пустым списком.
 *
 * Предназначен для условий с единой обработкой пустого списка.
 */
export const isEmptyArray = (value: readonly unknown[] | null | undefined): boolean => {
  return !Array.isArray(value) || value.length === 0
}

/**
 * Сужает существующий массив до непустого кортежа.
 *
 * Гарантирует наличие первого элемента после успешной проверки.
 */
export const isNonEmptyArray = <T>(value: readonly T[] | null | undefined): value is readonly [T, ...T[]] => {
  return Array.isArray(value) && hasOwn(value, 0)
}

/**
 * Проверяет, что значение является объектом, исключая null и массивы.
 *
 * Не проверяет конкретные поля полученной записи.
 */
export const isRecord = (value: unknown): value is Record<PropertyKey, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Проверяет наличие собственного свойства объекта и сужает его тип.
 *
 * Используется после проверки объекта через isRecord.
 */
export const hasOwn = <K extends PropertyKey>(value: object, key: K): value is Record<K, unknown> => {
  return Object.prototype.hasOwnProperty.call(value, key)
}

/**
 * Проверяет вхождение значения в неизменяемый список допустимых литералов.
 *
 * Сужает unknown до объединения типов элементов переданного списка.
 */
export const isOneOf = <T extends readonly unknown[]>(value: unknown, values: T): value is T[number] => {
  return values.some((item) => item === value)
}
