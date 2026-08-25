import type { GetPetKey } from './types/use-get-pet.type'

/**
 * Создаёт cache key питомца.
 *
 * Используется в domain hook и внешней revalidation.
 */
export const getPetKey = (id: string | null): GetPetKey | null => {
  if (id === null) {
    return null
  }

  return ['pet-store-api/pets/get-pet', id]
}
