# JS Reference

Репозиторий содержит skills с правилами написания TypeScript, TSX, HTML и CSS и референс разработки React-приложений.
Skill помогает агенту выбрать принятое решение, выполнить изменение и проверить результат.

## Skills репозитория

### Каноны написания кода

| Skill | Ответственность |
| --- | --- |
| `ts-styleguide` | TypeScript: оформление, именование, функции, типы, импорты, JSDoc и проверки значений. Включает `value-predicates`. |
| `tsx-styleguide` | React-компоненты в TSX: свойства, JSX, условное отображение, хуки, декомпозиция и JSDoc компонентов. |
| `postcss-styleguide` | CSS и CSS Modules с PostCSS: классы, вложенность, модификаторы, переменные и адаптивность. |
| `html-styleguide` | HTML: оформление, элементы, атрибуты, семантика и комментарии. |

Эти skills применяются в разных проектах без установки `react-reference`. `tsx-styleguide` использует `ts-styleguide`;
остальные скилы канонов независимы друг от друга. Языковые правила охватывают TypeScript и TSX; чистый JavaScript
в них не описывается.

Установи нужный skill по имени. Например, для TypeScript:

```bash
npx skills add gromlab-ru/js-reference --skill ts-styleguide
```

Для React-компонентов установи оба связанных скила:

```bash
npx skills add gromlab-ru/js-reference --skill ts-styleguide tsx-styleguide
```

### `react-reference`

Правила разработки клиентских React SPA на TypeScript. Skill охватывает:

- структуру приложения, создание страниц и компонентов через генератор;
- вёрстку по макету и декомпозицию интерфейса;
- архитектуру приложения и размещение ответственности;
- React-компоненты, Mantine, формы, стили и SVG-иконки;
- маршрутизацию через React Router;
- состояние React, Zustand и SWR;
- REST API, OpenAPI и `@gromlab/rest-api-codegen`;
- Vite, переменные окружения и проверки качества.

Skill предназначен для приложений, работающих только в браузере. Он не применяется к Next.js, SSR, React Server
Components и серверному коду.

Документация находится в [`skills/react-reference/`](skills/react-reference/), а согласованное запускаемое приложение — в
[`skills/react-reference/demo-app/`](skills/react-reference/demo-app/).

`react-reference` определяет разработку React-приложения и обращается к скилам канонов по имени. Правила написания кода
принадлежат профильным скилам; прикладные инструкции объясняют, когда их загрузить и применить.

## Рекомендуемая установка

Для полноценной работы `react-reference` установи его вместе с четырьмя скилами канонов из этого репозитория
и четырьмя профильными скилами инструментов и архитектуры:

```bash
npx skills add gromlab-ru/js-reference --skill react-reference ts-styleguide tsx-styleguide postcss-styleguide html-styleguide
npx skills add gromlab-ru/template-file-generator --skill template-generation
npx skills add gromlab-ru/unit-architecture --skill unit-architecture
npx skills add gromlab-ru/rest-api-codegen --skill rest-api-codegen-ru
npx skills add gromlab-ru/svg-sprites --skill svg-sprites-ru
```

Следующие skills определяют применение инструментов и архитектуры:

| Skill | Для чего нужен | Репозиторий |
| --- | --- | --- |
| `template-generation` | Создаёт файлы через `@gromlab/template-file-generator` и настраивает локальные шаблоны | [`gromlab-ru/template-file-generator`](https://github.com/gromlab-ru/template-file-generator) |
| `unit-architecture` | Определяет владельцев, слои, юниты, фасеты и допустимые зависимости | [`gromlab-ru/unit-architecture`](https://github.com/gromlab-ru/unit-architecture) |
| `rest-api-codegen-ru` | Создаёт и организует REST-клиенты из OpenAPI или ручных операций | [`gromlab-ru/rest-api-codegen`](https://github.com/gromlab-ru/rest-api-codegen) |
| `svg-sprites-ru` | Настраивает и диагностирует `@gromlab/svg-sprites` | [`gromlab-ru/svg-sprites`](https://github.com/gromlab-ru/svg-sprites) |

Устанавливай весь набор для нового React SPA. Агент загрузит профильный skill только тогда, когда задача затрагивает его
область.

## Установка только `react-reference`

Если смежные skills уже установлены, добавь только `react-reference`:

```bash
npx skills add gromlab-ru/js-reference --skill react-reference
```

Если профильный skill недоступен агенту, `react-reference` направит его в документацию соответствующего публичного
репозитория. Установленный skill предпочтительнее, потому что он содержит готовый порядок исследования, реализации и
проверки задачи.

## Обновление

Обнови установленный набор отдельной командой:

```bash
npx skills update react-reference ts-styleguide tsx-styleguide postcss-styleguide html-styleguide template-generation unit-architecture rest-api-codegen-ru svg-sprites-ru
```

## Разработка и проверка skills

Собственные skills редактируются непосредственно в `skills/<имя>/`. Имя `SKILL.md` зарезервировано для единственной точки входа каждого skill. Его `name` должен совпадать с именем каталога и быть уникальным во всём публикуемом репозитории; `name` и `description` должны быть непустыми строками в корректном YAML-frontmatter.

Установленные сторонние skills находятся локально в `.agents/skills/` и `.claude/skills/` и исключены из Git. Их источники
учитываются в `skills-lock.json`. Для работы над этим репозиторием установи четыре внешних профильных skill командами
из раздела «Рекомендуемая установка». Собственные пять skills уже находятся в `skills/` и редактируются там напрямую.

Между skills обращайся по имени и указывай задачу, ради которой нужно загрузить skill. Не связывай их относительными
путями или ссылками на внутренние документы другого skill. Внутри одного skill используй локальные ссылки.

Из корня репозитория выполни:

```bash
npm ci
npm run check:skills
npm run test:skills
```

`check:skills` проверяет всё Git-дерево и новые неигнорируемые файлы, включая скрытые каталоги. Он выявляет лишние `SKILL.md`, дубликаты имён, отсутствующие точки входа и некорректный frontmatter. Локальные игнорируемые зависимости не входят в Git-поставку; если их принудительно добавить в Git, проверка завершится ошибкой. Проверка и регрессионные тесты запускаются в CI на push и pull request.
