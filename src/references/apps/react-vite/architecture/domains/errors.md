# Ожидаемые доменные ошибки

Успешная операция возвращает доменный результат напрямую. Ожидаемый неуспешный исход бросается как typed domain exception.

Не оборачивай успешный результат в `Result`, `{ ok, value }` или `{ data, error }`.

## Контракт ошибки

Ошибка содержит стабильный domain code и только необходимые consumer предметные данные:

```ts
export const PET_ERROR_CODE = {
  NOT_FOUND: 'PET_NOT_FOUND',
  TEMPORARILY_UNAVAILABLE: 'PET_TEMPORARILY_UNAVAILABLE',
} as const

export type PetErrorDetails =
  | Readonly<{
      code: typeof PET_ERROR_CODE.NOT_FOUND
      payload: Readonly<{ petId: string }>
    }>
  | Readonly<{
      code: typeof PET_ERROR_CODE.TEMPORARILY_UNAVAILABLE
    }>
```

- Code записывается в `SCREAMING_SNAKE_CASE` и является стабильной частью domain contract.
- Связь code и payload описывается discriminated union.
- Пустой payload не добавляется.
- Message используется для диагностики, а не как пользовательский текст.
- Для каждой операции экспортируется отдельный error type с допустимыми именно для неё codes.

## Создание ошибки

Класс и factories остаются внутренними. Публичный фасет открывает codes, operation-specific type и runtime guard.

```ts
class PetDomainError extends Error {
  readonly name = 'PetDomainError'

  constructor(readonly details: PetErrorDetails) {
    super(`pet:${details.code}`)
  }
}

export const createPetNotFoundError = (petId: string): PetDomainError => {
  return new PetDomainError({
    code: PET_ERROR_CODE.NOT_FOUND,
    payload: { petId },
  })
}
```

Не собирай details рядом с каждым `throw`: именованная factory централизует code, payload и реализацию ошибки.

## Runtime guard

TypeScript не отражает thrown type в `Promise<Pet>`, поэтому операция дополнительно экспортирует свой error type и guard:

```ts
if (isGetPetError(error)) {
  handlePetError(error)
  return
}
```

Consumer обрабатывает все codes operation-specific контракта либо передаёт typed error владельцу, который обеспечивает исчерпывающую обработку. Не добавляй `default`, скрывающий расширение закрытого union.

Значение, которое не прошло guard, обрабатывается по [`failure-handling`](../../../../failure-handling.md). Не добавляй code `UNEXPECTED` в domain error union.
