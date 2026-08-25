# REST API

REST является базовым протоколом обмена между browser-only React SPA и сервером. URL, HTTP method, request parameters и response schema образуют source contract сервиса; при наличии OpenAPI он генерируется, иначе описывается вручную.

## Технологическая цепочка

```text
OpenAPI или manual source contract
→ @gromlab/rest-api-codegen
→ REST operations
→ configured HttpClient
→ API client или standalone operation
→ REST API
```

[`@gromlab/rest-api-codegen`](../libraries/rest-api-codegen/README.md) отвечает за source types, operations, HTTP transport и сборку API client. Один API-модуль предоставляет один configured transport и необходимые способы вызова:

```ts
petStoreApi.pets.getPet({ id })
```

```ts
getPet(petStoreHttpClient, { id })
```

Standalone operation использует тот же transport и допустима для уменьшения состава lazy chunk. Создавать новый `HttpClient` или дублировать URL, auth и error policy в domain adapter либо React hook нельзя.

## Граница приложения

REST source contract не является предметным контрактом приложения. Domain adapter преобразует domain input в source request, response DTO в domain result, а известную source error — в стабильную domain error.

```text
React consumer
→ public domain hook или adapter
→ domain adapter
→ infra REST API-модуль
→ REST API
```

Для GET server state, участвующего в React render, домен публикует [`SWR hook`](../libraries/swr/get-data.md) поверх своего GET adapter. Императивный GET и mutations выполняются через публичные domain adapters без SWR.

Полный порядок выбора владельца, создания adapter и синхронизации cache описан в [`REST data fetching`](../application/data-fetching/rest.md). Этот технологический документ не заменяет архитектурные правила домена.

## Границы

- React consumer предметных данных не импортирует infra API client или REST operation.
- Domain adapter не публикует DTO и source errors.
- Infra API-модуль не импортирует domain types и не управляет SWR cache.
- SWR не создаёт transport и не используется для mutations.
- Mutation и последующая cache synchronization остаются разными ответственностями.
