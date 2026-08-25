# Platform React SPA

Этот раздел описывает browser и build-time окружение React SPA. Platform configuration не является runtime-юнитом, но доступ application code к возможностям окружения должен иметь явного технического владельца.

## Vite

Vite с официальным React plugin является default dev server и production bundler. Используй существующую конфигурацию проекта и не добавляй другой bundler без задачи на миграцию.

Build configuration отвечает за React transform, static assets, aliases, environment variables и необходимые plugins. Она не получает искусственный runtime-фасет только ради соответствия архитектурному дереву.

## Environment

Build-time значения поступают через Vite environment variables. Доступ к `import.meta.env` централизуется в техническом владельце, который:

- читает только ожидаемые ключи;
- валидирует обязательные значения;
- преобразует строки в типизированный application contract;
- сообщает об ошибочной конфигурации до выполнения зависимого сценария.

Application code не читает `import.meta.env` напрямую. Любое значение frontend bundle доступно пользователю, поэтому secrets не помещаются в browser configuration.

## Даты и локализация

Day.js является default-библиотекой для parsing, formatting и преобразования дат. Формат transport contract, locale и timezone задаются явно и не зависят от неявных настроек browser environment.

Локализация добавляется только при наличии продуктового требования. Если проект уже использует i18n, следуй принятой библиотеке, владельцу переводов и правилам форматирования.

## Проверка

- Production build выполняется с теми же обязательными environment keys, что deployment.
- Browser code не содержит secrets и server-only dependencies.
- Static assets и lazy chunks разрешаются с production base URL.
- Даты не меняют смысл из-за неявного locale или timezone.
