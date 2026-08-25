# Доменные адаптеры

Adapter является границей домена с API client, SDK, storage или другим внешним источником. Реализация adapter находится внутри домена, а необходимая предметная операция публикуется через фасет этого домена.

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

Не добавляй `getCurrentUserAdapter`, `authenticationAdapter.getCurrentUser()` или отдельный service только для повторного вызова той же функции. Термин adapter описывает архитектурную роль, а публичное имя выражает предметную операцию.

Публичный adapter не управляет SWR cache, React state или lifecycle component tree. Он остаётся обычной async-операцией с доменным контрактом и может использоваться вне React. Обязательную синхронизацию cache выполняет domain hook/action или другой явный lifecycle owner после успешного adapter call.

GET adapter публикуется даже при наличии SWR hook. Для данных, участвующих в React render, consumer использует hook; прямой GET adapter предназначен для императивного сценария или кода вне React lifecycle.

## Внешняя operation

Adapter использует готовую возможность публичного фасета infra-юнита. Для REST это может быть метод собранного API client либо отдельная operation с уже настроенным `HttpClient`:

```ts
const petDto = await petStoreApi.pets.getPet({ id: petId })
```

```ts
const petDto = await getPet(petStoreHttpClient, { id: petId })
```

Оба варианта используют один настроенный transport. Отдельная operation допустима, когда consumer не должен включать всё дерево API client в свой чанк. Не создавай `HttpClient`, API client, URL, auth или transport policy внутри domain adapter. Правила REST-инфраструктуры описаны в [`infra-units.md`](../infra-units.md), а создание клиента — в [`@gromlab/rest-api-codegen`](../../../libraries/rest-api-codegen/README.md).

## Mapping

Adapter использует внутренние mappers для преобразования domain input в source request и source response в domain result. Даже identity mapping должен явно вернуть domain type.

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
