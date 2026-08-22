# SPA-фасет

## Задача

SPA выполняет весь API Products в одной browser-среде и не имеет несовместимого server runtime.

## Решение

```text
domains/products/
├── index.ts
└── ...
```

Одного фасета достаточно:

```ts
export type { Product } from './types/product.type'
export { getProducts } from './libs/get-products'
export { ProductCard } from './ui/product-card'
```

Фасет непустой и представляет весь логический API Products для разрешённых потребителей.

## Почему нет browser

Имя среды не добавляется без реального разделения публичного API. Дополнительный `browser.ts` в обычной SPA только создаёт вторую точку входа без отдельного ограничения.

## Почему нет пустых фасетов

```text
products/
├── index.ts
├── client.ts
├── browser.ts
└── server.ts
```

Такое симметричное дерево неверно, если `client`, `browser` и `server` пусты или механически повторяют `index`. Фасеты создаются по потребности среды, а не по шаблону.

## Антипример

Не следует экспортировать внутренние helpers через `index` только ради теста. Тест, колоцированный внутри Products, может импортировать внутреннюю реализацию как часть того же юнита.
