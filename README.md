# JS Reference

Репозиторий содержит skills с правилами разработки JavaScript- и TypeScript-приложений. Skill помогает агенту выбрать
принятое в проекте решение, определить владельца кода, выполнить изменение и проверить результат.

## Skills репозитория

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

## Рекомендуемая установка

Для полноценной работы `react-reference` установи его вместе с тремя профильными skills:

```bash
npx skills add gromlab-ru/js-reference --skill react-reference
npx skills add gromlab-ru/unit-architecture --skill unit-architecture
npx skills add gromlab-ru/rest-api-codegen --skill rest-api-codegen-ru
npx skills add gromlab-ru/svg-sprites --skill svg-sprites-ru
```

Каждый профильный skill уточняет свою область и не заменяет правила `react-reference`:

| Skill | Для чего нужен | Репозиторий |
| --- | --- | --- |
| `unit-architecture` | Определяет владельцев, слои, юниты, фасеты и допустимые зависимости | [`gromlab-ru/unit-architecture`](https://github.com/gromlab-ru/unit-architecture) |
| `rest-api-codegen-ru` | Создаёт и организует REST-клиенты из OpenAPI или ручных операций | [`gromlab-ru/rest-api-codegen`](https://github.com/gromlab-ru/rest-api-codegen) |
| `svg-sprites-ru` | Настраивает и диагностирует `@gromlab/svg-sprites` | [`gromlab-ru/svg-sprites`](https://github.com/gromlab-ru/svg-sprites) |

Устанавливай весь набор для нового React SPA. Агент загрузит профильный skill только тогда, когда задача затрагивает его
область.

## Установка только `react-reference`

Если смежные skills уже установлены, добавь только skill этого репозитория:

```bash
npx skills add gromlab-ru/js-reference --skill react-reference
```

Если профильный skill недоступен агенту, `react-reference` направит его в документацию соответствующего публичного
репозитория. Установленный skill предпочтительнее, потому что он содержит готовый порядок исследования, реализации и
проверки задачи.

## Обновление

Обнови установленный набор отдельной командой:

```bash
npx skills update react-reference unit-architecture rest-api-codegen-ru svg-sprites-ru
```

## Разработка и проверка skills

Собственные skills редактируются непосредственно в `skills/<имя>/`. Имя `SKILL.md` зарезервировано для единственной точки входа каждого skill. Его `name` должен совпадать с именем каталога и быть уникальным во всём публикуемом репозитории; `name` и `description` должны быть непустыми строками в корректном YAML-frontmatter.

Установленные сторонние skills находятся локально в `.agents/skills/` и `.claude/skills/` и исключены из Git. Их источники учитываются в `skills-lock.json`. После клонирования установи необходимые зависимости командами из раздела «Рекомендуемая установка»; для работы над этим репозиторием достаточно трёх профильных skills.

Из корня репозитория выполни:

```bash
npm ci
npm run check:skills
npm run test:skills
```

`check:skills` проверяет всё Git-дерево и новые неигнорируемые файлы, включая скрытые каталоги. Он выявляет лишние `SKILL.md`, дубликаты имён, отсутствующие точки входа и некорректный frontmatter. Локальные игнорируемые зависимости не входят в Git-поставку; если их принудительно добавить в Git, проверка завершится ошибкой. Проверка и регрессионные тесты запускаются в CI на push и pull request.
