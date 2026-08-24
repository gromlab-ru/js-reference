# REST API

REST API — способ взаимодействия клиента и сервера поверх HTTP. Доступные операции определяются URL, HTTP-методом, параметрами запроса и возможными ответами. Контракт сервиса может быть формально описан спецификацией OpenAPI.

## Как мы работаем с REST API

Для технического взаимодействия с REST API используется [`@gromlab/rest-api-codegen`](../libraries/rest-api-codegen/README.md).

Если сервис предоставляет OpenAPI, типы и операции [генерируются автоматически](../libraries/rest-api-codegen/automatic-generation.md). Если OpenAPI отсутствует или не содержит нужной операции, она [описывается вручную](../libraries/rest-api-codegen/manual-operations.md) с помощью той же библиотеки.

Generated и manual operations используют общий [`HttpClient`](../libraries/rest-api-codegen/transport.md). Из операций собирается типизированный API client, через который выполняются REST-запросы.

Для REST GET server state, участвующего в React render, используется [`SWR`](../libraries/swr/get-data.md). SWR управляет cache, состоянием запроса, дедупликацией и revalidation, но не выполняет роль HTTP transport: его fetcher вызывает готовую operation API client или предметную operation владельца данных.

Мутирующие и императивные операции выполняются вне SWR через готовый API client. После изменения данных связанные SWR GET keys синхронизируются отдельно.

```text
OpenAPI или manual operations
→ @gromlab/rest-api-codegen
→ общий HttpClient
→ типизированный API client
→ REST API

REST GET для React render
→ SWR
→ готовая operation
→ API client

Mutation или императивный запрос
→ готовая operation
→ API client
```

## Используемые библиотеки

[`@gromlab/rest-api-codegen`](../libraries/rest-api-codegen/README.md) отвечает за типизированные operations, генерацию из OpenAPI, ручное описание операций, HTTP transport и сборку API client.

[`SWR`](../libraries/swr/get-data.md) отвечает за lifecycle и cache REST GET server state, участвующего в React render. SWR не заменяет transport и не используется как второй способ выполнения mutations.

## Использование в приложении

REST API, API client и SWR не определяют архитектурного владельца данных. Правила доступа через домен, преобразования DTO, предметных контрактов, domain errors, размещения hooks и выполнения mutations описаны в разделе [`REST в приложении`](../application/data-fetching/rest.md).
