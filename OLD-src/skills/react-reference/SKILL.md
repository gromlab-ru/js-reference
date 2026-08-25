---
name: react-reference
description: Использовать при создании и изменении клиентских React SPA, компонентов, routing, состояния, REST, SWR, realtime, PostCSS и SVG-иконок. Не использовать для Next.js, SSR, Server Components и backend-кода.
---

# React Reference

Этот skill описывает технологические и архитектурные ориентиры команды для разработки browser-only React SPA на TypeScript. Он помогает определить владельца изменения, выбрать подход для конкретной области приложения и загрузить только необходимые references.

Правила применяются к новому и необходимому изменяемому коду. Решения из этого skill являются defaults для нового кода, если проект не закрепил другой stack. Не добавляй параллельную библиотеку и не начинай локальную миграцию без явной задачи.

Skill не применяется к Next.js, SSR, React Server Components и backend-коду.

## Как пользоваться skill

Для каждой задачи последовательно определи:

1. **Владельца** — какой архитектурный юнит отвечает за поведение и предоставляет публичный контракт.
2. **Область** — UI, стилизация, иконки, данные и интеграции, routing, формы, platform или quality.
3. **Механизм** — какая технология реализует нужную ответственность и какие профильные references требуется загрузить.

Архитектура определяет владельца. Область задачи определяет подход. Библиотека реализует механизм. Не выбирай библиотеку до определения ответственности и источника истины.

## Карта областей

| Область | Какие вопросы решает |
| --- | --- |
| Архитектура | Owner, unit, слой, публичный фасет, колокация и направления зависимостей |
| React и UI | Components, hooks, lifecycle, композиция интерфейса, Mantine и accessibility |
| Формы | Form state, validation, domain input, submit lifecycle и server errors |
| Стилизация | PostCSS pipeline, global primitives, CSS Modules, tokens и responsive styles |
| Иконки | Library icons, project-owned SVG, sprites, размеры, цвета и accessibility |
| Данные и интеграции | Источник истины, state, REST, transport, domains, SWR и realtime |
| Routing | Routes, navigation, URL state, guards, lazy modules и route boundaries |
| Platform | Vite, assets, environment, browser configuration, даты и локализация |
| Quality | Failure handling, formatting, linting, typecheck, tests и production build |

## Архитектура

React SPA строится по Unit Architecture. Она определяет владельцев поведения, границы юнитов, архитектурные слои, публичные фасеты и допустимые направления зависимостей.

React-файл, component, hook или store сам по себе не создаёт архитектурный юнит. Граница определяется ответственностью кода и его владельцем.

Перед созданием или изменением архитектурной границы загрузи skill `unit-architecture`. React-specific решения находятся в следующих references:

- [`architecture/README.md`](references/architecture/README.md) — профиль React SPA;
- [`architecture/ui-units.md`](references/architecture/ui-units.md) — самостоятельный UI и внутренние components;
- [`architecture/infra-units.md`](references/architecture/infra-units.md) — transports, SDK, browser storage и другие технические возможности;
- [`architecture/domains/README.md`](references/architecture/domains/README.md) — предметные contracts, adapters и errors.

## React и UI

Application code создаётся на TypeScript и TSX. React отвечает за browser rendering, component lifecycle, локальное состояние и композицию интерфейса, но не определяет архитектурного владельца и не заменяет domain или infra boundaries.

В качестве default UI-библиотеки используется Mantine. Сначала используй существующие primitives и компоненты Mantine. Собственный общий UI-компонент создавай, когда готового решения нет или проекту нужен устойчивый составной контракт.

Общий проектный UI принадлежит слою `ui`. Интерфейс конкретного экрана, widget или предметной области остаётся у своего владельца.

Загружай по задаче:

- [`react-ui/README.md`](references/react-ui/README.md) — карта React UI и Mantine;
- [`code-style.md`](references/code-style.md) — общие правила application code;
- [`languages/typescript/README.md`](references/languages/typescript/README.md) — TypeScript;
- [`languages/jsx-tsx.md`](references/languages/jsx-tsx.md) — JSX, components, props и hooks;
- [`architecture/ui-units.md`](references/architecture/ui-units.md) — UI ownership и публичные фасеты.

## Формы

Default form library — `@mantine/form`. Она отвечает за form state, validation lifecycle и состояния полей. Поля строятся на компонентах Mantine.

Сервер остаётся источником истины для бизнес-правил и доступности операций. Преобразование form values в предметный input и отображение известных server errors выполняются на границе владельца операции.

Не добавляй второй form state manager или независимую инфраструктуру валидации без требования проекта.

Источник знаний: [`forms/README.md`](references/forms/README.md).

## Стилизация

