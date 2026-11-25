// 1. Массив: пустота, наличие элементов и минимальная длина
export const isBoardEmpty = (ids: readonly string[]): boolean => ids.length === 0

export const hasFlights = (ids: readonly string[]): boolean => {
  return ids.length > 0
}

export const hasReturnLeg = (ids: readonly string[]): boolean => ids.length >= 2

// Здесь нужен сам размер: в обоих файлах замечания нет.
export const countFlights = (ids: readonly string[]): number => ids.length

// 2. Измерения: убрать пропуски, но сохранить нулевую задержку
export const reportedDelays = (delays: ReadonlyArray<number | null | undefined>): number[] =>
  delays.filter(delay => delay !== null && delay !== undefined)

// null обозначает «ещё не измерено» и должен остаться.
export const definedDelays = (delays: ReadonlyArray<number | null | undefined>): Array<number | null> =>
  delays.filter(delay => delay !== undefined)

// 3. Число: проверка, что номер выхода целый
export const isGateNumber = (value: unknown): boolean => Number.isInteger(value)

// 4. Типы: именованные варианты и запись массива
export type Destination = { airport: string } | { station: string }

export type DestinationList = ReadonlyArray<Destination>

// 5. Исполняемый код: переменной не присваивается новое значение
export const getFlightLabel = (id: string): string => {
  let prefix = 'Рейс'
  return `${prefix} ${id}`
}

// 6. Ревью: по контракту код принимает только Error из своего контекста JavaScript.
export const getLocalErrorMessage = (value: unknown): string => {
  if (!(value instanceof Error)) {
    throw new TypeError('Ожидалась локальная ошибка')
  }
  return value.message
}
