# React-надстройки над Unit Architecture

React SPA строится по Unit Architecture. Перед проектированием или изменением архитектурной границы загрузи skill `unit-architecture`. Этот раздел не заменяет его документацию и содержит только соглашения выбранного React-стека.

## Карта дополнений

| Ответственность | Документ |
| --- | --- |
| Самостоятельный визуальный UI и внутренние компоненты | [`ui-units.md`](ui-units.md) |
| REST clients, browser storage и другие технические возможности | [`infra-units.md`](infra-units.md) |
| Предметные контракты, adapters и expected errors | [`domains/README.md`](domains/README.md) |

## Принятые решения SPA

- Для обычного browser SPA используй один фасет `index.ts`, если потребителям не нужны разные runtime-возможности.
- Routes и сборка route-level dependencies принадлежат `app`; подробности находятся в [`routing/README.md`](../routing/README.md).
- REST transport, socket manager, browser storage и generated clients принадлежат соответствующим infra-юнитам.
- Предметные DTO преобразуются внутри доменного юнита и не попадают в React consumer.
- React state, Zustand и SWR выбираются по источнику истины и lifecycle, а не по доступности из нескольких компонентов. Правила выбора находятся в [`State management`](../state-management/README.md).
- Build configuration, включая PostCSS, не является runtime-юнитом и не получает искусственный фасет.

## Примеры

Примеры находятся в [`examples/`](../examples/) и состоят только из исходного кода и конфигурации. Они показывают согласованные решения, но не задают обязательное дерево для каждого юнита.

- [`examples/ui/button/`](../examples/ui/button/) — самостоятельный визуальный UI-юнит.
- [`examples/domains/authentication/`](../examples/domains/authentication/) — предметная auth-модель, operations, errors и SWR integration.
- [`examples/infra/identity-api/`](../examples/infra/identity-api/) — ручной REST client и JWT transport policy.
- [`examples/routing/app-router/`](../examples/routing/app-router/) — app-owned Data Router.

Не копируй пример целиком без подтверждённой ответственности, consumers и публичного контракта.
