# Настройка PostCSS

Этот документ описывает общую конфигурацию для React + Vite и Next.js 16+. В обоих окружениях config находится в
корне package приложения рядом с его `package.json`.

## Перед настройкой

Если PostCSS config, variables, tokens или breakpoint-шкала уже существуют, сохраняй их формат, имена, значения и
расположение. Не создавай вторую систему рядом с рабочей и не выполняй массовую миграцию styles.

Для нового окружения подготовь:

```text
postcss.config.mjs
src/shared/styles/
├── index.css
├── variables.css
└── media.css
```

Путь `src/shared/styles` является базовым. Адаптируй его к архитектуре проекта, но сохрани одно центральное место для
global variables и media conditions.

## PostCSS config

Создай `postcss.config.mjs`:

```js
export default {
  plugins: {
    '@csstools/postcss-global-data': {
      files: ['src/shared/styles/media.css']
    },
    'postcss-custom-media': {},
    'postcss-nesting': {},
    autoprefixer: {}
  }
}
```

Plugins выполняются в фиксированном порядке:

1. `@csstools/postcss-global-data` добавляет definitions из `media.css` в контекст каждого CSS-файла.
2. `postcss-custom-media` раскрывает именованные media conditions.
3. `postcss-nesting` преобразует nesting.
4. `autoprefixer` обрабатывает итоговые declarations по Browserslist проекта.

Global data всегда должен выполняться до custom media. Autoprefixer размещай после синтаксических преобразований.

Сохраняй существующий формат config, если проект уже использует CommonJS, array plugins или framework-specific
обёртку. Не подключай object и array формы одновременно.

## Начальные файлы

### `variables.css`

Храни здесь только общие CSS custom properties, доступные всему приложению:

```css
:root {
  --color-text: #212124;
  --color-background: #ffffff;
  --space-4: 1rem;
  --radius-2: 0.5rem;
}
```

Не добавляй полный набор условных tokens заранее. Каждый token должен иметь фактический смысл и consumer. Product
theme и brand semantics размещай у их владельца, если они не являются общими primitives приложения.

### `media.css`

Храни здесь только `@custom-media` definitions:

```css
/* Ширина — Mobile First (min-width), кроме --xs (max-width) */
@custom-media --xs (max-width: 29.9375rem); /* 479px — до sm */
@custom-media --sm (min-width: 30rem); /* 480px — телефон альбом / малый планшет */
@custom-media --md (min-width: 48rem); /* 768px — планшет */
@custom-media --lg (min-width: 64rem); /* 1024px — малый десктоп */
@custom-media --xl (min-width: 75rem); /* 1200px — десктоп */
@custom-media --2xl (min-width: 90rem); /* 1440px — широкий десктоп */
@custom-media --3xl (min-width: 120rem); /* 1920px — full HD+ */

/* Высота — min-height */
@custom-media --h-xs (min-height: 41.6875rem); /* 667px — iPhone SE портрет */
@custom-media --h-sm (min-height: 43.875rem); /* 702px */
@custom-media --h-md (min-height: 50.625rem); /* 810px — iPad портрет */
@custom-media --h-lg (min-height: 56.25rem); /* 900px */
@custom-media --h-xl (min-height: 62.5rem); /* 1000px */
@custom-media --h-2xl (min-height: 68.75rem); /* 1100px */
@custom-media --h-3xl (min-height: 75rem); /* 1200px */
```

Это базовая шкала для нового проекта без готовых breakpoints. Не создавай её автоматически, если layouts и дизайн
требуют другие имена или значения. Существующую шкалу не заменяй.

Не импортируй `media.css` в runtime CSS. Его definitions передаются каждому файлу через
`@csstools/postcss-global-data`.

Media conditions нельзя хранить в CSS custom properties: `var()` не работает в условии `@media`.

```css
/* Не работает как media condition. */
@media (min-width: var(--breakpoint-md)) {
}
```

### `index.css`

Собери global runtime styles:

```css
@import './variables.css';

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  color: var(--color-text);
  background-color: var(--color-background);
}

body {
  margin: 0;
}
```

Добавляй reset, global typography и theme imports только при реальной необходимости. Не подключай CSS Modules через
`index.css`.

## Browserslist

Задай browser targets одним способом:

- в поле `browserslist` файла `package.json`; или
- в `.browserslistrc`; или
- в уже принятом проектом единственном источнике.

Пример поля `package.json`:

```json
{
  "browserslist": [
    "defaults and supports es6-module"
  ]
}
```

Targets должны соответствовать политике поддержки продукта. Не копируй пример без проверки требований и не
задавай отдельные targets только для Autoprefixer.

## Глобальное подключение

### React + Vite

Импортируй global entry ровно один раз из browser entry приложения:

```ts
import './shared/styles/index.css'
```

Адаптируй относительный путь к фактическому расположению entry и styles.

### Next.js 16+

При App Router импортируй global entry ровно один раз из корневого layout:

```tsx
import '../shared/styles/index.css'
```

При другой структуре каталогов адаптируй путь, но сохраняй один глобальный application boundary. Не импортируй
global entry повторно из pages, layouts нижнего уровня или components.

## Проверка конфигурации

1. Запусти production build приложения.
2. Убедись, что `variables.css` входит в итоговый CSS.
3. Убедись, что `media.css` используется как global data и не подключается отдельным runtime import.
4. Проверь преобразование `@media (--md)` и вложенного selector на минимальном CSS-примере.
5. Проверь prefix на declaration, для которого он требуется выбранным browser targets.
6. Убедись, что global CSS импортирован один раз, а CSS Modules продолжают собираться.
7. Запусти formatter и stylelint, если они настроены в проекте.

Наличие config без успешной production-сборки не подтверждает работоспособность pipeline.
