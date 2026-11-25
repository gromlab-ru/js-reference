import { hasAtLeast, isDefined, isEmpty, isNonEmpty, isPresent, isTruthy } from 'ts-extras'
import type { IsEqual } from 'type-fest'
import type { Ids } from './imported.js'

type ListLike = {
  length: number
  includes(value: string): boolean
  filter(callback: (value: string | null) => boolean): string[]
}

export const skip = (xs: Ids, text: string, list: ListLike, bytes: Uint8Array, limit: number, optional?: string[]) => {
  xs.length > 0
  text.length > 0
  text.includes('F')
  list.length === 0
  list.includes('F')
  list.filter(v => v != null)
  bytes.length >= 2
  optional?.length === 0
  for (let index = 0; index < xs.length; index += 1) { console.log(index) }
  return xs.length > limit
}

export const shadow = (Number: { isFinite(x: unknown): boolean }, undefined: string, items: string[]) => {
  Number.isFinite(1)
  items.filter(v => v !== undefined)
  return ['text'].map(items => items.length > 0)
}

export const correct = (ids: readonly string[], n: number, input: unknown, text: string) => {
  if (isNonEmpty(ids)) { console.log(ids[0]) }
  isEmpty(ids)
  hasAtLeast(ids, 2)
  ;[0, false, '', null].filter(isPresent)
  ;[0, '', undefined].filter(isDefined)
  ;[0, false, ''].filter(isTruthy)
  ids.filter(Boolean)
  ids.filter(v => !v.trim())
  ;[{ get gate() { return text } }].filter(v => v.gate != null)
  Reflect.has({}, 'constructor')
  n === Infinity
  input as string
  'open' as const
}

type Writable<T> = T
declare const state: { id: string }
export const unchanged = state as Writable<typeof state>
export const visible: IsEqual<1, 1> = true

export const unrelated = (number: number, options: string[] | string, key: string | number, map: Map<string, number>) => {
  options.includes('F')
  map.has(String(key).trim())
  const tuple: [number, number] = [1, 2]
  tuple[0] = 3
  tuple[0]++
  const callbacks = [() => number] as const
  callbacks[0]()
  callbacks[0]!()
  Array.isArray({ id: 'F42' } as const)
  const symbols: symbol[] = []
  symbols.join(',')
  ;[{ get gate() { return 'A1' } }].filter(v => v.gate !== undefined)
  if (number === Number.POSITIVE_INFINITY) { return 'Плюс' }
  return number satisfies number
}
