# Настройка Mantine

По архитектурным правилам React SPA общая тема Mantine принадлежит юниту `infra/theme`. Компоненты приложения
используют Mantine напрямую, но не импортируют внутреннюю конфигурацию темы. Граница владельца описана в
[`application/architecture/units/infra.md`](../../application/architecture/units/infra.md).

## Структура

Для нового приложения создай:

```text
src/infra/theme/
├── index.ts
├── theme-provider.tsx
├── config/
│   └── theme.config.ts
└── types/
    └── theme-provider-props.type.ts
```

Хук цветовой схемы добавляй только при наличии потребителя:

```text
src/infra/theme/
└── hooks/
    └── use-theme-color-scheme.hook.ts
```

## Подключение стилей

В начале `src/shared/styles/index.css` объяви слой Mantine и импортируй слоистые стили библиотеки:

```css
@layer mantine;

@import '@mantine/core/styles.layer.css';
@import './variables.css';
```

Импорты должны находиться до обычных CSS-правил. `index.css` по-прежнему подключается один раз во входном файле
приложения по правилам [`application/styling`](../../application/styling/README.md).

Дополнительный пакет Mantine подключает собственные стили только после установки. Например:

```css
@import '@mantine/tiptap/styles.layer.css';
```

Не импортируй стили неиспользуемого пакета и не подключай стили Mantine в отдельных компонентах.

Если приложение поддерживает светлую и тёмную схемы, передай выбранную Mantine схему браузеру в том же `index.css`:

```css
html {
  color-scheme: var(--mantine-color-scheme);
}
```

Проектные переменные могут добавлять собственный смысл поверх публичных переменных Mantine:

```css
:root {
  --app-color-canvas: light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-9));
}
```

Не повторяй цвет, отступ или радиус Mantine под новым именем без отдельного проектного смысла.

## Тема

Создай `config/theme.config.ts`:

```ts
import { createTheme } from '@mantine/core'

/**
 * Базовая тема приложения.
 */
export const theme = createTheme({
  defaultRadius: 'md',
  fontFamily: 'system-ui, sans-serif',
  headings: {
    fontFamily: 'system-ui, sans-serif',
    fontWeight: '650'
  }
})
```

Значения являются начальной конфигурацией. Согласуй шрифты, цвета, радиусы и остальные параметры с дизайном
приложения. Указывай собственный шрифт только после подключения его файлов. Не добавляй настройки компонента заранее
без фактического общего требования.

Не публикуй `theme` через фасет. Она является внутренней конфигурацией `infra/theme`.

## ThemeProvider

Создай внутренний тип свойств в `types/theme-provider-props.type.ts`:

```ts
import type { ReactNode } from 'react'

/**
 * Свойства провайдера темы приложения.
 */
export type ThemeProviderProps = {
  /** Дочернее дерево приложения. */
  children: ReactNode
}
```

Создай `theme-provider.tsx`:

```tsx
import { MantineProvider } from '@mantine/core'

import { theme } from './config/theme.config'
import type { ThemeProviderProps } from './types/theme-provider-props.type'

/**
 * Подключает тему Mantine ко всему приложению.
 */
export const ThemeProvider = (props: ThemeProviderProps) => {
  const { children } = props

  return (
    <MantineProvider defaultColorScheme="light" theme={theme}>
      {children}
    </MantineProvider>
  )
}
```

`ThemeProvider` является проектной границей общей темы, а не обёрткой для переименования `MantineProvider`: он
связывает библиотеку с конфигурацией приложения и закрепляет поддерживаемую цветовую схему.

Опубликуй провайдер в `index.ts`:

```ts
export { ThemeProvider } from './theme-provider'
```

Тип `ThemeProviderProps` остаётся внутренним, пока он не нужен внешнему потребителю.

## Подключение к приложению

Корневая композиция `app` импортирует провайдер через фасет `infra/theme`:

```tsx
import { RouterProvider } from 'react-router-dom'

import { ThemeProvider } from 'infra/theme'
import { appRouter } from './app-router'

/**
 * Подключает общие возможности приложения.
 */
export const App = () => {
  return (
    <ThemeProvider>
      <RouterProvider router={appRouter} />
    </ThemeProvider>
  )
}
```

Не импортируй `theme.config.ts` и не создавай второй `MantineProvider` в маршруте, экране или компоненте.

## Цветовая схема

Начальная конфигурация поддерживает только светлую схему. Если продукт требует светлую и тёмную схемы, измени
`defaultColorScheme` на `auto`, добавь правило `color-scheme` в общие стили и проверь обе схемы.

Если приложению требуется переключатель цветовой схемы, добавь
`hooks/use-theme-color-scheme.hook.ts`:

```ts
import { useComputedColorScheme, useMantineColorScheme } from '@mantine/core'

type ThemeColorSchemeControls = {
  isDark: boolean
  toggleColorScheme: () => void
}

/**
 * Возвращает фактическую цветовую схему и действие для её переключения.
 */
export const useThemeColorScheme = (): ThemeColorSchemeControls => {
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: false })
  const { toggleColorScheme } = useMantineColorScheme()

  return {
    isDark: colorScheme === 'dark',
    toggleColorScheme
  }
}
```

Опубликуй хук через `infra/theme/index.ts`. Потребитель не должен повторять правила определения фактической схемы.
Если переключение не требуется, не создавай этот хук.

## Проверка

- Стили `@mantine/core` импортированы один раз до общих правил приложения.
- `color-scheme` связан с Mantine, если приложение поддерживает обе схемы.
- `ThemeProvider` подключён один раз в корневой композиции.
- Конфигурация темы остаётся внутренней для `infra/theme`.
- Базовая конфигурация не включает тёмную схему без продуктового требования.
- Компоненты не импортируют `theme.config.ts`.
- Хук цветовой схемы существует только при наличии потребителя.
- Производственная сборка включает стили Mantine и переменные темы.
