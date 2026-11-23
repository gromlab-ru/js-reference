// =============================================================================
// Отсутствие значения, результат с причиной или исключение
//
// Что узнает вызывающий код, если заказ не найден?
// =============================================================================
{
  const totals = new Map([['o1', 0]])

  // Вариант А — отсутствие является обычным результатом.
  const find = (id: string) => totals.get(id)
  find('o2') // undefined

  // Вариант Б — причину можно разобрать без исключения.
  const lookup = (id: string) => {
    const total = find(id)
    return total === undefined ? { ok: false, reason: 'missing' } as const : { ok: true, total } as const
  }
  lookup('o2') // { ok: false, reason: 'missing' }

  // Вариант В — продолжение обычной ветки требует найденного заказа.
  const requireTotal = (id: string) => {
    const total = find(id)
    if (total === undefined) throw new Error(`Нет заказа ${id}`)
    return total
  }
  requireTotal('o1') // 0
  try {
    requireTotal('o2')
  } catch (error) {
    if (error instanceof Error) {
      error.message // 'Нет заказа o2'
    }
  }
}

// =============================================================================
// Error или предметная ошибка
//
// Нужен ли вызывающему коду номер заказа отдельно от сообщения для человека?
// =============================================================================
{
  // Вариант А
  const plain = new Error('Нет заказа o1')

  // Вариант Б
  class MissingOrder extends Error {
    constructor(readonly orderId: string) { super(`Нет заказа ${orderId}`) }
  }
  const specific = new MissingOrder('o1')
  ;[plain.message, specific.orderId] // ['Нет заказа o1', 'o1']
}

// =============================================================================
// Границы try
//
// JSON корректен, но в нём нет нужного поля. Получит ли эта ошибка верное описание?
// =============================================================================
{
  function getTitle(value: unknown): string {
    if (typeof value === 'object' && value !== null && 'title' in value && typeof value.title === 'string') {
      return value.title
    }
    throw new Error('Нет заголовка')
  }

  // Вариант А — общий обработчик скрывает различие причин.
  const wide = (text: string) => {
    try { return getTitle(JSON.parse(text)) } catch { return 'Неверный JSON' }
  }

  // Вариант Б — только синтаксическая ошибка становится сообщением о JSON.
  const narrow = (text: string) => {
    let value: unknown
    try { value = JSON.parse(text) } catch { return 'Неверный JSON' }
    return getTitle(value)
  }
  wide('{}') // 'Неверный JSON'
  try { narrow('{}') } catch (error) { if (error instanceof Error) error.message } // 'Нет заголовка'
}

// =============================================================================
// Неизвестное значение в catch
//
// Внешняя операция может бросить строку вместо Error. Какая причина сохранится?
// =============================================================================
{
  const remote = () => { throw 'Нет связи' }
  try {
    remote()
  } catch (reason) {
    // Вариант А — единое сообщение для любых отказов.
    const generic = 'Не удалось загрузить'

    // Вариант Б — известные формы причины сохраняются.
    const detail = reason instanceof Error ? reason.message
      : typeof reason === 'string' ? reason : generic
    detail // 'Нет связи'
  }
}

// =============================================================================
// Повторный выброс и cause
//
// Что получает внешний обработчик: исходную ошибку или контекст плюс исходную причину?
// =============================================================================
{
  const original = new Error('Закончилась память')
  const write = () => { throw original }

  // Вариант А
  const rethrow = () => {
    try { write() } catch (cause) { throw cause }
  }

  // Вариант Б
  const wrap = () => {
    try { write() } catch (cause) { throw new Error('Не удалось сохранить чек', { cause }) }
  }
  try { rethrow() } catch (error) { error === original } // true
  try { wrap() } catch (error) { error instanceof Error && error.cause === original } // true
}

// =============================================================================
// Освобождение ресурса
//
// Останется ли сеанс открытым после успешной записи и после исключения?
// =============================================================================
{
  const sessions = new Set<string>()
  const write = (fail: boolean) => { if (fail) throw new Error('Запись прервана') }

  // Вариант А — освобождение только на обычном пути.
  const onSuccess = (fail: boolean) => {
    sessions.add('a')
    write(fail)
    sessions.delete('a')
  }

  // Вариант Б — освобождение на обоих путях.
  const onExit = (fail: boolean) => {
    sessions.add('b')
    try { write(fail) } finally { sessions.delete('b') }
  }
  onSuccess(false)
  onExit(false)
  try { onSuccess(true) } catch { sessions.has('a') } // true
  try { onExit(true) } catch { sessions.has('b') } // false
}
