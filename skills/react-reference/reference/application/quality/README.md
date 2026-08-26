# Quality React SPA

Quality объединяет правила обработки failures и проверки изменяемого кода. Общую классификацию ошибок применяй по
[`failure-handling.md`](failure-handling.md), предметные expected errors — по
[`architecture/units/domains/errors.md`](../architecture/units/domains/errors.md).

## Failure handling

- Ожидаемый результат операции отображается в контексте пользовательского действия.
- Известный source error преобразуется в предметную ошибку внутри domain adapter.
- Неизвестный технический сбой становится application defect и передаётся ближайшей подходящей boundary.
- Error boundary не заменяет локальное отображение ожидаемой ошибки формы или action.
- Transport details, DTO и raw source errors не показываются consumer.

Пример общей application error находится в [`examples/shared/errors/`](../examples/shared/errors/).

## Проверки

Используй scripts и конфигурацию проекта. Для изменяемого кода выполняй все относящиеся к нему проверки:

1. Formatting.
2. Linting.
3. TypeScript typecheck.
4. Существующие tests, покрывающие изменяемое поведение.
5. Production build для изменений build pipeline, assets, environment или module graph.

Vitest является default test runner. Не добавляй новый testing stack и вспомогательные библиотеки без отдельной необходимости.

Не отключай правила, не ослабляй типы и не подавляй ошибки вместо исправления причины.
