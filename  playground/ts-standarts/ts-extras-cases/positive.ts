import { objectEntries as entries, objectFromEntries as from } from 'ts-extras'
import type { IsEqual as Equal, Writable as Mutable } from 'type-fest'

declare const ids: readonly string[]
declare const values: Array<string | null | undefined>
declare const text: string
declare const num: number
declare const input: unknown
declare const remainder: never
declare const allowed: boolean
declare const key: 'gate' | 'missing'
declare const labels: ReadonlyMap<string, number>
declare const codes: ReadonlySet<string>
const tuple = ['F42', 'F73'] as const
const data = { gate: 'A1', seats: 12 }
const isString = (v: unknown): v is string => typeof v === 'string'

export const examples = () => {
  ids.length === 0 // expect: is-empty
  0 < ids.length // expect: is-non-empty
  ids.length >= 2 // expect: has-at-least
  input !== undefined // expect: is-defined
  input !== null && input !== undefined // expect: is-present
  values.filter(v => v !== undefined) // expect: is-defined-filter
  values.filter(v => v != null) // expect: is-present-filter
  values.filter(Boolean) // expect: is-truthy
  values.filter(v => !isString(v)) // expect: not
  ;[{ gate: 'A1' }, { gate: undefined }].filter(v => v.gate !== undefined) // expect: is-property-defined
  ;[{ gate: 'A1' }, { gate: null }].filter(v => v.gate != null) // expect: is-property-present
  Array.isArray(input) // expect: array-is-array
  Number.isFinite(input) // expect: is-finite
  Number.isInteger(input) // expect: is-integer
  Number.isSafeInteger(input) // expect: is-safe-integer
  num === Infinity || num === Number.NEGATIVE_INFINITY // expect: is-infinite
  ids.at(-1) // expect: array-at
  ids.concat(['F91']) // expect: array-concat
  tuple[0] // expect: array-first
  tuple[tuple.length - 1] // expect: array-last
  ids.includes('F42') // expect: array-includes
  ids.indexOf('F42') // expect: array-index-of
  ids.lastIndexOf('F42') // expect: array-last-index-of
  ids.join(', ') // expect: array-join
  labels.has('F42') // expect: map-has
  codes.has('F73') // expect: set-has
  text.startsWith('F') // expect: string-starts-with
  text.endsWith('.ts') // expect: string-ends-with
  text.split(':') // expect: string-split
  key in data // expect: key-in
  Object.keys(data) // expect: object-keys
  Object.values(data) // expect: object-values
  Object.entries(data) // expect: object-entries
  Object.fromEntries([['gate', 'B2']]) // expect: object-from-entries
  Object.assign({}, { gate: 'B2' }) // expect: object-assign
  Object.hasOwn(data, 'gate') // expect: object-has-own
  Reflect.has(data, 'gate') // expect: object-has-in
  from(entries(data).map(([k, v]) => [k, String(v)])) // expect: object-map-values
  if (!allowed) { throw new Error('Посадка закрыта') } // expect: assert
  if (input === undefined) { throw new TypeError('Нужен вход') } // expect: assert-defined
  if (input == null) { throw new TypeError('Нужен рейс') } // expect: assert-present
  if (!(input instanceof Error)) { throw new TypeError('Ожидалась ошибка') } // expect: assert-error
  const exhaustive: never = remainder // expect: assert-never
  tuple as Mutable<typeof tuple> // expect: as-writable
  'F42' as string // expect: safe-cast-to
  const check: Equal<1, 1> = true // expect: is-equal-type
}
