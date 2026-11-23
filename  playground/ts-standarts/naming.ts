// =============================================================================
// Форма имени по роли
//
// Как отличить тип, экземпляр, действие и общий предел при чтении одной строки?
// =============================================================================
{
  // Вариант А
  {
    const MAX_RETRIES = 3
    class RetryPlan { limit = MAX_RETRIES }
    type Plan = RetryPlan
    const makePlan = (): Plan => new RetryPlan()
    const retryPlan = makePlan()
  }

  // Вариант Б
  {
    const maxRetries = 3
    class RetryPlan { limit = maxRetries }
    type Plan = RetryPlan
    const makePlan = (): Plan => new RetryPlan()
    const retryPlan = makePlan()
  }
}

// =============================================================================
// Логические значения
//
// Состояние, наличие данных, разрешение и решение о показе — разные вопросы.
// =============================================================================
{
  const item = { archived: false, errors: ['Нет адреса'], editable: true }

  // Вариант А
  {
    const isArchived = item.archived
    const hasErrors = item.errors.length > 0
    const canEdit = item.editable && !isArchived
    const shouldShowErrors = canEdit && hasErrors
  }

  // Вариант Б
  {
    const archived = item.archived
    const errorsPresent = item.errors.length > 0
    const editingAllowed = item.editable && !archived
    const showErrors = editingAllowed && errorsPresent
  }
}

// =============================================================================
// Коллекция, идентификаторы и индекс
//
// Видно ли из имени, что найдётся в коллекции и по какому ключу искать?
// =============================================================================
{
  // Вариант А
  {
    const users = [{ id: 'u1' }]
    const userIds = users.map(user => user.id)
    const usersById = new Map(users.map(user => [user.id, user]))
    userIds.map(id => usersById.get(id))
  }

  // Вариант Б
  {
    const userList = [{ id: 'u1' }]
    const ids = userList.map(user => user.id)
    const userMap = new Map(userList.map(user => [user.id, user]))
    ids.map(id => userMap.get(id))
  }
}

// =============================================================================
// Обработчик и принимающий его параметр
//
// Видно ли, где действие реализовано, а где его передают вызывающему коду?
// =============================================================================
{
  // Вариант А
  {
    const handleSelect = (id: string) => id.toUpperCase()
    const select = (id: string, onSelect: typeof handleSelect) => onSelect(id)
    select('u1', handleSelect)
  }

  // Вариант Б
  {
    const formatSelection = (id: string) => id.toUpperCase()
    const select = (id: string, callback: typeof formatSelection) => callback(id)
    select('u1', formatSelection)
  }
}

// =============================================================================
// Сокращения и единицы измерения
//
// Как пишутся ID и URL внутри имени? Понятна ли единица тайм-аута без документации?
// =============================================================================
{
  // Вариант А
  const request = { userId: 'u1', apiUrl: '/orders', timeoutMs: 1500 }

  // Вариант Б
  const options = { userID: 'u1', apiURL: '/orders', timeout: 1500 }
}

// =============================================================================
// Имена типов и параметров типа
//
// Какие имена позволяют различить настройки, вход операции и её результат?
// =============================================================================
{
  // Вариант А
  {
    type PageOptions = { limit: number }
    type SearchParams = { query: string }
    type SearchResult<TItem> = { items: TItem[] }
    type Search<TItem> = (params: SearchParams, options: PageOptions) => SearchResult<TItem>
  }

  // Вариант Б
  {
    type Options = { limit: number }
    type Params = { query: string }
    type Result<T> = { items: T[] }
    type Search<T> = (params: Params, options: Options) => Result<T>
  }
}
