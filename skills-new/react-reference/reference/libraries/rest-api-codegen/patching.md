# Исправление операций и типов

Создавай override, если OpenAPI содержит неверную operation или data contract и исправление сервиса нельзя получить
сразу. Generated output не редактируется: повторная генерация полностью заменит его содержимое.

`overrides` является верхним накопительным слоем. Он использует полный `operationsTree` из `extensions`, если ручные
расширения существуют, иначе — из `generated`. После замены ошибочных ключей `overrides/operations-tree.ts` экспортирует
полный граф для сборки API client.

## Структура overrides

```text
<api-unit>/
├── generated/
├── extensions/                  # необязательный нижний слой
├── overrides/
│   ├── data-contracts/
│   ├── operations/
│   ├── operations-tree.ts
│   └── index.ts
├── transport.ts
└── <api-name>.ts
```

`overrides/data-contracts` содержит исправленные generated types. `overrides/operations` содержит operations, которые
заменяют ошибочные generated operations. Не размещай здесь новый endpoint, отсутствующий в OpenAPI: он принадлежит
[`extensions`](manual-operations.md).

## Исправленный тип

Строй исправленный contract поверх generated type, если его корректная часть пригодна для повторного использования:

```ts
// overrides/data-contracts/pet.ts
import type { Pet as GeneratedPet } from '../../generated/data-contracts'

export type Pet = Omit<GeneratedPet, 'name'> & {
  displayName: string
}
```

Публичный re-export исправленного типа не меняет сигнатуры generated operations, которые импортируют исходный type
напрямую. Если неверный type используется в нескольких operations, исправь каждую затронутую operation.

## Исправленная operation

Исправленная operation повторяет публичное имя и назначение generated operation, но использует корректный wire
contract:

```ts
// overrides/operations/get-pet.ts
import type {
  ApiRequestClient,
  RequestParams,
} from '../../generated'

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

Получай path, method, параметры, response и errors из подтверждённого wire contract. Не исправляй operation на основе
предположения о поведении endpoint.

## Наложение на generated

Если `extensions` отсутствует, используй generated tree как нижний слой:

```ts
import { operationsTree as baseOperationsTree } from '../generated'

import { getPet } from './operations/get-pet'

export const operationsTree = {
  ...baseOperationsTree,
  pets: {
    ...baseOperationsTree.pets,
    getPet,
  },
}
```

## Наложение на extensions

Если API-юнит содержит ручные расширения, накладывай overrides на уже полный extensions tree:

```ts
import { operationsTree as baseOperationsTree } from '../extensions'

import { getPet } from './operations/get-pet'

export const operationsTree = {
  ...baseOperationsTree,
  pets: {
    ...baseOperationsTree.pets,
    getPet,
  },
}
```

В обоих случаях `overrides/operations-tree.ts` предоставляет полный граф. Сохраняй соседние operations явным merge
каждой изменяемой группы. Для consumers путь `petStoreApi.pets.getPet` остаётся прежним.

Экспортируй итоговый tree через `overrides/index.ts`. Пока слой существует, API client импортирует `operationsTree`
только из `overrides`; правила выбора описаны в [`api-client.md`](api-client.md).

## Удаление override

После исправления OpenAPI:

1. Перегенерируй `generated` через project script.
2. Удали исправленные contracts и operations из `overrides`.
3. Удали их подстановку из `overrides/operations-tree.ts`.
4. Если overrides больше не осталось, удали каталог и переключи API client на `extensions` или `generated`.

Публичные группы и имена методов API client при этом не изменяются.

Для SDK package верхний активный слой также должен управлять package exports и точными operation subpaths. Общая
организация package описана в [`sdk.md`](sdk.md).
