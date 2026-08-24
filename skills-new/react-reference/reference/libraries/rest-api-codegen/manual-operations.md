# Ручное создание операций

Создавай operation вручную, если сервис не предоставляет OpenAPI или нужный endpoint отсутствует в specification.
Ручные operations принадлежат слою `extensions`: он предоставляет полный `operationsTree`, готовый для сборки API
client.

Если operation существует в OpenAPI, но сгенерирована неверно, не добавляй её в `extensions` и используй
[`overrides`](patching.md).

## Структура extensions

Размещай ручные contracts и operations внутри существующего API-юнита:

```text
<api-unit>/
├── generated/                   # отсутствует у полностью ручного client
├── extensions/
│   ├── data-contracts/
│   ├── operations/
│   │   ├── create-pet.ts
│   │   └── get-pet.ts
│   ├── operations-tree.ts
│   └── index.ts
├── transport.ts
└── <api-name>.ts
```

Состав слоя `extensions`:

- `data-contracts/` — типы для ручных operations;
- `operations/` — operations, созданные вручную;
- `operations-tree.ts` — полный граф ручного client либо generated-граф с добавленными operations;
- `index.ts` — публичные exports слоя.

## Установка

Если client полностью создаётся вручную, установи `@gromlab/rest-api-codegen` как runtime dependency:

```bash
npm install @gromlab/rest-api-codegen
```

Используй package manager текущего проекта. Библиотека предоставляет типы для создания operations, `HttpClient` и
`createApiClient`.

Если `extensions` дополняет generated client, используй API из `generated` и не устанавливай дополнительную runtime
dependency.

## Типы запроса и ответа

Создавай transport types в `extensions/data-contracts`:

```ts
// extensions/data-contracts/pet.ts
export interface Pet {
  id: string
  name: string
}
```

Эти типы описывают wire contract и не заменяют domain models приложения.

## Создание функции запроса

Operation принимает `ApiRequestClient` первым аргументом, входные данные вторым, а `RequestParams` последним. При
сборке API client библиотека автоматически связывает operation с настроенным `HttpClient`:

```ts
// extensions/operations/get-pet.ts
import type {
  ApiRequestClient,
  RequestParams,
} from '@gromlab/rest-api-codegen'

import type { Pet } from '../data-contracts/pet'

export function getPet(
  httpClient: ApiRequestClient,
  { id }: { id: string },
  params: RequestParams = {},
) {
  return httpClient.request<Pet>({
    path: `/pets/${encodeURIComponent(id)}`,
    method: 'GET',
    format: 'json',
    ...params,
  })
}
```

Для полностью ручного client импортируй runtime contracts из `@gromlab/rest-api-codegen`. Если `generated` уже
существует, импортируй совместимые `ApiRequestClient` и `RequestParams` из generated public entry текущего API-юнита.

Явно указывай фактические path, method, query, body, content type, response format и security marker. Path parameters
кодируй через `encodeURIComponent`.

## Создание дерева операций для ручного клиента

Чтобы объединить ручные функции запросов в единый client, создай `extensions/operations-tree.ts`. Файл группирует
operations и экспортирует полный граф для `createApiClient`:

```ts
import { getPet } from './operations/get-pet'

export const operationsTree = {
  pets: {
    getPet,
  },
}
```

В этом режиме API client импортирует `createApiClient` из package, а `operationsTree` — из `extensions`.

## Добавление ручных запросов в сгенерированное дерево операций

Чтобы дополнить сгенерированный client, создай `extensions/operations-tree.ts` на основе дерева из `generated`. Файл
сохраняет сгенерированные operations и добавляет к ним ручные:

```ts
import { operationsTree as generatedOperationsTree } from '../generated'

import { getPetHistory } from './operations/get-pet-history'

export const operationsTree = {
  ...generatedOperationsTree,
  pets: {
    ...generatedOperationsTree.pets,
    getPetHistory,
  },
}
```

Не заменяй через `extensions` существующий generated key. Такой конфликт означает, что operation должна находиться в
`overrides`. Не выполняй слепой shallow merge групп: сохраняй соседние generated operations явным spread каждой
изменяемой группы.

Экспортируй полный tree через `extensions/index.ts` и собирай API client из этого слоя. Подробный выбор слоя описан в
[`api-client.md`](api-client.md).

## Появление OpenAPI

Когда сервис добавляет OpenAPI, сгенерируй `generated` и сопоставь его operations с `extensions`:

1. Удали extension, если generated operation корректно реализует тот же contract.
2. Оставь extension, если endpoint по-прежнему отсутствует в OpenAPI.
3. Перенеси исправление в `overrides`, если endpoint появился, но сгенерирован неверно.
4. Оставь публичную группу и имя метода API client без изменений.

Если все ручные operations заменены generated-операциями, удали `extensions` и переключи API client на generated
`operationsTree`.
