# Доменные контракты

## Публичный API

Домен публикует только собственные:

- inputs и commands;
- models и results;
- events и доступные формы состояния;
- adapters предметных операций;
- React hooks и предметный UI, которыми он владеет;
- operation-specific expected errors.

Публичный adapter называется в предметных терминах: `getCurrentUser`, `signIn`, `updateOrder`. Слова `adapter`, transport и источник данных не входят в имя экспортируемой функции.

Внешний consumer импортирует контракт только через фасет домена:

```ts
import {
  getCurrentUser,
  signIn,
  useGetCurrentUser,
} from '@/domains/authentication'
import type { CurrentUser } from '@/domains/authentication'
```

GET adapter публикуется вместе с GET hook. Hook является стандартным способом получить GET server state для React render, а adapter остаётся доступен для императивного сценария и кода вне React lifecycle. Mutating adapters вызываются как обычные async-функции.

```text
GET для render → public domain hook
imperative GET → public domain adapter
mutation → public domain adapter
```

## Граница источника

Не публикуй через доменный фасет:

- DTO и generated types;
- методы API client или SDK;
- HTTP statuses и transport errors;
- storage records;
- внутренние adapters, mappers и error factories.

Source DTO всегда преобразуется явным mapper в собственную доменную модель, даже если их текущая структура совпадает. Domain input также преобразуется в source request, если операция принимает данные. Только доменные типы попадают в state, cache, hooks, UI и публичный результат.

```text
domain input → request mapper → source request
source DTO → response mapper → domain model
```

Изменение внешнего контракта должно ограничиваться adapter и mapper, пока предметный контракт домена остаётся прежним.
