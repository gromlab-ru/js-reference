# Доменные контракты

## Публичный API

Домен публикует только собственные:

- inputs и commands;
- models и results;
- events и доступные формы состояния;
- React hooks и предметный UI, которыми он владеет;
- operation-specific expected errors.

Публичные операции называй в предметных терминах: `getCurrentUser`, `signIn`, `updateOrder`. Внутренняя роль файла, transport и источник данных не входят в имя публичной операции.

Внешний consumer импортирует контракт только через фасет домена:

```ts
import { getCurrentUser, useGetCurrentUser } from '@/domains/authentication'
import type { CurrentUser } from '@/domains/authentication'
```

## Граница источника

Не публикуй через доменный фасет:

- DTO и generated types;
- методы API client или SDK;
- HTTP statuses и transport errors;
- storage records;
- внутренние adapters, mappers и error factories.

Source DTO всегда преобразуется явным mapper в собственную доменную модель, даже если их текущая структура совпадает. Только доменная модель попадает в state, cache, hooks, UI и публичный результат.

```text
source DTO → mapper → domain model
```

Изменение внешнего контракта должно ограничиваться adapter и mapper, пока предметный контракт домена остаётся прежним.
