import type { SWRResponse } from 'swr'
import type { Pet, PetError } from 'src/domains/pet'

/**
 * Данные авторизованного запроса питомца.
 */
export type GetAuthPetData = Pet

/**
 * Ошибка авторизованного запроса питомца.
 */
export type GetAuthPetError = PetError

/**
 * Ключ cache авторизованного запроса питомца.
 */
export type GetAuthPetKey = readonly [
  'private',
  string,
  'pet-store-api/pets/get-pet',
  string
]

/**
 * Результат hook авторизованного запроса питомца.
 */
export type UseGetAuthPetResponse = SWRResponse<
  GetAuthPetData,
  GetAuthPetError
>
