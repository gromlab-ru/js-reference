import type { CurrentUser } from '../types/current-user.type'

/**
 * Проверяет список разрешений из недоверенного wire response.
 */
const isPermissions = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((permission) => typeof permission === 'string')
}

/**
 * Преобразует проверенный Identity API DTO в независимую доменную модель.
 */
export const mapCurrentUserDto = (value: unknown): CurrentUser => {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('id' in value) ||
    typeof value.id !== 'string' ||
    !('display_name' in value) ||
    typeof value.display_name !== 'string' ||
    !('email' in value) ||
    typeof value.email !== 'string' ||
    !('permissions' in value) ||
    !isPermissions(value.permissions)
  ) {
    throw new TypeError('Invalid current user response')
  }

  return {
    id: value.id,
    displayName: value.display_name,
    email: value.email.trim().toLowerCase(),
    permissions: [...value.permissions]
  }
}
