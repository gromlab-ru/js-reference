// =============================================================================
// type и interface
//
// Оба описания принимают тот же объект. Повторное объявление с тем же именем
// расширит interface; псевдоним type так расширить нельзя.
// =============================================================================
{
  const ticket = { id: 't1' }

  // Вариант А
  {
    type Ticket = { id: string }
    ticket satisfies Ticket
  }

  // Вариант Б
  {
    interface Ticket { id: string }
    ticket satisfies Ticket
  }
}

// =============================================================================
// Именованный тип или запись на месте
//
// Где удобнее читать поля фильтра: прямо в сигнатуре или в отдельном объявлении?
// =============================================================================
{
  // Вариант А
  const inline = (filter: { city: string; limit: number }) => filter.city

  // Вариант Б
  type SearchFilter = { city: string; limit: number }
  const named = (filter: SearchFilter) => filter.city
}

// =============================================================================
// Необязательное поле или значение undefined
//
// Одинаков ли результат проверки наличия ключа, когда имени нет?
// =============================================================================
{
  // Вариант А
  const omitted: { name?: string } = {}
  Object.hasOwn(omitted, 'name') // false

  // Вариант Б
  const present: { name: string | undefined } = { name: undefined }
  Object.hasOwn(present, 'name') // true
}

// =============================================================================
// Представление состояний
//
// Может ли у состояния ready отсутствовать результат?
// =============================================================================
{
  // Вариант А — независимые поля допускают такое сочетание.
  type Loose = { status: 'loading' | 'ready'; total?: number }
  const incomplete: Loose = { status: 'ready' }

  // Вариант Б — поле зависит от состояния.
  type Tagged = { status: 'loading' } | { status: 'ready'; total: number }
  const complete: Tagged = { status: 'ready', total: 0 }
}

// =============================================================================
// Композиция: extends, пересечение или вложенность
//
// Первые две формы дают плоскую запись. Последняя меняет путь к городу.
// =============================================================================
{
  interface Address { city: string }

  // Вариант А
  interface Extended extends Address { id: string }
  const extended: Extended = { id: 'o1', city: 'Тула' }

  // Вариант Б
  type Flat = Address & { id: string }
  const flat: Flat = extended

  // Вариант В
  type Nested = { id: string; address: Address }
  const nested: Nested = { id: flat.id, address: { city: flat.city } }
  nested.address.city
}

// =============================================================================
// Производные типы
//
// Переименуйте title в исходном типе. В каких объявлениях понадобится вторая правка?
// =============================================================================
{
  type Ticket = { id: string; title: string; note?: string }

  // Вариант А — независимые описания.
  {
    type Summary = { id: string; title: string }
    type Changes = { title?: string; note?: string }
    type Snapshot = { readonly id: string; readonly title: string; readonly note: string }
  }

  // Вариант Б — типы следуют за Ticket.
  {
    type Summary = Pick<Ticket, 'id' | 'title'>
    type Changes = Partial<Omit<Ticket, 'id'>>
    type Snapshot = Readonly<Required<Ticket>>
  }
}

// =============================================================================
// Аннотация, satisfies и as
//
// Наведите курсор на поле mode. Попробуйте убрать его из annotated и checked:
// в отличие от asserted, обе записи потребуют обязательное поле.
// =============================================================================
{
  type Options = { mode: 'fast' | 'full'; retries?: number }

  // Вариант А — переменная получает объявленный тип Options.
  const annotated: Options = { mode: 'fast' }

  // Вариант Б — проверяется форма, сохраняется конкретный литерал.
  const checked = { mode: 'fast' } satisfies Options
  checked.mode satisfies 'fast'

  // Вариант В — компилятору можно пообещать даже отсутствующее поле.
  const asserted = {} as Options
  asserted.mode // Тип 'fast' | 'full', фактическое значение undefined.
}

// =============================================================================
// Массив и кортеж
//
// Сколько координат разрешает передать каждый контракт?
// =============================================================================
{
  // Вариант А — допустимы одна или три координаты.
  const path: number[] = [10, 20]
  path.push(30)

  // Вариант Б — для чтения доступны только две заданные позиции.
  const point: readonly [x: number, y: number] = [10, 20]
  point[1] // 20
}
