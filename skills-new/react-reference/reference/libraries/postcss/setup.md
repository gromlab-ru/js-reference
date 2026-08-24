# Установка PostCSS

Устанавливай PostCSS только после определения фактического framework, bundler, package manager и существующего CSS
pipeline. Этот документ поддерживает React + Vite и Next.js 16+.

## Перед установкой

Проверь:

- `package.json` и lock-файл, чтобы определить package manager;
- dev и build scripts, чтобы подтвердить Vite или Next.js;
- существующий `postcss.config.*` и PostCSS-секции других config-файлов;
- установленные PostCSS plugins и presets, включая plugins внутри preset;
- существующие global styles, CSS Modules, variables, tokens и `@custom-media`;
- browser targets в `package.json`, `.browserslistrc` и других build-настройках.

Если проект уже предоставляет эквивалентный pipeline, используй его. Не устанавливай второй plugin для возможности,
которую уже обрабатывает framework, bundler или preset.

## Dependencies

Базовый набор раздела:

| Package | Ответственность |
| --- | --- |
| `postcss` | Запускает CSS transformations |
| `@csstools/postcss-global-data` | Передаёт общие `@custom-media` definitions каждому CSS-файлу |
| `postcss-custom-media` | Преобразует именованные media conditions |
| `postcss-nesting` | Преобразует CSS nesting |
| `autoprefixer` | Добавляет prefixes по Browserslist проекта |

Все packages являются development dependencies приложения.

## React + Vite

Убедись, что проект действительно собирается Vite: dev или build script должен запускать `vite`.

Установи dependencies в package приложения:

```bash
npm install --save-dev postcss @csstools/postcss-global-data postcss-custom-media postcss-nesting autoprefixer
```

Используй фактический package manager проекта. Например, для pnpm замени команду на:

```bash
pnpm add --save-dev postcss @csstools/postcss-global-data postcss-custom-media postcss-nesting autoprefixer
```

Vite автоматически применяет найденный PostCSS config к импортированным CSS-файлам и CSS Modules. Не добавляй
ручной вызов PostCSS в Vite config и не устанавливай отдельный CSS Modules plugin.

После установки переходи к [`configuration.md`](configuration.md).

## Next.js 16+

Убедись, что установлен Next.js версии 16 или новее и scripts запускают `next dev` и `next build`.

Установи dependencies в package Next.js-приложения:

```bash
npm install --save-dev postcss @csstools/postcss-global-data postcss-custom-media postcss-nesting autoprefixer
```

Используй фактический package manager проекта. Например, для pnpm замени команду на:

```bash
pnpm add --save-dev postcss @csstools/postcss-global-data postcss-custom-media postcss-nesting autoprefixer
```

Next.js обрабатывает импортированные CSS-файлы и CSS Modules без отдельного loader. Пользовательский
`postcss.config.mjs` заменяет встроенную PostCSS-конфигурацию Next.js, поэтому каждый необходимый plugin, включая
Autoprefixer, должен быть установлен и указан явно.

Не добавляй PostCSS config в `next.config.*` и не устанавливай отдельный CSS Modules plugin.

После установки переходи к [`configuration.md`](configuration.md).

## Проверка установки

Перед настройкой убедись, что:

- dependencies добавлены в package приложения, а не случайно в корень несвязанного workspace;
- lock-файл обновлён тем же package manager;
- отсутствуют дублирующие plugins и presets;
- существующие lifecycle scripts не перезаписаны;
- framework и bundler соответствуют одному из двух поддерживаемых окружений.
