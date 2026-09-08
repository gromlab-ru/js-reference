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
