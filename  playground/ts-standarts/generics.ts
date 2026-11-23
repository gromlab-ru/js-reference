// =============================================================================
// Связь между входом и результатом
//
// У первого элемента нужен исходный тип. Для подсчёта элементов он не используется.
// =============================================================================
{
  const ids = ['o1']

  // Вариант А
  {
    function first<T>(items: readonly T[]): T | undefined { return items[0] }
    function count<T>(items: readonly T[]): number { return items.length }
    first(ids) // string | undefined
    count(ids) // number
  }

  // Вариант Б — у first потеряна информация о типе элемента; у count ничего не изменилось.
  {
    function first(items: readonly unknown[]): unknown { return items[0] }
    function count(items: readonly unknown[]): number { return items.length }
    first(ids) // unknown
    count(ids) // number
  }
}

// =============================================================================
// Вывод или явная передача типа
//
// В первом вызове тип выводится из элемента; в пустом массиве такой подсказки нет.
// =============================================================================
{
  const copy = <T>(items: readonly T[]): T[] => [...items]

  // Вариант А
  const inferred = copy(['u1'])

  // Вариант Б
  const explicit = copy<string>(['u1'])
  const empty = copy<string>([])
}

// =============================================================================
// Ограничение extends и выбор ключа
//
// Функции читают одно поле; для какого варианта имя поля задаёт вызывающий код?
// =============================================================================
{
  const user = { id: 'u1', age: 24 }

  // Вариант А — требуется конкретное поле.
  const readId = <T extends { id: string }>(record: T) => record.id
  readId(user) // string

  // Вариант Б — ключ связан с типом результата.
  const read = <T, K extends keyof T>(record: T, key: K): T[K] => record[key]
  read(user, 'age') // number
}

// =============================================================================
// Несколько параметров и тип по умолчанию
//
// Сколько типов нужно указать при обычной ошибке и при предметном коде отказа?
// =============================================================================
{
  // Вариант А
  {
    type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }
    type Amount = Result<number, Error>
    type Payment = Result<number, 'declined'>
  }

  // Вариант Б
  {
    type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E }
    type Amount = Result<number>
    type Payment = Result<number, 'declined'>
  }
}

// =============================================================================
// Отображаемый и условный типы
//
// Одно преобразование: даты формы становятся строками. Где удобнее объяснить шаг?
// =============================================================================
{
  type Form = { createdAt: Date; total: number }

  // Вариант А
  type Inline<T> = { [K in keyof T]: [T[K]] extends [Date] ? string : T[K] }

  // Вариант Б
  type WireValue<V> = [V] extends [Date] ? string : V
  type Named<T> = { [K in keyof T]: WireValue<T[K]> }

  const sent = { createdAt: '2026-01-01', total: 42 }
  sent satisfies Inline<Form>
  sent satisfies Named<Form>
}

// =============================================================================
// Шаблонные литеральные типы и infer
//
// Добавьте в команду третий тип действия. Где придётся обновить список ключей?
// =============================================================================
{
  type Command = 'order:pay' | 'order:cancel'

  // Вариант А — значения перечисляются второй раз.
  type ExplicitAction = 'pay' | 'cancel'

  // Вариант Б — действие извлекается из имени команды.
  type ActionOf<T> = T extends `order:${infer Action}` ? Action : never
  type DerivedAction = ActionOf<Command>

  'cancel' satisfies ExplicitAction
  'cancel' satisfies DerivedAction
}
