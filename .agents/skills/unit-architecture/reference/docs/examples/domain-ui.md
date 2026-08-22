# Доменный UI

## Задача

Products владеет предметной моделью товара, загрузкой каталога и карточкой товара. CatalogScreen размещает готовую карточку в продуктовом экране.

## Дерево

```text
domains/products/
├── index.ts
├── providers/
│   └── products-provider.tsx
├── hooks/
│   └── use-products.ts
├── types/
│   └── product.type.ts
├── libs/
│   └── get-products.ts
├── stores/
│   └── products.store.ts
├── utils/
│   └── normalize-product-name.ts
└── ui/
    └── product-card/
        ├── index.ts
        ├── product-card.tsx
        ├── styles/
        │   └── product-card.module.css
        └── types/
            └── product-card.type.ts
```

Products показывает реалистичную расширенную форму юнита: Provider подключает продуктовое состояние, hook предоставляет доступ к нему, store хранит состояние каталога, а внутренние функции обслуживают предметную операцию. Названия и назначение этих сегментов выбраны только для примера и не являются требованиями архитектуры.

ProductCard является вложенным юнитом, потому что владеет отдельной предметной проекцией и имеет фасет. Его внутренняя структура остаётся минимальной, поскольку дополнительные механизмы ему не нужны.

## Граница ребёнка

ProductCard не импортирует `types/product.type.ts` родителя. Он определяет минимальный входной контракт своей проекции:

```ts
// types/product-card.type.ts
export type ProductCardModel = {
  title: string
  priceLabel: string
  available: boolean
}
```

Фасет Products включает возможность ребёнка в собственный API. CatalogScreen сопоставляет Product с минимальным входным контрактом проекции:

```ts
// domains/products/index.ts
export type { Product } from './types/product.type'
export { getProducts } from './libs/get-products'
export { ProductsProvider } from './providers/products-provider'
export { useProducts } from './hooks/use-products'
export { ProductCard } from './ui/product-card'
```

CatalogScreen использует только фасет Products:

```tsx
import { getProducts, ProductCard } from '@/domains/products'

const productCardModel = {
  title: product.name,
  priceLabel: formatProductPrice(product),
  available: product.availability === 'available',
}

return <ProductCard model={productCardModel} />
```

## Граф

```text
CatalogScreen → Products → ProductCard
                      └→ Backend API
ProductCard → UI primitives
```

## Почему не ui

ProductCard выражает предметный смысл Product и меняется вместе с продуктовым контрактом. Props-based API и повторное использование не делают её универсальным юнитом слоя `ui`.

## Антипример

```ts
import { ProductCard } from '@/domains/products/ui/product-card'
```

Это глубокий импорт вложенного юнита. Внешний потребитель должен использовать фасет Products либо обосновать подъём ProductCard.
