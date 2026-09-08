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

Новые `.tsx` маршрутов, экранов и компонентов проверки доступа создавай через `npx @gromlab/create` по
[`правилам создания TSX`](../ui/tsx-generation.md). `RoutePending` и `RouteErrorBoundary` тоже генерируются, в том числе
в `app/router`. Конфигурация роутера с JSX попадает в исключение только при связывании готовых публичных API без
собственной реализации интерфейса, предметного или технического поведения. Весь `app` из правила не исключается.

Маршрутные юниты и экраны создавай через `ui-unit`, а внутренние `RoutePending` и `RouteErrorBoundary` через
`ui-component`. На схеме показан полный каркас с файлами стилей и типов. Имена уже приведены к ролям `.route.tsx` и
`.screen.tsx`, а фасет динамического маршрута заменён на `lazy.ts` по
[`правилам адаптации`](../ui/tsx-generation.md#адаптация-каркаса).

```text
src/
├── app/
│   └── router/
│       ├── app-router.tsx
│       ├── route-error-boundary/
│       │   ├── route-error-boundary.tsx
│       │   ├── styles/
│       │   │   └── route-error-boundary.module.css
│       │   └── types/
│       │       └── route-error-boundary-props.type.ts
│       └── route-pending/
│           ├── route-pending.tsx
│           ├── styles/
│           │   └── route-pending.module.css
│           └── types/
│               └── route-pending-props.type.ts
└── compositions/
    ├── routes/
    │   ├── home/
    │   │   ├── index.ts
    │   │   ├── home.route.tsx
    │   │   ├── styles/
    │   │   │   └── home.module.css
    │   │   └── types/
    │   │       └── home-route-props.type.ts
    │   └── account/
    │       ├── lazy.ts
    │       ├── account.route.tsx
    │       ├── styles/
    │       │   └── account.module.css
    │       └── types/
    │           └── account-route-props.type.ts
    └── screens/
        ├── home/
        │   ├── index.ts
        │   ├── home.screen.tsx
        │   ├── styles/
        │   │   └── home.module.css
        │   └── types/
        │       └── home-screen-props.type.ts
        └── account/
            ├── index.ts
            ├── account.screen.tsx
            ├── styles/
            │   └── account.module.css
            └── types/
                └── account-screen-props.type.ts
```

Это каркас до удаления ненужных частей, а не обязательный итоговый набор файлов каждого маршрута. У тонкого адаптера,
который только возвращает готовый экран, после генерации удали неиспользуемые CSS Module и тип свойств. Не добавляй
ему DOM или искусственные свойства ради сохранения файлов. Если стили и свойства нужны, оставь их в показанных
`styles/` и `types/` по [`общей структуре компонентов`](../ui/README.md#базовая-структура).

Начальный шаблон использует имя сущности без ролевого суффикса: например, `home.tsx` и `types/home-props.type.ts`.
При адаптации к `HomeRoute` или `HomeScreen` согласованно переименуй реализацию, тип свойств и их импорты и экспорты.
У внутренних компонентов `app/router` фасет не появляется; `app-router.tsx` остаётся связующей конфигурацией без
компонентного каркаса.

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
- Новые компоненты созданы из общего шаблона; нужные стили и типы остались в `styles/` и `types/`, а ненужные части
  каркаса удалены без добавления фиктивных свойств или DOM.
- Статический импорт проходит через `index.ts`, динамический — через `lazy.ts` маршрутного юнита.
- Корневой маршрут задаёт `hydrateFallbackElement` с общим `RoutePending`.
- REST GET не выполняется через `loader`, а изменение — через `action`.
- `domains` и `infra` не зависят от React Router.
- Динамическая загрузка не обходит публичные фасеты юнитов.
- Отдельный чанк создаётся только для подтверждённой границы загрузки.
