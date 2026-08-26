# Маршрутизация в React SPA

Используй React Router Data Router через `createBrowserRouter` и `RouterProvider`. Правила фасета `lazy.ts` и границу
между `app` и `compositions` определяет
[`архитектурный профиль`](../architecture/project-profile.md#граница-app-и-compositions).
Роль отображаемой страницы уточняет документ
[`Композиционные юниты`](../architecture/units/compositions.md).

## Владельцы

Слой `app` владеет:

- конфигурацией React Router и деревом URL;
- вложенностью маршрутов и перенаправлениями;
- глобальными обработчиками ошибок маршрутов;
- подключением роутера к React;
- динамическим импортом публичных фасетов маршрутов.

Группа `compositions/routes` содержит адаптеры React Router. Они связывают дерево URL с экранами, а при необходимости
проверяют доступ, перенаправляют или подключают `Outlet`. Группа `compositions/screens` содержит завершённые экранные
сценарии и владеет их разметкой и действиями.

## Почему Data Router

Объекты маршрутов дают единое дерево URL, `layouts`, динамическую загрузку и обработчики ошибок. Роутер отвечает за
навигацию и жизненный цикл маршрута, но не становится вторым механизмом получения предметных данных.

## Граница данных

- Не используй `loader` и `action` для предметных REST-данных.
- GET-состояние сервера для отображения получает доменный SWR-hook.
- Изменение выполняется доменной операцией из обработчика события и синхронизирует GET-кеш SWR.
- Экран импортирует домены, композиции и UI только через публичные фасеты.
- `domains` и `infra` не импортируют React Router и не выполняют навигацию.

Проверка доступа использует уже опубликованный контракт аутентификации. Она не читает access token и не вызывает
API-клиент напрямую. Пока текущий пользователь определяется, граница показывает явное состояние ожидания; после
результата она отображает маршрут или выполняет перенаправление на границе `app`.

## Структура

```text
src/
├── app/
│   └── router/
│       ├── app-router.tsx
│       ├── route-error-boundary/
│       └── route-pending/
└── compositions/
    ├── routes/
    │   ├── home/
    │   │   ├── lazy.ts
    │   │   └── home.route.tsx
    │   └── account/
    │       ├── lazy.ts
    │       └── account.route.tsx
    └── screens/
        ├── home/
        │   ├── index.ts
        │   └── home.screen.tsx
        └── account/
            ├── index.ts
            └── account.screen.tsx
```

Конфигурация импортирует только динамические фасеты маршрутов:

```tsx
const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        lazy: () => import('compositions/routes/home/lazy'),
      },
      {
        path: 'account',
        lazy: () => import('compositions/routes/account/lazy'),
      },
    ],
  },
])
```

`lazy.ts` является фасетом маршрутного юнита и предоставляет ожидаемый React Router экспорт `Component`:

```ts
export { AccountRoute as Component } from './account.route'
```

Маршрутный адаптер подключает экран через его публичный фасет. Не переноси в такой адаптер разметку или предметное
поведение. Маршрут без экрана допустим для проверки доступа, перенаправления, `Outlet` или области жизни публичного
`Provider`.

Согласованный пример находится в `demo-app`: [`app-router.tsx`](../../../demo-app/src/app/router/app-router.tsx) владеет
деревом URL, [`compositions/routes/`](../../../demo-app/src/compositions/routes/) предоставляет маршрутные адаптеры, а
[`compositions/screens/`](../../../demo-app/src/compositions/screens/) владеет экранными сценариями.

## Проверка

- Роутер создан через `createBrowserRouter` и подключён через `RouterProvider`.
- Дерево URL и глобальные ошибки маршрутов принадлежат `app`.
- Маршрутный адаптер принадлежит `compositions/routes`, экранный сценарий — `compositions/screens`.
- Динамический импорт проходит через `lazy.ts` маршрутного юнита.
- REST GET не выполняется через `loader`, а изменение — через `action`.
- `domains` и `infra` не зависят от React Router.
- Динамическая загрузка не обходит публичные фасеты юнитов.
