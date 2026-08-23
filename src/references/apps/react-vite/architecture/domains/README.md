# Домены

Этот раздел закрепляет правила работы с предметными данными поверх Unit Architecture. Владельца, слой, границу юнита и направления зависимостей определяй по skill `unit-architecture`.

## Граница домена

Любой consumer за пределами доменного юнита работает с предметными данными только через публичный фасет домена.

За пределами домена не вызывай напрямую API client, SDK, storage или другой источник его предметных данных. Не выноси наружу source DTO, source errors и преобразование ответов источника.

Технические возможности без предметного владельца, например telemetry, localization или theme, могут использоваться через соответствующие инфраструктурные юниты.

## Поток данных

```text
consumer
→ public domain operation
→ internal adapter
→ API client / SDK / storage
→ source DTO
→ internal mapper
→ domain model
→ state / cache / hook / UI
```

Известный source error преобразуется в ожидаемую доменную ошибку. Неизвестный сбой преобразуется в `ApplicationDefect` и передаётся application boundary.

## Карта раздела

| Область | Референс |
| --- | --- |
| Публичные модели, операции и граница данных | [`contracts.md`](contracts.md) |
| Интеграция с внешними источниками и mapping | [`adapters.md`](adapters.md) |
| Ожидаемые исходы и typed exceptions | [`errors.md`](errors.md) |
| Согласованный Authentication example | [`../../examples/domains/authentication/`](../../examples/domains/authentication/) |
