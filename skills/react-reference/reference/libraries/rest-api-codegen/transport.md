# HTTP transport

Сначала найди существующий transport или SDK и переиспользуй его. Путь файла, base URL, auth и error policy определяй
по runtime и соглашениям текущего проекта.

Создай один transport для API и храни в нём общие настройки HTTP. Если приложение использует один полный API-клиент и
одну политику транспорта, создавай `HttpClient` и результат `createApiClient` в одном файле `<name>-api.ts`. Выноси
transport в отдельный файл, только если его разделяют несколько клиентов или для одного API нужны разные политики сред
выполнения.

Для generated-клиента и его `overrides` импортируй `HttpClient` из `generated`:

```ts
import { HttpClient } from './generated'

export const httpClient = new HttpClient({
  baseUrl: 'https://api.example.com',
  timeout: 10_000,
  headers: {
    Accept: 'application/json'
  }
})
```

Для полностью ручного клиента в `extensions` импортируй `HttpClient` из `@gromlab/rest-api-codegen`. Operations и
transport должны использовать совместимые контракты. Все operations одного API используют один transport.

## Возможности

Конфигурация `HttpClient` задаёт общую policy запросов:

- `baseUrl`, headers, credentials и timeout;
- `onRequest` для auth и изменения запроса перед отправкой;
- `onResponse` для обработки успешного ответа;
- `onError` для нормализации ошибок, fallback или ограниченного retry;
- `customFetch`, query serializer и response parser, если стандартного поведения недостаточно.

Hooks получают request или response context и могут вернуть изменённое значение. Например, актуальный token можно
добавлять перед каждым защищённым запросом:

```ts
const httpClient = new HttpClient({
  baseUrl: 'https://api.example.com',
  onRequest(request) {
    const headers = new Headers(request.headers)
    headers.set('Authorization', `Bearer ${getAccessToken()}`)

    return {
      ...request,
      headers
    }
  }
})
```

Конкретная auth, error и retry policy зависит от API и runtime. Её точную реализацию бери из skill
`rest-api-codegen-ru`. Если skill недоступен, используй документацию
[`gromlab-ru/rest-api-codegen`](https://github.com/gromlab-ru/rest-api-codegen).

## Защищённый 401

Обрабатывай потерю авторизации в `onError` только для `401` от операции с `secure: true`. В браузерной SPA
HTTP-транспорт должен:

1. синхронно сообщить статус `unauthenticated` через действие ограниченного `infra/app-store`;
2. удалить сохранённый access token;
3. повторно выбросить исходную ошибку, чтобы операция сохранила свой контракт ошибки.

Статус нужен, чтобы `AuthGuard` немедленно закрыл защищённую разметку. HTTP-транспорт не импортирует SWR, не вызывает
`mutate` и не знает ключи сессии или приватных данных. Очистку доменной сессии и приватного SWR-кеша выполняет владелец
жизненного цикла авторизации, подписанный на статус приложения.

Точная реализация одного полного клиента находится в
[`demo-app/src/infra/backend-api/backend-api.ts`](../../../demo-app/src/infra/backend-api/backend-api.ts). В этом файле
рядом находятся настроенный `HttpClient`, обработка защищённого `401` и `createApiClient`.

В workspace или npm SDK экспортируй `HttpClient`, но не создавай configured singleton с URL и credentials. Каждый
consumer настраивает transport для своего runtime. Организация SDK описана в [`sdk.md`](sdk.md).
