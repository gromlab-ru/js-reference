# Сборка API-клиента

`createApiClient` создаёт готовый к работе клиент из HTTP-клиента и операций. После сборки методы можно вызывать без
передачи HTTP-клиента в каждый запрос.

Клиент может включать все операции API или только те, которые нужны для конкретной задачи.

## Полный клиент

Полный клиент создаётся из `operationsTree` и предоставляет все входящие в него методы:

```ts
import {
  createApiClient,
  operationsTree,
} from './generated'

import { httpClient } from './transport'

export const petStoreApi = createApiClient(
  httpClient,
  operationsTree,
)
```

Структура `operationsTree` определяет пути методов. Например, операция `getPet` из группы `pets` становится методом
`petStoreApi.pets.getPet`:

```ts
const pet = await petStoreApi.pets.getPet({
  id: '42',
})
```

Используй полный клиент, если приложению нужна большая часть API.

## Частичный клиент

Если нужны только отдельные методы, импортируй соответствующие операции и собери из них частичный клиент:

```ts
import { createApiClient } from './generated'
import { getPet } from './generated/operations/get-pet'
import { searchPets } from './generated/operations/search-pets'

import { httpClient } from './transport'

export const petDetailsApi = createApiClient(httpClient, {
  getPet,
})

export const petCatalogApi = createApiClient(httpClient, {
  pets: {
    getPet,
    searchPets,
  },
})
```

Каждый клиент предоставляет только свои методы:

```ts
const pet = await petDetailsApi.getPet({
  id: '42',
})

const catalogPet = await petCatalogApi.pets.getPet({
  id: '42',
})
```

Одна операция может входить в несколько клиентов. Такие клиенты используют общий `httpClient`.