CSS pipeline строится на PostCSS. Общие CSS primitives принадлежат `shared`, глобальная точка входа подключается из `app`, а локальные DOM styles изолируются CSS Modules и размещаются рядом с владельцем интерфейса.

Mantine предоставляет базовый визуальный и accessibility contract компонента. CSS Modules отвечают за проектную композицию, layout и состояния поверх этого контракта. Не создавай параллельные хранилища tokens, variables и breakpoints.

Сначала используй [`styling/README.md`](references/styling/README.md) для React integration, затем [`languages/postcss/README.md`](references/languages/postcss/README.md) для настройки pipeline.

## Иконки

Способ использования иконки определяется её владельцем:

| Источник | Решение |
| --- | --- |
| Иконка Mantine или другой принятой библиотеки | Публичный React component библиотеки |
| Обычная project-owned SVG icon | Типизированный sprite через `@gromlab/svg-sprites` |
| Сложная illustration с gradients, masks или filters | Отдельный image asset или проверенный sprite |

Не копируй library icon в project-owned sprite без отдельного решения о смене ownership. Не создавай handwritten wrapper и ручной `<svg><use>` для обычной иконки, которая принадлежит sprite проекта.

Сначала используй:

- [`icons/README.md`](references/icons/README.md) — выбор источника и React integration;
- [`technologies/svg-sprites.md`](references/technologies/svg-sprites.md) — создание, генерация и использование sprite.

Загружай skill `svg-sprites-ru`, если задача выходит за описанный React + Vite сценарий или требует диагностики `@gromlab/svg-sprites`.

## Данные и интеграции

Работу с данными проектируй как последовательность ответственностей:

```text
Источник данных
→ технический transport
→ domain adapter
→ предметный contract
→ lifecycle и cache
→ React consumer
```

Предметные DTO, generated types и transport errors не выходят через публичный фасет домена. React consumer получает предметные models, operations и hooks владельца данных.

Карта области: [`data-integrations/README.md`](references/data-integrations/README.md).

### Выбор состояния

| Смысл состояния | Источник истины | Механизм |
| --- | --- | --- |
| Временное состояние одного component subtree | React owner | `useState` или `useReducer` |
| Разделяемое client-only состояние | Unit owner | Zustand store или scoped store factory |
| REST GET server state для rendering | Server | SWR через domain hook |
| Последний realtime snapshot | Realtime protocol | `useSWRSubscription` через domain hook |
| REST state с realtime updates | Server | SWR GET-cache, синхронизируемый subscription |
| Connection, protocol и reconnect | Infra transport или SDK | Публичный технический фасет |
| Обязательная обработка каждого события | Event source | Queue, reducer или специализированный event store |

Один смысл должен иметь один источник истины. Не копируй SWR data в React state, Context или Zustand без отдельной локальной семантики.

Источник знаний: [`state-management.md`](references/data-integrations/state-management.md).

### REST

`@gromlab/rest-api-codegen` отвечает за REST contract, generated или manual operations, `HttpClient`, auth и API client. Domain adapter преобразует source request, response и известные ошибки в предметный контракт. SWR отвечает за lifecycle и cache GET-данных, участвующих в rendering.

Перед созданием или изменением REST integration с `@gromlab/rest-api-codegen` загрузи skill `rest-api-codegen-ru`.

Загружай по задаче:

- [`rest.md`](references/data-integrations/rest.md) — границы React, domain, SWR и transport;
- [`technologies/rest-api/README.md`](references/technologies/rest-api/README.md) — operations, transport и API client;
- [`technologies/swr/get-data.md`](references/technologies/swr/get-data.md) — GET cache, keys и revalidation;
- [`architecture/domains/README.md`](references/architecture/domains/README.md) — предметный публичный контракт;
- [`architecture/infra-units.md`](references/architecture/infra-units.md) — технический client и transport.

### Realtime

Infra transport или готовый SDK отвечает за connection, protocol, credentials, reconnect и replay. Домен преобразует события в предметные значения. `useSWRSubscription` связывает готовый transport с React lifecycle и при необходимости синхронизирует SWR GET-cache.

Для очередей событий, ordered processing, backpressure и offline queue используй специализированный event mechanism, а не latest-value cache.

Источники знаний:

- [`realtime.md`](references/data-integrations/realtime.md);
- [`technologies/swr/subscriptions.md`](references/technologies/swr/subscriptions.md).

## Routing

Клиентская маршрутизация строится на React Router Data Router. Routes и сборка route-level dependencies принадлежат `app`; крупные screens и widgets получают собственных владельцев.

Router отвечает за route objects, URL state, navigation, lazy route modules, guards и app-owned error boundaries. Он не владеет REST server state, domain contracts или transport.

Источник знаний: [`routing/README.md`](references/routing/README.md).

## Platform

