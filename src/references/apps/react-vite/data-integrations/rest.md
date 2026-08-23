# REST в React

Для REST в React SPA используй вместе две технологии:

- [`REST API`](../../../technologies/rest-api/README.md) предоставляет типизированные operations, общий `HttpClient` и API client;
- [`SWR GET`](../../../technologies/swr/get-data.md) связывает GET-operation с React lifecycle, cache identity, request state и revalidation.

React-компонент не настраивает transport и не выполняет самостоятельный `fetch`. Разделение transport и React lifecycle позволяет переиспользовать один API client, не дублировать URL, auth, headers и error policy в hooks и получать единое поведение cache.

## Архитектурный поток

Любые предметные данные доступны за пределами доменного юнита только через его публичный фасет. Применяй [`architecture/domains/README.md`](../architecture/domains/README.md), [`architecture/domains/contracts.md`](../architecture/domains/contracts.md) и [`architecture/domains/adapters.md`](../architecture/domains/adapters.md).

```text
React consumer
→ публичный фасет домена
→ domain hook or operation
→ internal domain adapter
→ typed API client
→ HttpClient
```

Внутренний domain adapter преобразует source request, response и known errors в предметный контракт. DTO, generated types, API client и transport errors не выходят через публичный фасет домена.

Техническая настройка `HttpClient` и API client принадлежит infra unit owner. React lifecycle чтения находится в специализированном hook владельца данных. Такое разделение сохраняет технический transport переиспользуемым, а предметные правила и модели независимыми от wire contract.

## GET для render

Предметный GET для render вызывай через специализированный domain hook, экспортированный публичным фасетом домена:

```ts
import { usePet } from '@/domains/pets'

const { pet, error, isLoading } = usePet(petId)
```

Hook использует SWR и вызывает предметную operation владельца, но внешний consumer не знает API client, URL, DTO и SWR key implementation. Семантику keys, cache и revalidation определяет [`technologies/swr/get-data.md`](../../../technologies/swr/get-data.md).

GET для download, export или другого императивного результата не помещай в общий remote cache, если результат не является server state для render. Такой сценарий всё равно запускается через предметную operation публичного фасета домена.

## Изменяющие запросы

Mutation предметных данных вызывай через action или operation публичного фасета домена:

```ts
import { updatePet } from '@/domains/pets'

await updatePet({
  id: '42',
  name: 'Charlie',
})
```

Фактические имена и аргументы определяет предметный контракт. Внутренний adapter вызывает API client и преобразует source response и errors. После успешной mutation синхронизируй связанные SWR GET keys через update, optimistic update или revalidation по [`technologies/swr/get-data.md`](../../../technologies/swr/get-data.md#revalidation-после-mutation).

## Технические REST-вызовы

Если REST-вызов не содержит предметных данных и реализует техническую возможность, его owner определяется по Unit Architecture. Consumer использует публичный фасет соответствующего infra-юнита, а не создаёт локальный `fetch` wrapper.

## Границы

- Не вызывай API client напрямую за пределами доменного юнита для чтения или изменения предметных данных.
- Не выполняй GET server state для render напрямую из component, event handler или `useEffect`.
- Не публикуй DTO, generated operations и transport errors через фасет домена.
- Не помещай base URL, auth, headers, retry и error policy в React hooks.
- Не копируй SWR data в React state, Context или Zustand без отдельной локальной семантики.
- Не оформляй mutations как обычный `useSWR` GET-hook.
- Не добавляй SWR параллельно существующей data-fetching library без явной migration boundary.

## Проверка

- Предметные данные проходят только через публичный фасет домена.
- GET server state для render получен через специализированный SWR hook владельца.
- Императивный GET не помещён в cache без необходимости.
- Mutation выполнена через предметную operation и синхронизировала связанные GET keys.
- Domain adapter преобразует DTO и known source errors во внутренний предметный контракт.
- Hook не содержит transport policy и самостоятельный `fetch`.
- Remote state не скопирован в другой client store.
