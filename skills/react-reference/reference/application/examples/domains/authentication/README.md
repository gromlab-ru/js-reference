# Authentication data fetching example

Пример показывает полный путь предметных auth-данных:

```text
React consumer
→ public Authentication hook или adapter
→ Authentication adapter
→ Identity API infra-фасет
→ @gromlab/rest-api-codegen
→ REST API
```

## GET для render

`useGetCurrentUser` использует внутренний `getCurrentUser` adapter как SWR fetcher. Фасет Authentication публикует и hook, и adapter:

- `useGetCurrentUser` используется для React render;
- `getCurrentUser` доступен для imperative GET и кода вне React lifecycle.

Adapter вызывает standalone `getCurrentUser` operation с configured `identityHttpClient`. Такой импорт не требует использовать всё дерево собранного Identity API client.

## Mutations

`signIn` и `signOut` являются публичными domain adapters. Они используют собранный `identityApi`, преобразуют domain/source contracts и не зависят от SWR.

`useAuthenticationActions` вызывает те же adapters и дополнительно владеет React cache lifecycle: меняет current-user entry и очищает private cache при смене identity. Прямой adapter call не имеет скрытого global cache side effect.

## Публичные границы

- `infra/identity-api/index.ts` публикует собранный API client, standalone operations и configured transport.
- `domains/authentication/index.ts` публикует domain adapters, hooks, models и error contracts.
- React consumer предметных auth-данных не импортирует Identity API напрямую.
