# Маршрутизация в React SPA

Используй React Router Data Router через `createBrowserRouter` и `RouterProvider`. Правила фасетов и границу
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
- выбором статического либо динамического подключения публичных фасетов маршрутов;
- общим состоянием ожидания начальной загрузки динамической ветки.

Группа `compositions/routes` содержит адаптеры React Router. Они связывают дерево URL с экранами, а при необходимости
проверяют доступ, перенаправляют или подключают `Outlet`. Группа `compositions/screens` содержит завершённые экранные
сценарии и владеет их разметкой и действиями.

## Почему Data Router

Объекты маршрутов дают единое дерево URL, каркасы, динамическую загрузку и обработчики ошибок. Роутер отвечает за
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
    │   │   ├── index.ts
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

Подключай небольшой начальный или служебный маршрут статически через `index.ts`. Используй `lazy.ts`, только когда
отдельный маршрут или ветка подключает сценарий и зависимости, которые не нужны при каждом запуске. Подтверди решение
сравнением размера и времени выполнения начального JavaScript до и после разделения либо данными о редком открытии
маршрута. Само наличие файла маршрута не является причиной для отдельного чанка.

Корневой маршрут задаёт `hydrateFallbackElement: <RoutePending />`. React Router показывает этот элемент при начальной
загрузке динамической ветки и не сообщает об отсутствующем `HydrateFallback`. `RoutePending` принадлежит `app/router`,
потому что это общее состояние загрузки дерева URL.

Конфигурация может сочетать оба способа:

```tsx
import { createBrowserRouter } from 'react-router-dom'
import { HomeRoute } from 'compositions/routes/home'
import { RouteErrorBoundary } from './route-error-boundary/route-error-boundary'
import { RoutePending } from './route-pending/route-pending'

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteErrorBoundary />,
    hydrateFallbackElement: <RoutePending />,
    children: [
      {
        index: true,
        Component: HomeRoute
      },
      {
        path: 'sign-in',
        lazy: () => import('compositions/routes/sign-in/lazy')
      }
    ]
  }
])
```

Статический маршрут импортирует компонент через обычный фасет:

```tsx
import { HomeRoute } from 'compositions/routes/home'
```

`lazy.ts` предоставляет ожидаемый React Router экспорт `Component`:

```ts
export { AccountRoute as Component } from './account.route'
```

Маршрутный адаптер подключает экран через его публичный фасет. Не переноси в такой адаптер разметку или предметное
поведение. Маршрут без экрана допустим для проверки доступа, перенаправления, `Outlet` или области жизни публичного
`Provider`.

Согласованный пример находится в `demo-app`: [`app-router.tsx`](../../../demo-app/src/app/router/app-router.tsx) владеет
деревом URL, [`compositions/routes/`](../../../demo-app/src/compositions/routes/) предоставляет маршрутные адаптеры, а
[`compositions/screens/`](../../../demo-app/src/compositions/screens/) владеет экранными сценариями.
[`RoutePending`](../../../demo-app/src/app/router/route-pending/route-pending.tsx) является общим состоянием ожидания, а
[`RequireAuthenticationRoute`](../../../demo-app/src/compositions/routes/require-authentication/require-authentication.route.tsx)
показывает адаптер без собственного экрана.

## Проверка

- Роутер создан через `createBrowserRouter` и подключён через `RouterProvider`.
- Дерево URL и глобальные ошибки маршрутов принадлежат `app`.
- Маршрутный адаптер принадлежит `compositions/routes`, экранный сценарий — `compositions/screens`.
- Статический импорт проходит через `index.ts`, динамический — через `lazy.ts` маршрутного юнита.
- Корневой маршрут задаёт `hydrateFallbackElement` с общим `RoutePending`.
- REST GET не выполняется через `loader`, а изменение — через `action`.
- `domains` и `infra` не зависят от React Router.
- Динамическая загрузка не обходит публичные фасеты юнитов.
- Отдельный чанк создаётся только для подтверждённой границы загрузки.
