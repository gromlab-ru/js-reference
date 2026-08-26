# @gromlab/rest-api-codegen

`@gromlab/rest-api-codegen` помогает создавать типизированные REST API-клиенты автоматически из OpenAPI или вручную.
Библиотека предоставляет операции для выполнения запросов, настраиваемый `HttpClient` и функцию `createApiClient` для
сборки готового клиента.

## Возможности

- Автоматическая генерация типов и операций из OpenAPI.
- Ручное создание API-клиента, если OpenAPI отсутствует.
- Общая настройка URL, авторизации, обработки ошибок и других параметров запросов через `HttpClient`.
- Добавление и исправление операций и типов поверх generated-клиента без изменения generated-файлов.
- Сборка полного клиента, частичных клиентов или прямой вызов отдельной операции.
- Создание общего SDK для нескольких приложений.

## Базовая концепция

Сначала определи источник операций:

- Если сервис предоставляет OpenAPI, создай клиент через [`generated`](automatic-generation.md).
- Если OpenAPI отсутствует, создай клиент вручную в [`extensions`](manual-operations.md).
- Если в OpenAPI не хватает endpoint или сгенерированный контракт неверен, добавь изменения в
  [`overrides`](patching.md).

Структура всегда соответствует одному из вариантов:

```text
generated
generated → overrides
extensions
```

`generated` и `extensions` не используются вместе. `overrides` существует только поверх `generated`.

## Правила

- Размещай API-клиенты только в `src/infra`.
- Для каждого внешнего API создавай отдельный модуль `src/infra/<name>-api`.
- Не изменяй файлы внутри `generated`.
- Импортируй клиент, HTTP-клиент, операции и типы через публичные экспорты API-модуля.

## Быстрый старт

В этом примере создадим API-клиент из OpenAPI и разместим его в `src/infra/pet-store-api`:

```text
src/infra/pet-store-api/
├── generated/
├── transport.ts
├── pet-store-api.ts
└── index.ts
```

### 1. Сгенерируй операции

```bash
npx --yes @gromlab/rest-api-codegen@5.2.4 \
  --input https://api.example.com/openapi.json \
  --output ./src/infra/pet-store-api/generated
```

Добавь команду в `package.json`, чтобы повторная генерация использовала ту же версию и параметры:

```json
{
  "scripts": {
    "generate:pet-store-api": "npx --yes @gromlab/rest-api-codegen@5.2.4 --input https://api.example.com/openapi.json --output ./src/infra/pet-store-api/generated"
  }
}
```

Последующие генерации запускай через project script:

```bash
npm run generate:pet-store-api
```

Подробнее: [`Автоматическая генерация`](automatic-generation.md).

### 2. Настрой HTTP-клиент

Создай `transport.ts`:

```ts
import { HttpClient } from './generated'

export const httpClient = new HttpClient({
  baseUrl: 'https://api.example.com',
})
```

Подробнее о настройках: [`HTTP transport`](transport.md).

### 3. Собери API-клиент

Создай `pet-store-api.ts`:

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

Полный и частичный варианты описаны в разделе [`Сборка API-клиента`](api-client.md).

### 4. Экспортируй клиент, операции и типы

```ts
export { petStoreApi } from './pet-store-api'
export { httpClient } from './transport'

export type * from './generated/data-contracts'
export * from './generated/operations'
```

### 5. Используй клиент

```ts
import { petStoreApi } from 'infra/pet-store-api'

const pet = await petStoreApi.pets.getPet({ id: '42' })
```

Другие варианты вызова показаны в разделе [`Использование API-клиента`](usage.md).

## Карта документации

- [`Автоматическая генерация`](automatic-generation.md) — создание типов и операций из OpenAPI.
- [`Ручное создание операций`](manual-operations.md) — полностью ручной клиент без OpenAPI.
- [`Дополнение и исправление generated-клиента`](patching.md) — ручные изменения поверх generated-кода.
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
