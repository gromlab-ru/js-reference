# Алиасы слоёв

Архитектурный профиль закрепляет алиасы `app/*`, `compositions/*`, `domains/*`, `infra/*`, `ui/*` и `shared/*`. Этот
документ настраивает одинаковое разрешение этих путей в TypeScript и Vite.

Не создавай пустые каталоги слоёв ради настройки. Алиас может быть объявлен до появления первого юнита соответствующей
роли.

## TypeScript

Добавь пути в конфигурацию TypeScript, которая проверяет исходный код приложения. В стандартном проекте Vite это обычно
`tsconfig.app.json`; если проект использует один `tsconfig.json`, добавь настройку туда:

```json
{
  "compilerOptions": {
    "paths": {
      "app/*": ["./src/app/*"],
      "compositions/*": ["./src/compositions/*"],
      "domains/*": ["./src/domains/*"],
      "infra/*": ["./src/infra/*"],
      "ui/*": ["./src/ui/*"],
      "shared/*": ["./src/shared/*"]
    }
  }
}
```

`paths` сообщает TypeScript, какой исходный файл соответствует импорту. Эта настройка сама не изменяет разрешение
модулей во время сборки, поэтому тот же набор алиасов требуется Vite.

## Vite

Настрой алиасы в `vite.config.ts` через абсолютные пути от файла конфигурации:

```ts
import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      app: fileURLToPath(new URL('./src/app', import.meta.url)),
      compositions: fileURLToPath(new URL('./src/compositions', import.meta.url)),
      domains: fileURLToPath(new URL('./src/domains', import.meta.url)),
      infra: fileURLToPath(new URL('./src/infra', import.meta.url)),
      ui: fileURLToPath(new URL('./src/ui', import.meta.url)),
      shared: fileURLToPath(new URL('./src/shared', import.meta.url))
    }
  }
})
```

Не используй относительный путь вроде `./src/domains` как значение замены Vite: разрешение такого пути зависит от
контекста импортирующего файла. `fileURLToPath(new URL(..., import.meta.url))` создаёт устойчивый абсолютный путь.

Если проект уже получает алиасы из `tsconfig` через установленный плагин, не добавляй второй параллельный список в
Vite. Используй один существующий механизм и проверь, что он работает для запуска и производственной сборки.

## Использование

Между юнитами импортируй через алиас слоя и фасет владельца:

```ts
import { getCurrentUser } from 'domains/authentication'
import { ThemeProvider } from 'infra/theme'
```

Внутри одного юнита используй относительный путь:

```ts
import { mapCurrentUserDto } from './mappers/current-user.mapper'
```

Не используй алиас для глубокого импорта реализации:

```ts
// Недопустимо: adapters является внутренним сегментом домена.
import { getCurrentUser } from 'domains/authentication/adapters/get-current-user.adapter'
```

## Другие инструменты

- Vitest использует `resolve.alias` из Vite, если не переопределяет конфигурацию отдельно.
- Настрой отдельное разрешение путей ESLint только тогда, когда используемое правило импортов не понимает пути
  TypeScript.
- Не дублируй алиасы в инструментах, которые уже читают конфигурацию TypeScript или Vite.

## Проверка

1. Выполни проверку типов проекта.
2. Запусти сервер разработки и открой модуль с межслойным импортом.
3. Выполни производственную сборку.
4. Запусти тесты, которые импортируют код через алиасы.
5. Убедись, что IDE открывает исходный файл по импорту и не предлагает путь с `@/`.

Ошибку разрешения только в одном инструменте исправляй в его конфигурации. Не заменяй архитектурный импорт глубоким
относительным путём ради обхода настройки.
