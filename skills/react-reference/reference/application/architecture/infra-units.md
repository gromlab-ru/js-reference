# Infra-юниты в React SPA

Infra-юнит предоставляет техническую возможность без продуктового смысла: REST client, socket transport, telemetry, browser storage или generated sprite API. Критерии юнита, слой и зависимости определяет skill `unit-architecture`.

## REST transport

REST infra owner хранит:

- generated или manual operations wire-контракта;
- единый `HttpClient` с base URL, auth headers и общей transport policy;
- `createApiClient` с необходимым деревом операций;
- source DTO и технические source errors;
- минимальный публичный фасет для доменных adapters или технических consumers.

Generated output полностью принадлежит генератору. Manual operations повторяют контракт generated operations и размещаются вне generated-каталога. Правила библиотеки находятся в [`@gromlab/rest-api-codegen`](../../libraries/rest-api-codegen/README.md).

Infra client не импортирует доменную модель и не преобразует source errors в expected domain errors. Иначе образуется обратная зависимость `infra → domain`, а доменный adapter перестаёт владеть предметной границей.

## Browser storage

Storage публикует технические операции чтения, записи и очистки. Он не публикует credentials через React state и не знает о предметном сценарии входа или выхода.

Для JWT в `localStorage`:

- token рассматривается как opaque string;
- token читается перед каждым защищённым запросом;
- token не попадает в URL, cache key, telemetry и diagnostics;
- повреждённое или отклонённое API значение удаляется;
- `401` очищает token и не запускает автоматический retry;
- приложение обязано учитывать, что любой выполняемый на странице JavaScript имеет доступ к token, поэтому защита от XSS критична.

## REST-фасет

API-модуль может опубликовать два способа обращения к одному transport:

```ts
export { petStoreApi } from './pet-store-api'
export { petStoreHttpClient } from './transport'
export { getPet, updatePet } from './operations'
```

- Метод собранного API client удобен, когда consumer использует связную группу операций.
- Отдельная operation вместе с configured `HttpClient` позволяет не включать всё дерево client в отдельный lazy chunk.

Оба варианта являются одной infra-возможностью и используют одинаковые URL, auth, headers и error policy. Consumer не создаёт новый transport и не передаёт произвольный `HttpClient` из другого API-модуля.

## Фасет

В browser SPA обычно достаточно одного `index.ts`. Экспортируй только возможности, действительно нужные другим юнитам. Configured `HttpClient` публикуй, когда consumers используют standalone operations; иначе достаточно собранного API client.

Согласованный пример находится в [`examples/infra/identity-api/`](../examples/infra/identity-api/). Его доменный consumer находится в [`examples/domains/authentication/`](../examples/domains/authentication/); направление зависимости только `authentication → identity-api`.

## Проверка

- Infra contract не содержит предметных моделей и expected domain errors.
- Auth, headers и error policy не дублируются в React hooks.
- Generated code отделён от ручного и не редактируется.
- Browser-only API не протекает в универсальный или server module graph.
- Межюнитный import проходит через публичный фасет и не создаёт цикл.
