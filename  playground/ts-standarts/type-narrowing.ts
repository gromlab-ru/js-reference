// =============================================================================
// unknown или any на входе
//
// На строке обе функции работают. Что происходит, если вместо строки придёт 42?
// =============================================================================
{
  // Вариант А — ошибка обнаружится только при вызове с числом.
  const unchecked = (value: any): string => value.trim()
  try { unchecked(42) } catch (error) { error instanceof TypeError } // true

  // Вариант Б — для числа предусмотрен результат.
  const checked = (value: unknown) => typeof value === 'string' ? value.trim() : null
  checked(42) // null
}

// =============================================================================
// typeof, instanceof, in и поле-признак
//
// Один результат поиска может прийти как текст, ошибка или запись со статусом.
// =============================================================================
{
  type Item = { kind: 'found'; id: string } | { kind: 'missing' }
  type Reply = string | Error | Item

  // Вариант А — наличие поля.
  const byField = (reply: Reply) => {
    if (typeof reply === 'string') return reply
    if (reply instanceof Error) return reply.message
    return 'id' in reply ? reply.id : 'Нет записи'
  }

  // Вариант Б — явный признак варианта.
  const byKind = (reply: Reply) => {
    if (typeof reply === 'string') return reply
    if (reply instanceof Error) return reply.message
    return reply.kind === 'found' ? reply.id : 'Нет записи'
  }
}

// =============================================================================
// Отсутствие значения и ложные значения
//
// 0, false и пустая строка — допустимые ответы; null и undefined означают пропуск.
// =============================================================================
{
  const answers = [0, false, '', null, undefined]

  // Вариант А
  answers.filter(Boolean) // []

  // Вариант Б
  answers.filter(answer => answer !== null && answer !== undefined) // [0, false, '']
}

// =============================================================================
// Проверка содержимого и предикат типа
//
// Ложный результат первой проверки не означает, что значение не является строкой.
// =============================================================================
{
  // Вариант А — проверяется дополнительное условие.
  const hasText = (value: unknown): boolean => typeof value === 'string' && value.trim() !== ''

  // Вариант Б — устанавливается сам тип.
  const isString = (value: unknown): value is string => typeof value === 'string'

  ;[hasText(''), isString('')] // [false, true]
}

// =============================================================================
// Предикат или функция утверждения
//
// Что нужно при неверном типе: выбрать другую ветку или прервать выполнение?
// =============================================================================
{
  // Вариант А
  const isNumber = (value: unknown): value is number => typeof value === 'number'
  const roundOrSkip = (value: unknown) => isNumber(value) ? Math.round(value) : null

  // Вариант Б
  function assertNumber(value: unknown): asserts value is number {
    if (typeof value !== 'number') throw new TypeError('Ожидалось число')
  }
  const roundOrThrow = (value: unknown) => {
    assertNumber(value)
    return Math.round(value)
  }
  roundOrSkip('2') // null
  try { roundOrThrow('2') } catch (error) { error instanceof TypeError } // true
}

// =============================================================================
// Внешний массив объектов
//
// Наличие массива не гарантирует, что у каждой записи есть собственное строковое поле id.
// =============================================================================
{
  type Order = { id: string }
  const response: unknown = [{ id: 'o1' }, { id: 42 }]

  // Вариант А — проверяется только контейнер.
  Array.isArray(response) // true

  // Вариант Б — либо список проверенных записей, либо null при первом несоответствии.
  function readOrders(value: unknown): Order[] | null {
    if (!Array.isArray(value)) return null
    const orders: Order[] = []
    for (let i = 0; i < value.length; i++) {
      if (!Object.hasOwn(value, i)) return null
      const item: unknown = value[i]
      if (typeof item !== 'object' || item === null || !('id' in item) || !Object.hasOwn(item, 'id')) return null
      const id = item.id
      if (typeof id !== 'string') return null
      orders.push({ id })
    }
    return orders
  }
  readOrders(response) // null
  readOrders([{ id: 'o1' }]) // [{ id: 'o1' }]
}

// =============================================================================
// Утверждения as и !
//
// Если Map не содержит ключа, изменяет ли выбранная аннотация результат чтения?
// =============================================================================
{
  const labels = new Map<string, string>()

  // Вариант А — статически string, в обеих переменных фактически undefined.
  const asserted = labels.get('o1') as string
  const nonNull = labels.get('o1')!

  // Вариант Б — отсутствие обработано до обращения к строке.
  const label = labels.get('o1')
  const display = label === undefined ? 'Нет названия' : label.trim()
}
