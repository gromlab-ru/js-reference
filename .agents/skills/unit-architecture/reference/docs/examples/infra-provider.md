# Инфраструктурный Provider

## Задача

Приложению нужен Query Client и framework Provider для подключения его lifecycle.

## Решение

```text
infra/query-client/
├── index.ts
├── libs/
│   └── create-query-client.ts
└── providers/
    ├── query-client-provider.tsx
    └── query-client-context.ts
```

Query Client является одной технической ответственностью слоя `infra`. Provider, context и factory — детали её реализации.

```ts
// infra/query-client/index.ts
export { createQueryClient } from './libs/create-query-client'
export { QueryClientProvider } from './providers/query-client-provider'
```

`app` подключает готовую возможность:

```text
app/providers → infra/query-client
```

Наличие JSX не переносит Query Client в `ui` или `compositions`: результат остаётся техническим.

## Когда нужен вложенный юнит

Provider становится вложенным юнитом только при появлении отдельной ответственности и самостоятельного контракта для Query Client. Сам framework-компонент недостаточен.

## Сегменты примера

```text
infra/query-client/
├── index.ts
├── libs/
└── providers/
```

`libs` и `providers` здесь являются сегментами одного юнита. Документация не нормирует их смысл: команда приложения может выбрать другие имена и структуру.

## Антипример

```text
infra/query-client/
├── index.ts
└── providers/query-client-provider/
    ├── index.ts
    └── ...
```

Создание фасета для каждого component механически раздувает граф юнитов и подменяет ответственность типом файла.
