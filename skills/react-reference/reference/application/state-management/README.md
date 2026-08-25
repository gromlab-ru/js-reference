# State management в React

Этот раздел помогает выбрать источник истины, владельца lifecycle и React-механизм доступа к состоянию. Он является самостоятельной application-областью и не определяет способ выполнения REST-запросов. Архитектурного владельца и публичный фасет определяй по [`architecture/README.md`](../architecture/README.md).

## Главное правило

Не используй термин «глобальное состояние» как основание для выбора библиотеки. Сначала определи:

1. Что состояние означает для продукта или UI.
2. Какой юнит владеет этой ответственностью.
3. Где находится источник истины: React subtree, shared client-only store, REST API или realtime transport.
4. Каким consumers нужны данные и как долго они должны жить.
5. Кто создаёт, изменяет, сбрасывает и уничтожает состояние.

Один смысл должен иметь один источник истины. Не синхронизируй вручную несколько writable stores с одинаковыми данными.

## Выбор механизма

| Состояние | Механизм | Что получаем |
| --- | --- | --- |
| Значение принадлежит одному component subtree | React state или reducer | Состояние колоцировано с lifecycle consumer и не требует внешнего store |
| Несколько частей SPA используют общий client-only state | Zustand | Единые actions, точечные subscriptions и явная область жизни без копирования state по React tree |
| Данные получены через domain GET adapter и отражают состояние API | Public domain SWR hook | Cache, request state, deduplication и revalidation в одном lifecycle server state |
| Нужен последний transient realtime snapshot | `useSWRSubscription` | Subscription разделяется по key и очищается после последнего consumer |
| Realtime обновляет восстановимое REST-состояние | SWR GET-cache и subscription sync | GET остаётся bootstrap, а одна клиентская проекция восстанавливается после reconnect |
| Важна обработка каждого события | Queue, reducer или специализированный event store | Сохраняется event semantics, которую latest-value cache обеспечить не может |

Если источником истины является REST API или realtime protocol, способ получения и изменения данных определён в [`data fetching`](../data-fetching/README.md). Технические правила cache применяй по [`libraries/swr/get-data.md`](../../libraries/swr/get-data.md) и [`libraries/swr/subscriptions.md`](../../libraries/swr/subscriptions.md).

## React state

Используй `useState` или `useReducer`, когда состояние принадлежит одному component subtree и живёт вместе с ним: открытие dropdown, неподтверждённое значение формы, локальный выбор вкладки или временное состояние взаимодействия.

Поднимай state к ближайшему общему React owner, пока он остаётся частью той же ответственности. Большое число props само по себе не является основанием для Zustand: сначала проверь границу компонента и контракт юнита.

Не копируй props или SWR data в local state без отдельной локальной семантики. Для draft явно определи инициализацию, сохранение, конфликт и сброс относительно server value.

## Zustand

Zustand является preferred state manager для разделяемого client-only state, если React state больше не соответствует области потребления или lifecycle, а данные не являются server state.

Zustand выбран, потому что предоставляет:

- небольшой typed store без обязательной иерархии Providers;
- подписку компонента только на выбранный slice;
- actions рядом с изменяемым состоянием;
- доступ из React и вне component tree через контракт владельца;
- отдельные stores и factories для разных областей жизни вместо одного универсального store.

Store принадлежит unit owner соответствующей ответственности. Доступность import из нескольких мест не делает его общим и не отменяет публичный фасет юнита.

### Контракт store

- Храни state и изменяющие его actions в одном typed контракте владельца.
- Изменяй state через actions, а не произвольные внешние вызовы `setState`.
- Выбирай в component минимальный slice вместо подписки на весь store.
- Выноси именованный selector, когда он переиспользуется или выражает правило чтения.
- Экспортируй наружу только необходимый контракт через публичный фасет unit owner.
- Не добавляй middleware, slices, persistence или devtools без соответствующей задачи.

### Область жизни

Store Zustand, созданный на уровне файла, является singleton текущего JavaScript runtime. Используй его только когда состояние должно переживать unmount отдельных consumers.

Для независимых экземпляров одного state в нескольких subtree, tabs или widgets создай store factory и явную Provider boundary. Создание, reset и уничтожение выполняет unit owner lifecycle, а не каждый component consumer.

### Persistence

Persistence изменяет lifecycle и контракт данных. До её подключения определи persisted schema, versioning, migration, hydration, очистку при logout или смене tenant и поведение при повреждённом значении. Не сохраняй credentials, secrets и чувствительные данные.

Server state не становится client-only state из-за требования переживать reload. Для REST-данных используй повторный GET и профильный cache mechanism.

## Граница Zustand и SWR

Public domain SWR hook хранит клиентскую проекцию server state. Zustand не должен зеркалировать её.

Не копируй в Zustand response GET-operation, SWR request state, канонический entity list, последнее subscription value или connection state готового transport SDK. Zustand может хранить client-only интерпретацию рядом с server state: выбранный ID, режим отображения, несохранённый draft или локальный порядок.

Предметные модели, hooks и state доступны внешним consumers только через публичный фасет домена по [`architecture/domains/README.md`](../architecture/domains/README.md).

## Context и Provider

Context используй для стабильной dependency или scoped contract в React tree, а не как универсальный mutable store. Provider оправдан, когда создаёт scope, экземпляр store, dependency или lifecycle resource. Не создавай Provider только ради сокрытия обычного import через публичный фасет.

## Existing state manager

- Не добавляй Zustand параллельно Redux, MobX или другому принятому state manager в рамках локальной задачи.
- Для миграции выбери границу одного unit owner и перенеси связный state-сценарий вместе с actions и consumers.
- Не оставляй две writable копии одного state на неопределённый срок.
- Если существующая библиотека решает задачу и закреплена проектом, следуй проекту.

## Проверка

- Для состояния определены смысл, unit owner, источник истины и область жизни.
- Local state не вынесен во внешний store без необходимости.
- Zustand содержит shared client-only state и не зеркалирует SWR.
- SWR используется для server state.
- Actions, reset и resource lifecycle принадлежат unit owner.
- Внешний доступ проходит через публичный фасет владельца.
- Persistence имеет schema, migration и правила очистки либо не используется.
