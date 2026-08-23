# Routing в React SPA

Используй React Router Data Router через `createBrowserRouter` и `RouterProvider`. Routes и route-level сборка готовых возможностей принадлежат слою `app`.

## Почему Data Router

Route objects дают единое дерево URL, layouts, lazy route modules и error boundaries. В этом stack router отвечает за навигацию и route lifecycle, но не становится вторым data-fetching механизмом.

## Граница данных

- Не используй `loader` и `action` для предметных REST-данных.
- GET server state для render получает domain SWR hook.
- Mutation выполняется domain operation из event handler и синхронизирует SWR GET-cache.
- Route component импортирует домен, composition и UI только через публичные фасеты.
- Domain и infra не импортируют router и не выполняют navigation.

Route guards используют уже опубликованный auth contract. Они не читают access token и не вызывают API client напрямую. Пока auth identity определяется, guard показывает явное pending state; после результата он отображает route или выполняет redirect на app boundary.

## Структура

```text
app/router/
├── app-router.tsx
├── route-error-boundary.tsx
└── routes/
    ├── home.route.tsx
    └── account.route.tsx
```

Файлы routes являются реализацией app-owned router, а не самостоятельными юнитами только из-за suffix или lazy loading. Для большой route responsibility подними отдельный screen/composition owner и оставь route module тонкой сборкой.

Рабочий пример находится в [`examples/routing/app-router/`](../examples/routing/app-router/).

## Проверка

- Router создан через `createBrowserRouter` и подключён через `RouterProvider`.
- Route errors обрабатываются app-owned `errorElement`.
- REST GET не выполняется через `loader`, а mutation — через `action`.
- Domain и infra не зависят от React Router.
- Lazy route module не обходит публичные фасеты юнитов.
