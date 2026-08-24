# HTTP transport

Сначала найди существующий transport или SDK и переиспользуй его. Путь файла, base URL, auth и error policy определяй
по runtime и соглашениям текущего проекта.

`HttpClient` выполняет generated и manual operations. Создай один transport для API и храни в нём общие настройки
HTTP:

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

Для generated operations импортируй `HttpClient` из generated client. Для полностью ручного client без OpenAPI
импортируй его из `@gromlab/rest-api-codegen`. Operations и transport должны использовать совместимые контракты.

Patched operations используют тот же transport. Не создавай отдельный `HttpClient` только из-за того, что часть
operations написана вручную или исправляет OpenAPI.

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
