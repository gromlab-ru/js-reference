import type { SWRResponse } from 'swr'
import type { Pet, PetError } from 'src/domains/pet'

/**
 * Данные, возвращаемые GET-operation питомца.
 */
export type GetPetData = Pet

/**
 * Ошибка GET-operation питомца.
 */
export type GetPetError = PetError

/**
 * Ключ cache для GET-operation питомца.
 */
export type GetPetKey = readonly ['pet-store-api/pets/get-pet', string]

/**
 * Результат hook загрузки питомца.
 */
export type UseGetPetResponse = SWRResponse<GetPetData, GetPetError>
