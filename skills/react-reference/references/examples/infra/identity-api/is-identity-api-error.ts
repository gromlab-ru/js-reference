import { ApiError } from '@gromlab/rest-api-codegen'

/**
 * Проверяет минимальную runtime-форму тела ошибки Identity API.
 */
const hasProblemCode = (value: unknown): value is { code: string } => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    typeof value.code === 'string'
  )
}

/**
 * Проверяет HTTP status и необязательный wire-code технической ошибки Identity API.
 */
export const isIdentityApiError = (
  error: unknown,
  status: number,
  code?: string
): boolean => {
  if (!(error instanceof ApiError) || error.status !== status) {
    return false
  }

  if (code === undefined) {
    return true
  }

  return hasProblemCode(error.error) && error.error.code === code
}
