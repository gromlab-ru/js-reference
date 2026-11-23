// =============================================================================
// Ранний возврат или вложенное условие
//
// Где проще найти основной путь при двух причинах отказа?
// =============================================================================
{
  type Order = { paid: boolean }

  // Вариант А
  const nested = (order?: Order) => {
    if (order) {
      if (order.paid) return 'Отправить'
      return 'Ждём оплату'
    }
    return 'Нет заказа'
  }

  // Вариант Б
  const early = (order?: Order) => {
    if (!order) return 'Нет заказа'
    if (!order.paid) return 'Ждём оплату'
    return 'Отправить'
  }
}

// =============================================================================
// Условное выражение или if / else
//
// Сравниваем две записи выбора ровно одного из двух значений.
// =============================================================================
{
  // Вариант А
  const short = (paid: boolean) => paid ? 'Оплачено' : 'К оплате'

  // Вариант Б
  const expanded = (paid: boolean) => {
    if (paid) {
      return 'Оплачено'
    } else {
      return 'К оплате'
    }
  }
}

// =============================================================================
// Составное условие
//
// Помогает ли имя увидеть, почему оплаченный заказ ещё нельзя отправить?
// =============================================================================
{
  const order = { paid: true, reserved: false, blocked: false }

  // Вариант А
  const inline = order.paid && order.reserved && !order.blocked

  // Вариант Б
  const isReadyForShipment = order.paid && order.reserved
  const canShip = isReadyForShipment && !order.blocked
}

// =============================================================================
// ||, ?? или явная проверка
//
// 0 означает «не повторять». Какой результат даст подстановка значения по умолчанию?
// =============================================================================
{
  // Вариант А
  const truthy = (retries?: number) => retries || 3

  // Вариант Б
  const nullish = (retries?: number) => retries ?? 3

  // Вариант В
  const explicit = (retries?: number) => retries === undefined ? 3 : retries

  ;[truthy(0), nullish(0), explicit(0)] // [3, 0, 0]
}

// =============================================================================
// Выбор из нескольких вариантов
//
// Сравниваем switch, цепочку if и таблицу для одного конечного списка статусов.
// =============================================================================
{
  type State = 'queued' | 'sent' | 'failed'

  // Вариант А
  function bySwitch(state: State) {
    switch (state) {
      case 'queued': return 'В очереди'
      case 'sent': return 'Отправлено'
      case 'failed': return 'Ошибка'
    }
  }

  // Вариант Б
  function byIf(state: State) {
    if (state === 'queued') return 'В очереди'
    if (state === 'sent') return 'Отправлено'
    return 'Ошибка'
  }

  // Вариант В
  const labels = { queued: 'В очереди', sent: 'Отправлено', failed: 'Ошибка' } satisfies Record<State, string>
  const byKey = (state: State) => labels[state]
}

// =============================================================================
// Полнота разбора вариантов
//
// Добавьте к исходам 'cancelled'. В каком варианте компилятор потребует новую ветку?
// =============================================================================
{
  type Outcome = 'accepted' | 'rejected'

  // Вариант А — новый исход получит старую подпись.
  const fallback = (outcome: Outcome) => outcome === 'accepted' ? 'Принято' : 'Отказ'

  // Вариант Б — при расширении Outcome проверка never перестанет проходить.
  function exhaustive(outcome: Outcome): string {
    switch (outcome) {
      case 'accepted': return 'Принято'
      case 'rejected': return 'Отказ'
    }
    return outcome satisfies never
  }
}

// =============================================================================
// continue, break и return
//
// Пропустить запись, закончить обход или закончить функцию — на одном списке.
// =============================================================================
{
  const amounts = [1, -1, 2, 0, 3]

  // Вариант А — continue пропускает отрицательные, break останавливает на нуле.
  function beforeZero(values: number[]) {
    const result: number[] = []
    for (const value of values) {
      if (value < 0) continue
      if (value === 0) break
      result.push(value)
    }
    return { values: result, finished: true }
  }

  // Вариант Б — в точке остановки return возвращает отдельный исход.
  function untilZero(values: number[]) {
    const result: number[] = []
    for (const value of values) {
      if (value < 0) continue
      if (value === 0) return { values: result, finished: false }
      result.push(value)
    }
    return { values: result, finished: true }
  }
  beforeZero(amounts) // { values: [1, 2], finished: true }
  untilZero(amounts) // { values: [1, 2], finished: false }
}
