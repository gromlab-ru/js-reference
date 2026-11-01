# JS Reference

Скилы для ИИ-агентов с правилами написания кода и разработки приложений. Они закрепляют единые соглашения, помогают
выбирать решения и проверять результат.

Стайлгайды можно использовать в разных проектах. `react-reference` объединяет их с правилами разработки React-приложений.

## Скилы

| Скил | Назначение |
| --- | --- |
| [ts-styleguide](#ts-styleguide) | Написание TypeScript |
| [tsx-styleguide](#tsx-styleguide) | Написание React-компонентов |
| [postcss-styleguide](#postcss-styleguide) | Написание CSS и CSS Modules |
| [html-styleguide](#html-styleguide) | Написание HTML |
| [react-reference](#react-reference) | Разработка клиентских React-приложений |

В зависимостях перечислены другие скилы. Команды установки включают сам скил и все его зависимости.

## ts-styleguide

Правила оформления TypeScript: именование, функции, типы, импорты, комментарии и проверки данных. Включает готовые
функции `value-predicates` для проверки неизвестных и отсутствующих значений.

### Зависимости

Нет.

### Установка

```bash
npx skills add gromlab-ru/js-reference --skill ts-styleguide
```

## tsx-styleguide

Правила написания React-компонентов на TypeScript: свойства, подготовка данных, условное отображение, хуки,
декомпозиция JSX и комментарии.

### Зависимости

- `ts-styleguide` — общие правила TypeScript и проверки значений.

### Установка с зависимостями

```bash
npx skills add gromlab-ru/js-reference --skill tsx-styleguide ts-styleguide
```

## postcss-styleguide

Правила написания CSS и CSS Modules с PostCSS: имена классов, вложенность, модификаторы, переменные и адаптивная вёрстка.
Подходит для разных фреймворков и библиотек компонентов.

### Зависимости

Нет.

### Установка

```bash
npx skills add gromlab-ru/js-reference --skill postcss-styleguide
```

## html-styleguide

Правила HTML-разметки: оформление элементов и атрибутов, семантика и комментарии. Применяется к HTML-файлам
и HTML-частям шаблонов.

### Зависимости

Нет.

### Установка

```bash
npx skills add gromlab-ru/js-reference --skill html-styleguide
```

## react-reference

Референс разработки клиентских React SPA на TypeScript. Описывает структуру приложения, создание страниц и компонентов,
работу с данными, состоянием, формами, маршрутизацией и стилями.

За правилами написания кода обращается к стайлгайдам. Включает запускаемое демонстрационное приложение. Предназначен
для браузерных SPA; Next.js, SSR и серверный код находятся вне его области.

### Зависимости

- `ts-styleguide` — TypeScript.
- `tsx-styleguide` — React-компоненты.
- `postcss-styleguide` — CSS и CSS Modules.
- `html-styleguide` — HTML.
- `unit-architecture` — архитектурные границы и зависимости.
- `template-generation` — создание файлов из шаблонов.
- `rest-api-codegen-ru` — типизированные REST-клиенты.
- `svg-sprites-ru` — SVG-спрайты.

### Установка с зависимостями

```bash
npx skills add gromlab-ru/js-reference --skill react-reference ts-styleguide tsx-styleguide postcss-styleguide html-styleguide
npx skills add gromlab-ru/unit-architecture --skill unit-architecture
npx skills add gromlab-ru/template-file-generator --skill template-generation
npx skills add gromlab-ru/rest-api-codegen --skill rest-api-codegen-ru
npx skills add gromlab-ru/svg-sprites --skill svg-sprites-ru
```
