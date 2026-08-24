# Данные и интеграции

Этот раздел помогает провести данные от внешнего источника до React consumer, сохранив один источник истины и явного владельца каждого преобразования.

```text
Источник данных
→ технический transport
→ domain adapter
→ предметный contract
→ lifecycle и cache
→ React consumer
```

## Карта раздела

| Задача | Референс |
| --- | --- |
| Выбрать React state, Zustand, SWR или event mechanism | [`state-management.md`](state-management.md) |
| Подключить REST GET или mutation | [`rest.md`](rest.md) |
| Подключить realtime и синхронизировать cache | [`realtime.md`](realtime.md) |
| Определить domain contract и adapter | [`architecture/domains/README.md`](../architecture/domains/README.md) |
| Создать технический transport или API client | [`architecture/infra-units.md`](../architecture/infra-units.md) |

## Главное правило

Один смысл должен иметь один источник истины. Сначала определи, кому принадлежат данные и кто управляет их lifecycle, затем выбирай state mechanism.

Предметные DTO, generated types, raw events и transport errors не выходят через публичный фасет домена. React consumer получает предметные models, operations и hooks владельца данных.

## Выбор маршрута

- Для local UI state используй React state или reducer.
- Для shared client-only state используй Zustand.
- Для REST GET server state, участвующего в rendering, используй SWR через domain hook.
- Для latest realtime snapshot используй `useSWRSubscription` через domain hook.
- Для connection, protocol и reconnect используй публичный фасет infra transport или готового SDK.
- Для ordered events, replay и обязательной обработки каждого сообщения используй специализированный event mechanism.

Не копируй server state в React state, Context или Zustand без отдельной локальной семантики.
