# HTTP transport

Сначала найди существующий transport или SDK и переиспользуй его. Путь файла, base URL, auth и error policy определяй
по runtime и соглашениям текущего проекта.

Создай один transport для API и храни в нём общие настройки HTTP. Для generated-клиента и его `overrides` импортируй
`HttpClient` из `generated`:

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
`rest-api-codegen-ru`.

В workspace или npm SDK экспортируй `HttpClient`, но не создавай configured singleton с URL и credentials. Каждый
consumer настраивает transport для своего runtime. Организация SDK описана в [`sdk.md`](sdk.md).
