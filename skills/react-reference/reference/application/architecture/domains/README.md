# Домены

Этот раздел закрепляет правила работы с предметными данными поверх Unit Architecture. Владельца, слой, границу юнита и направления зависимостей определяй по skill `unit-architecture`.

## Граница домена

Любой consumer за пределами доменного юнита работает с предметными данными только через публичный фасет домена.

Домен публикует необходимые adapters предметных операций. Adapter принимает domain input, обращается к внешнему источнику и возвращает domain result либо предусмотренную domain error. Для GET-данных, участвующих в React render, домен дополнительно публикует hook владельца данных.

За пределами домена не вызывай напрямую API client, REST operation, SDK, storage или другой источник его предметных данных. Не выноси наружу source DTO, source errors и преобразование ответов источника.

Технические возможности без предметного владельца, например telemetry, localization или theme, могут использоваться через соответствующие инфраструктурные юниты.

## Поток данных

```text
consumer
→ public domain hook или adapter
→ domain adapter
→ API client / SDK / storage
→ source DTO
→ internal mapper
→ domain model
→ cache / state / UI
```

Публичный adapter сам является доменной operation: не добавляй поверх него wrapper, который только повторяет вызов. Hook может использовать adapter внутри домена и добавляет lifecycle/cache, но не заменяет контракт операции.

Известный source error преобразуется в ожидаемую доменную ошибку. Неизвестный сбой преобразуется в `ApplicationDefect` и передаётся application boundary.

## Карта раздела

| Область | Референс |
| --- | --- |
| Публичные модели, операции и граница данных | [`contracts.md`](contracts.md) |
| Интеграция с внешними источниками и mapping | [`adapters.md`](adapters.md) |
| Ожидаемые исходы и typed exceptions | [`errors.md`](errors.md) |
| Согласованный Authentication example | [`../../examples/domains/authentication/`](../../examples/domains/authentication/) |
