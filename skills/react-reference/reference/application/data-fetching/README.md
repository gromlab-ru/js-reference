# Data fetching в React

Этот раздел является основной инструкцией по получению и изменению удалённых данных в browser-only React SPA. Он не выбирает хранилище client state. REST используется как базовый протокол обмена между приложением и сервером, `@gromlab/rest-api-codegen` предоставляет технический HTTP contract, домен владеет предметным contract, а SWR связывает GET-данные с React lifecycle.

```text
REST API
→ infra API-модуль
→ domain adapter
→ domain hook или публичный adapter
→ React consumer
```

Каждый шаг имеет одного владельца. Не переноси transport policy в домен, mapping в React component или cache lifecycle в API client.

## Порядок работы

1. Определи домен, владеющий запрашиваемыми или изменяемыми предметными данными.
2. Найди существующий infra API-модуль сервиса; не создавай второй transport или client.
3. Зафиксируй domain input, result и ожидаемые errors операции.
4. Создай domain adapter поверх готовой REST operation или метода API client.
5. Опубликуй adapter через фасет домена.
6. Для GET server state, участвующего в React render, создай и опубликуй SWR hook поверх GET adapter.
7. Для imperative GET или mutation вызывай публичный domain adapter.
8. После mutation синхронизируй затронутый GET-cache в явном domain lifecycle owner.

## Выбор API

| Потребность | Публичный API домена | Механизм |
| --- | --- | --- |
| GET-данные участвуют в React render | GET hook | `useSWR` поверх GET adapter |
| Императивный GET, download или export | GET adapter | Обычный async-вызов без SWR cache |
| `POST`, `PUT`, `PATCH`, `DELETE` | Mutation adapter | Обычный async-вызов |
| GET-cache после mutation | Domain action/hook или другой lifecycle owner | Revalidation либо контролируемое cache update |
| Последний realtime snapshot | Subscription hook домена | `useSWRSubscription` поверх готового transport |
| Connection, reconnect и protocol | Фасет infra-юнита | Socket transport или SDK |
| Обязательная обработка каждого события | Контракт владельца события | Queue, reducer или специализированный event store |

Приложение выбирает подходящий публичный API домена по сценарию, но не обходит домен ради прямого вызова предметной REST operation.

## Ответственность разделов

| Вопрос | Источник правил |
| --- | --- |
| Domain types, adapters и публичный фасет | [`architecture/domains/README.md`](../architecture/domains/README.md) |
| Mapping source contract | [`architecture/domains/adapters.md`](../architecture/domains/adapters.md) |
| Domain errors и defects | [`architecture/domains/errors.md`](../architecture/domains/errors.md) |
| REST transport и API-модуль | [`architecture/infra-units.md`](../architecture/infra-units.md) |
| Практический REST lifecycle | [`rest.md`](rest.md) |
| Realtime lifecycle | [`realtime.md`](realtime.md) |
| Создание REST client | [`@gromlab/rest-api-codegen`](../../libraries/rest-api-codegen/README.md) |
| SWR keys, cache и revalidation | [`SWR`](../../libraries/swr/README.md) |

## Границы

- React consumer предметных данных импортирует только публичный фасет домена.
- Domain adapter не публикует DTO, generated types и source errors.
- SWR hook не создаёт `HttpClient`, API client или собственный `fetch`.
- API client не содержит domain mapping и не управляет React cache.
- Mutation adapter не зависит от SWR и может вызываться вне React.
- Server state не копируется в отдельный client store без самостоятельной клиентской семантики. Правила выбора состояния находятся в [`State management`](../state-management/README.md).
- Новый REST client или transport не добавляется параллельно существующему без migration boundary.

## Проверка

- У данных определён домен-владелец.
- REST-вызов проходит через существующий infra API-модуль.
- Domain adapter принимает и возвращает только domain contract.
- GET для render доступен через публичный domain hook.
- Imperative GET и mutation доступны через публичные domain adapters.
- После mutation определена синхронизация связанных GET keys.
- Consumer не знает DTO, source errors, URL, auth и transport policy.
