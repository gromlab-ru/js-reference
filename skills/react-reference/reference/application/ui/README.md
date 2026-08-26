# React и UI

Этот раздел связывает правила TypeScript и TSX с UI ownership React SPA. Архитектурную границу компонента определяй до выбора физической формы и библиотеки.

## Карта знаний

| Задача | Референс |
| --- | --- |
| Общие правила кода | [`styleguide/README.md`](../../styleguide/README.md) |
| Контракты TypeScript и проверки значений | [`styleguide/typescript/README.md`](../../styleguide/typescript/README.md) |
| JSX, свойства, хуки и декомпозиция | [`styleguide/jsx-tsx.md`](../../styleguide/jsx-tsx.md) |
| Общие стили и CSS Modules | [`styleguide/css.md`](../../styleguide/css.md) |
| Самостоятельный UI-юнит или внутренний component | [`architecture/ui-units.md`](../architecture/ui-units.md) |
| Реализация публичного UI-юнита | [`examples/ui/button/`](../examples/ui/button/) |

## UI-библиотека

Mantine является default UI-библиотекой для новых решений. Сначала используй существующий primitive или component Mantine. Собственный общий компонент создавай, когда библиотека не предоставляет подходящего контракта или проекту нужна устойчивая композиция нескольких primitives.

Mantine отвечает за базовые UI mechanics и accessibility foundation. Архитектурный владелец отвечает за назначение, предметное поведение, composition и публичный контракт компонента.

## Ownership

- Общая визуальная возможность без предметного смысла принадлежит слою `ui`.
- Предметный UI остаётся внутри соответствующего domain owner.
- Screen и widget владеют своей локальной композицией и внутренними components.
- Route module собирает готовые возможности, но не становится владельцем каждого отображаемого component.
- Внутренний component не получает отдельный фасет без самостоятельной ответственности и внешних consumers.

## Границы

- Не создавай wrapper, который только переименовывает Mantine component.
- Не дублируй state библиотечного component в отдельном React или Zustand store.
- Не раскрывай CSS Modules и внутренние helpers через публичный фасет UI-юнита.
- Не заменяй semantic HTML универсальными контейнерами ради удобства стилизации.
- Не добавляй другую UI-библиотеку для единичного component без отдельного решения по stack.
