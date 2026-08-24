# @gromlab/rest-api-codegen

`@gromlab/rest-api-codegen` помогает создавать типизированные REST API-клиенты автоматически из OpenAPI или вручную.
Библиотека предоставляет операции для выполнения запросов, настраиваемый `HttpClient` и функцию `createApiClient` для
сборки готового клиента.

## Возможности

- Автоматическая генерация типов и операций из OpenAPI.
- Ручное создание операций, если OpenAPI отсутствует или не содержит нужный endpoint.
- Общая настройка URL, авторизации, обработки ошибок и других параметров запросов через `HttpClient`.
- Исправление сгенерированных операций и типов без изменения generated-файлов.
- Сборка полного клиента, частичных клиентов или прямой вызов отдельной операции.
- Создание общего SDK для нескольких приложений.

## Быстрый старт

Перед созданием нового клиента проверь, нет ли в проекте готового клиента или SDK для нужного REST API.

В примере клиент Pet Store размещается в `src/infra/pet-store-api`:

```text
src/infra/pet-store-api/
├── generated/             # если используется OpenAPI
├── extensions/            # если нужны ручные операции
├── overrides/             # если нужны исправления
├── transport.ts
├── pet-store-api.ts
└── index.ts
```

Создавай только необходимые каталоги.

### 1. Подготовь операции

Если сервис предоставляет OpenAPI, сгенерируй типы и операции:

```bash
npx --yes @gromlab/rest-api-codegen@5.2.4 \
  --input https://api.example.com/openapi.json \
  --output ./src/infra/pet-store-api/generated
```

Зафиксируй команду в `package.json`, чтобы последующие запуски использовали одну версию и параметры. Подробнее:
[`Автоматическая генерация`](automatic-generation.md).

Если OpenAPI отсутствует или в ней нет нужного endpoint, создай [`операцию вручную`](manual-operations.md). Ошибки в
сгенерированных операциях и типах исправляй через [`overrides`](patching.md), не изменяя generated-файлы.

### 2. Настрой HTTP-клиент

Создай `transport.ts` и укажи общие настройки REST API:

```ts
import { HttpClient } from './generated'

export const httpClient = new HttpClient({
  baseUrl: 'https://api.example.com',
})
```

Авторизацию, обработку ошибок и другие возможности смотри в разделе [`HTTP transport`](transport.md).

### 3. Собери API-клиент

Свяжи HTTP-клиент с подготовленными операциями в `pet-store-api.ts`:

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

Клиент может содержать все операции или только нужную часть. Варианты сборки описаны в разделе
[`Сборка API-клиента`](api-client.md).

### 4. Экспортируй клиент, операции и типы

Экспортируй из `index.ts` готовый клиент, HTTP-клиент, операции и типы:

```ts
export { petStoreApi } from './pet-store-api'
export { httpClient } from './transport'

export type * from './generated/data-contracts'
export * from './generated/operations'
```

### 5. Используй клиент

Импортируй клиент и вызывай его методы:

```ts
import { petStoreApi } from '@/infra/pet-store-api'

const pet = await petStoreApi.pets.getPet({ id: '42' })
```

Настройка отдельного запроса, его отмена и прямой вызов операции показаны в разделе
[`Использование API-клиента`](usage.md).

## Карта документации

- [`Автоматическая генерация`](automatic-generation.md) — создание типов и операций из OpenAPI.
- [`Ручное создание операций`](manual-operations.md) — работа без OpenAPI и добавление отсутствующих endpoint.
- [`Исправление операций и типов`](patching.md) — исправление generated-кода без его редактирования.
- [`HTTP transport`](transport.md) — общие настройки запросов, авторизации и обработки ошибок.
- [`Сборка API-клиента`](api-client.md) — полный и частичный клиенты.
- [`Использование API-клиента`](usage.md) — вызов методов, настройка и отмена запросов.
- [`REST SDK`](sdk.md) — общий клиент для нескольких приложений.

## Источники

- [Пакет в npm](https://www.npmjs.com/package/@gromlab/rest-api-codegen)
- [Репозиторий и официальная документация](https://github.com/gromlab-ru/rest-api-codegen)
- [Agent skill `rest-api-codegen-ru`](../../../../../.agents/skills/rest-api-codegen-ru/SKILL.md)

Используй доступный в проекте agent skill `rest-api-codegen-ru`. Если его нет, установи командой:

```bash
npx skills add gromlab-ru/rest-api-codegen-ru
```
