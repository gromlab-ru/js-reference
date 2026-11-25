import { hasAtLeast, isDefined, isEmpty, isInteger, isNonEmpty, isPresent } from 'ts-extras'

// 1. Массив: пустота, наличие элементов и минимальная длина
export const isBoardEmpty = (ids: readonly string[]): boolean => isEmpty(ids)

export const hasFlights = (ids: readonly string[]): boolean => {
  return isNonEmpty(ids)
}

export const hasReturnLeg = (ids: readonly string[]): boolean => hasAtLeast(ids, 2)

// Здесь нужен сам размер: в обоих файлах замечания нет.
export const countFlights = (ids: readonly string[]): number => ids.length

// 2. Измерения: убрать пропуски, но сохранить нулевую задержку
export const reportedDelays = (delays: ReadonlyArray<number | null | undefined>): number[] => delays.filter(isPresent)

// null обозначает «ещё не измерено» и должен остаться.
export const definedDelays = (delays: ReadonlyArray<number | null | undefined>): Array<number | null> =>
  delays.filter(isDefined)

// 3. Число: проверка, что номер выхода целый
export const isGateNumber = (value: unknown): boolean => isInteger(value)

// 4. Типы: именованные варианты и запись массива
type Airport = {
  airport: string
}

type Station = {
  station: string
}

export type Destination = Airport | Station

export type DestinationList = readonly Destination[]

// 5. Исполняемый код: переменной не присваивается новое значение
export const getFlightLabel = (id: string): string => {
  const prefix = 'Рейс'
  return `${prefix} ${id}`
}

// 6. Ревью: по контракту код принимает только Error из своего контекста JavaScript.
export const getLocalErrorMessage = (value: unknown): string => {
  // biome-ignore lint/plugin/conditions: assertError допускает также ошибки из другого контекста JavaScript.
  if (!(value instanceof Error)) {
    throw new TypeError('Ожидалась локальная ошибка')
  }
  return value.message
}

// 7. Ранние возвраты: отмена рейса важнее сведений о задержке
export const getDepartureLabel = (isCancelled: boolean, delayMinutes: number | null): string => {
  if (isCancelled) {
    return 'Рейс отменён'
  }

  if (!isPresent(delayMinutes)) {
    return 'Нет данных о задержке'
  }

  return delayMinutes === 0 ? 'По расписанию' : `Задержка: ${delayMinutes} мин`
}
