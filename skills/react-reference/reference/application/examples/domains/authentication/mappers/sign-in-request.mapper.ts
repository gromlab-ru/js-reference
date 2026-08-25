import type { SignInRequestDto } from '@/infra/identity-api'

import type { SignInInput } from '../types/sign-in-input.type'

/**
 * Преобразует предметные параметры входа в wire request Identity API.
 */
export const mapSignInInput = (input: SignInInput): SignInRequestDto => ({
  login: input.login.trim(),
  password: input.password
})
