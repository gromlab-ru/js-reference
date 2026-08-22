# Рост через колокацию

## Этап 1. Локальный файл

MainLayout содержит небольшой Header, который не имеет отдельного контракта.

```text
compositions/layouts/main-layout/
├── index.ts
├── main-layout.tsx
├── styles/
│   └── main-layout.module.css
├── types/
│   └── main-layout.type.ts
└── header.tsx
```

`header.tsx` принадлежит MainLayout. Размер файла и отдельный React component не создают юнит.

## Этап 2. Вложенная ответственность

Header начинает владеть собственной раскладкой, состоянием меню и контрактом с MainLayout.

```text
compositions/layouts/main-layout/
├── index.ts
├── main-layout.tsx
├── styles/
│   └── main-layout.module.css
├── types/
│   └── main-layout.type.ts
└── ui/
    └── header/
        ├── index.ts
        ├── header.tsx
        ├── styles/
        │   └── header.module.css
        └── types/
            └── header.type.ts
```

Теперь Header — вложенный юнит:

- MainLayout отвечает за общую раскладку;
- Header отвечает за верхнюю область;
- MainLayout импортирует фасет Header;
- Header не импортирует MainLayout.

## Этап 3. Общие внешние потребители

MainLayout и CatalogLayout нуждаются в прямом API Header. Ответственность поднимается к их ближайшей общей области.

```text
compositions/
├── layouts/
│   ├── main-layout/      # UI-юнит базовой формы
│   └── catalog-layout/   # UI-юнит базовой формы
└── widgets/
    └── header/
        ├── index.ts
        ├── header.tsx
        ├── styles/
        │   └── header.module.css
        └── types/
            └── header.type.ts
```

`layouts` и `widgets` здесь являются группами примеров. Header остаётся юнитом слоя `compositions`.

## Почему не реэкспорт

Если CatalogLayout требуется самостоятельный API Header, доступ через цепочку MainLayout создаёт ложного владельца:

```text
CatalogLayout → MainLayout → Header
```

Подъём выражает реальную общую область:

```text
MainLayout ─┐
            ├→ Header
CatalogLayout ┘
```

## Антипример

Не следует создавать `compositions/widgets/header` на первом этапе только потому, что Header потенциально понадобится в другом layout.
