# Стилизация React SPA

Этот раздел описывает границу между React UI, CSS ownership и общим PostCSS pipeline. Настройку plugins, global data, custom media, nesting, Autoprefixer и Browserslist применяй по [`languages/postcss/README.md`](../../../languages/postcss/README.md).

## Разделение ответственности

| Ответственность | Место |
| --- | --- |
| PostCSS plugins и Browserslist | Build configuration |
| Общие variables, tokens и custom media | `shared` styles |
| Единственное подключение global styles | `app` boundary |
| Локальный DOM, layout и visual states | CSS Module ближайшего UI owner |
| Базовый внешний вид и accessibility component | Mantine contract |

CSS Module размещается рядом с component или UI owner, DOM которого он оформляет. Общий selector не выносится в global stylesheet только потому, что встречается несколько раз: сначала определи общий visual primitive и его владельца.

## Mantine и CSS Modules

Сначала используй публичные props, variants и theme contract Mantine. CSS Modules применяй для проектной композиции, layout, responsive behavior и состояний, которые принадлежат consumer или составному UI owner.

Не переопределяй внутренние selectors библиотеки, если тот же результат доступен через её публичный API. Не создавай второй набор tokens поверх уже принятого theme contract.

## Пример

Рабочая конфигурация и общие primitives находятся в [`examples/postcss/`](../examples/postcss/). Пример показывает физическую форму, но не требует копировать все файлы в каждый проект.

## Проверка

- Global styles подключены один раз на application boundary.
- Local styles изолированы CSS Modules и принадлежат DOM owner.
- Tokens и breakpoints не продублированы.
- Browser targets определены в одном месте.
- Production build подтверждает работу итогового CSS pipeline.