Vite с официальным React plugin является default dev server и production bundler. При работе с существующим приложением используй закреплённую конфигурацию и не добавляй другой bundler без задачи на миграцию.

Build-time configuration поступает через Vite environment variables. Доступ к `import.meta.env` централизуется в техническом владельце, который валидирует значения и предоставляет типизированный контракт. Секреты не помещаются во frontend configuration.

Для parsing, formatting и преобразования дат default-библиотекой является Day.js. Форматы API, locale и timezone задаются явно. Если проект использует локализацию, следуй принятой библиотеке и организации переводов; не добавляй i18n infrastructure без требования.

Источник знаний: [`platform/README.md`](references/platform/README.md).

## Quality

Ошибки разделяются на ожидаемые результаты операции, технические ошибки источника и дефекты приложения. Домен предоставляет предметные ошибки и не раскрывает transport details. Неожиданные ошибки обрабатываются ближайшей подходящей error boundary и передаются в observability.

Источники знаний:

- [`quality/README.md`](references/quality/README.md);
- [`failure-handling.md`](references/failure-handling.md);
- [`architecture/domains/errors.md`](references/architecture/domains/errors.md).

Обязательные проверки изменяемого кода определяются scripts проекта и включают относящиеся к задаче formatting, linting, TypeScript typecheck и production build. Для тестирования используется Vitest. Тесты запускаются, если требуются задачей или уже покрывают изменяемое поведение.

Не отключай правила, не ослабляй типы и не подавляй ошибки вместо исправления причины.

## Карта технологий

| Технология | Для чего используем | Не отвечает за |
| --- | --- | --- |
| React | Rendering, lifecycle и локальная UI composition | Архитектурные границы и server state |
| TypeScript | Статические contracts application code | Runtime validation внешних данных |
| Mantine | UI primitives и accessibility foundation | Предметный UI ownership |
| `@mantine/form` | Form state, validation lifecycle и поля | Серверные бизнес-правила |
| React Router | URL, navigation и route composition | REST cache и transport |
| Zustand | Shared client-only state | Server state и remote cache |
| SWR | GET server state и subscription lifecycle | REST transport и DTO mapping |
| `@gromlab/rest-api-codegen` | REST operations, clients и transport | React lifecycle и domain contracts |
| PostCSS | CSS processing pipeline | Ownership локальных styles |
| CSS Modules | Локальная изоляция styles | Общие tokens и build pipeline |
| `@gromlab/svg-sprites` | Project-owned SVG sprite | Иконки внешней UI-библиотеки |
| Day.js | Parsing, formatting и преобразование дат | Формат transport contract |
| Vite | Dev server, assets и production build | Runtime architecture |
| Vitest | Выполнение tests | Архитектурная стратегия тестирования |

Наличие технологии в карте не требует устанавливать её, если соответствующей задачи нет. Если проект уже закрепил альтернативу, следуй проекту и не создавай параллельный stack.

## Что читать по задаче

| Задача | Минимальный маршрут |
| --- | --- |
| Изменить TypeScript или TSX | [`code-style.md`](references/code-style.md), [`typescript/README.md`](references/languages/typescript/README.md), [`jsx-tsx.md`](references/languages/jsx-tsx.md) |
| Определить owner, слой или фасет | Skill `unit-architecture`, [`architecture/README.md`](references/architecture/README.md) |
| Создать UI unit или внутренний component | [`react-ui/README.md`](references/react-ui/README.md), [`architecture/ui-units.md`](references/architecture/ui-units.md) |
| Создать или изменить форму | [`forms/README.md`](references/forms/README.md) |
| Выбрать React state, Zustand или SWR | [`data-integrations/README.md`](references/data-integrations/README.md), [`state-management.md`](references/data-integrations/state-management.md) |
| Добавить REST GET или mutation | Skill `rest-api-codegen-ru`, [`rest.md`](references/data-integrations/rest.md) |
| Добавить realtime | [`realtime.md`](references/data-integrations/realtime.md), [`swr/subscriptions.md`](references/technologies/swr/subscriptions.md) |
| Изменить route, guard или navigation | [`routing/README.md`](references/routing/README.md) |
| Настроить PostCSS или CSS Modules | [`styling/README.md`](references/styling/README.md), [`postcss/README.md`](references/languages/postcss/README.md) |
| Добавить или изменить icon | [`icons/README.md`](references/icons/README.md), [`svg-sprites.md`](references/technologies/svg-sprites.md) |
| Изменить Vite, environment или date handling | [`platform/README.md`](references/platform/README.md) |
| Изменить expected или unexpected error | [`domains/errors.md`](references/architecture/domains/errors.md), [`failure-handling.md`](references/failure-handling.md) |

Не загружай все references заранее и не пересказывай зависимые skills по памяти. Используй только актуальные источники, относящиеся к задаче.
