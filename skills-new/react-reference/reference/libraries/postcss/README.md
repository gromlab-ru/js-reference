# PostCSS

Этот раздел полностью описывает установку, настройку и использование PostCSS в поддерживаемых frontend-окружениях.
Для работы с ним не требуются другие references.

PostCSS используется как обязательный CSS pipeline для:

- передачи общих `@custom-media` definitions во все обрабатываемые CSS-файлы;
- преобразования custom media;
- преобразования CSS nesting;
- добавления browser prefixes по Browserslist проекта.

Сейчас раздел поддерживает два окружения:

- React + Vite;
- Next.js 16+.

CSS Modules предоставляет bundler или framework. PostCSS обрабатывает их CSS, но не отвечает за генерацию локальных
имён классов.

## Порядок работы

1. Определи фактическое окружение и установи dependencies по [`setup.md`](setup.md).
2. Создай PostCSS config и начальные style-файлы по [`configuration.md`](configuration.md).
3. Подключи global styles один раз на application boundary.
4. Пиши global styles и CSS Modules по [`usage.md`](usage.md).
5. Проверь production build и итоговый CSS.

## Карта документов

| Задача | Документ |
| --- | --- |
| Установить PostCSS в React + Vite | [`setup.md`](setup.md#react--vite) |
| Установить PostCSS в Next.js 16+ | [`setup.md`](setup.md#nextjs-16) |
| Настроить plugins и Browserslist | [`configuration.md`](configuration.md#postcss-config) |
| Создать `index.css`, `variables.css` и `media.css` | [`configuration.md`](configuration.md#начальные-файлы) |
| Подключить global styles | [`configuration.md`](configuration.md#глобальное-подключение) |
| Использовать nesting, custom media и tokens | [`usage.md`](usage.md) |
| Организовать CSS Modules | [`usage.md`](usage.md#css-modules) |

## Основные ограничения

- Не мигрируй существующий рабочий CSS pipeline без отдельной задачи.
- Не добавляй второй preset или plugin для nesting, custom media или prefixes.
- Не создавай параллельные хранилища variables, tokens и breakpoints.
- Не задавай browser targets одновременно в нескольких местах.
- Не считай наличие dependencies и config подтверждением работы без production build.
