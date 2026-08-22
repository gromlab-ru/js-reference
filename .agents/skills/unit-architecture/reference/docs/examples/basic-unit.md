# Базовый юнит

## Задача

Приложению нужна универсальная визуальная кнопка с вариантами отображения и состоянием загрузки.

## Решение

```text
ui/
└── button/
    ├── index.ts
    ├── button.tsx
    ├── styles/
    │   └── button.module.css
    └── types/
        └── button.type.ts
```

`ui/button` является юнитом:

- ответственность: универсальное кнопочное взаимодействие;
- слой: `ui`;
- фасет: `index.ts`;
- потребители: разрешённые юниты `app`, `compositions`, `domains`, `infra` и `ui`;
- зависимости: только допустимые `ui` и `shared` API.

```ts
// ui/button/index.ts
export { Button } from './button'
export type { ButtonProps } from './types/button.type'
```

Файлы `button.tsx`, `types/button.type.ts` и `styles/button.module.css` не являются отдельными архитектурными сущностями. Они принадлежат ближайшему владельцу Button.

## Антипример

```text
ui/button/
├── index.ts
├── component/
│   └── index.ts
├── types/
│   └── index.ts
└── styles/
    └── index.ts
```

Внутренние `index.ts` не должны объявляться фасетами и превращать направления реализации в юниты без собственной ответственности.
