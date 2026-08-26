# SWR

Используй `swr` в browser-only React SPA на Vite для двух задач:

1. Получение и client cache REST GET-data через публичный domain hook.
2. Получение realtime updates через публичный domain subscription hook.

Архитектурный маршрут, domain contract и выбор между hook и adapter определены в основной инструкции [`Data fetching в React`](../../application/data-fetching/README.md). Этот раздел описывает только SWR keys, cache, request lifecycle, revalidation и subscriptions.

## Место SWR

```text
React consumer
→ public domain SWR hook
→ domain GET adapter
→ infra REST operation / API client
→ configured HttpClient
→ REST API
```

SWR не создаёт HTTP transport, API client и REST operations. Их предоставляет infra API-модуль, подготовленный по [`@gromlab/rest-api-codegen`](../rest-api-codegen/README.md). Domain adapter выполняет mapping и разрешает source errors до передачи результата в SWR cache.

## Выбор подхода

| Задача | Решение | Референс |
| --- | --- | --- |
| Получить REST server state для render | Public domain hook на `useSWR` | [`get-data.md`](get-data.md) |
| Выполнить imperative GET | Public domain GET adapter без SWR | [`REST data fetching`](../../application/data-fetching/rest.md#императивный-get) |
| Выполнить `POST`, `PUT`, `PATCH`, `DELETE` | Public domain mutation adapter без SWR | [`REST data fetching`](../../application/data-fetching/rest.md#mutations) |
| Получать входящие realtime updates | Public domain hook на `useSWRSubscription` | [`subscriptions.md`](subscriptions.md) |
| Отправить предметную socket command | Public domain adapter/action | [`subscriptions.md`](subscriptions.md#socket-transport) |

## Границы

- Remote fetcher `useSWR` выполняет только HTTP `GET` через domain GET adapter.
- Не используй `useSWRMutation` для REST mutations.
- Mutation adapter не зависит от SWR; cache синхронизирует явный domain lifecycle owner.
- Не создавай в hook `fetch`, `HttpClient`, API client, URL, auth headers или transport error policy.
- Не сохраняй DTO и source errors в domain cache.
- Не копируй SWR data в React state, Context или Zustand без отдельной локальной семантики; применяй правила [`State management`](../../application/state-management/README.md).
- Для private data включай стабильную auth identity в key, но не используй JWT или cookie.
- Не добавляй SWR параллельно существующей data-fetching library без migration boundary.
- Не используй SSR, React Server Components и server preload: этот референс предназначен только для React + Vite SPA.

## Примеры

```text
examples/
├── hooks/
│   ├── use-get-pet/
│   └── use-get-auth-pet/
└── subscriptions/
    └── use-order-subscription/
```

- [`use-get-pet/`](examples/hooks/use-get-pet/) — GET hook поверх domain adapter.
- [`use-get-auth-pet/`](examples/hooks/use-get-auth-pet/) — GET hook со стабильным auth scope в cache key.
- [`use-order-subscription/`](examples/subscriptions/use-order-subscription/) — typed subscription key, callback и cleanup.
- Полный путь от серверного API через предметный адаптер до SWR-хука показан в
  [`demo-app`](../../../demo-app/README.md).

Имена API clients, adapters, public facets и доменных моделей в examples условны. Используй фактические public API и TypeScript-сигнатуры проекта.

Для API SWR, не описанного этими референсами, используй официальную [документацию SWR](https://swr.vercel.app/).
