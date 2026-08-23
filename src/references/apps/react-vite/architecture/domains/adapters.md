# Доменные адаптеры

Adapter является внутренней границей домена с API client, SDK, storage или другим внешним источником.

Роль adapter выражается расположением и именем файла, а экспортируемая функция называется в предметных терминах:

```ts
// adapters/get-current-user.adapter.ts
export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  const currentUserDto = await identityApi.authentication.getCurrentUser()

  return mapCurrentUserDto(currentUserDto)
}
```

Публичный фасет реэкспортирует ту же функцию без alias и wrapper:

```ts
export { getCurrentUser } from './adapters/get-current-user.adapter'
```

Не добавляй `getCurrentUserAdapter`, `authenticationAdapter.getCurrentUser()` или отдельный service только для повторного вызова той же функции.

Adapter может остаться внутренним, когда публичный domain action дополнительно обязан управлять cache или другим lifecycle владельца. Например, Authentication публикует React action hook, который вызывает внутренние `signIn` и `signOut`, отключает private keys и очищает cache предыдущей identity. Не экспортируй adapter параллельно такому action, иначе consumer сможет обойти обязательный lifecycle.

## Mapping

Adapter использует внутренние mappers для преобразования source request и response. Даже identity mapping должен явно вернуть domain type.

```ts
export const mapPetDto = (petDto: PetDto): Pet => ({
  id: petDto.id,
  name: petDto.name,
})
```

DTO не сохраняется в domain state или cache и не передаётся domain UI.

## Ошибки

Adapter интерпретирует известный source error в контексте операции и создаёт ожидаемую доменную ошибку. Неизвестный сбой преобразуется в `ApplicationDefect`:

```ts
try {
  const petDto = await petStoreApi.pets.getPet(petId)

  return mapPetDto(petDto)
} catch (error) {
  if (isPetNotFoundSourceError(error)) {
    throw createPetNotFoundError(petId)
  }

  throw toApplicationDefect('pets.getPet', error)
}
```

Не публикуй raw source error как ожидаемый контракт домена.

Port или repository interface добавляй только при нескольких реализациях, runtime composition или отдельной test boundary. Возможная замена источника в будущем сама по себе не требует дополнительной абстракции.
