# Layout, widget и вложенные проекции

## Задача

MainLayout размещает верхнюю область. Самостоятельный Header widget координирует вложенные Navigation и Search и может использоваться несколькими layouts или screens.

## Дерево

```text
compositions/
├── layouts/
│   └── main-layout/
│       ├── index.ts
│       ├── main-layout.tsx
│       ├── styles/
│       │   └── main-layout.module.css
│       └── types/
│           └── main-layout.type.ts
└── widgets/
    └── header/
        ├── index.ts
        ├── header.tsx
        ├── styles/
        │   └── header.module.css
        ├── types/
        │   └── header.type.ts
        └── ui/
            ├── navigation/
            │   ├── index.ts
            │   ├── navigation.tsx
            │   ├── styles/
            │   │   └── navigation.module.css
            │   └── types/
            │       └── navigation.type.ts
            └── search/
                ├── index.ts
                ├── search.tsx
                ├── styles/
                │   └── search.module.css
                └── types/
                    └── search.type.ts
```

## Владение

| Юнит | Ответственность | Непосредственный потребитель |
|---|---|---|
| MainLayout | Общая раскладка приложения | Route-level код `app` |
| Header | Повторно используемая верхняя область | MainLayout и другие layouts или screens |
| Navigation | Навигационная проекция | Header |
| Search | Поисковая проекция | Header |

`layouts` и `widgets` являются группами примеров. `ui` внутри Header — выбранный проектом сегмент; сам сегмент не является слоем `ui` и не создаёт владельца.

## Граф

```text
App route → MainLayout → Header → Navigation
                              └→ Search
```

MainLayout не импортирует Navigation и Search напрямую: их координацией владеет Header. Navigation и Search не импортируют друг друга или Header.

Header передаёт детям входные данные и callbacks через их собственные контракты.

## Публичность

Фасеты MainLayout и Header доступны разрешённым потребителям слоя `compositions`. Фасеты вложенных Navigation и Search доступны только Header.

Если MainLayout открывает настройку Header, он выражает её собственным контрактом:

```ts
export type MainLayoutProps = {
  header?: {
    searchEnabled: boolean
  }
}
```

Внешний потребитель не импортирует внутренний тип Search через глубокий путь.

## Антипример

```text
Search → Header
Header → Search
```

Обратный импорт ребёнка создаёт цикл. Search должен объявить входной контракт, который Header заполняет при композиции.
