import {
  identityApi,
  setAccessToken
} from '@/infra/identity-api'
import { toApplicationDefect } from '@/shared/errors'

import {
  createAccountLockedError,
  createAuthenticationUnavailableError,
  createInvalidCredentialsError
} from '../errors/authentication-error.factory'
import { mapSignInInput } from '../mappers/sign-in-request.mapper'
import { mapSignInResponseDto } from '../mappers/sign-in-response.mapper'
import { isAccountLockedSourceError } from '../source-errors/is-account-locked-source-error'
import { isInvalidCredentialsSourceError } from '../source-errors/is-invalid-credentials-source-error'
import { isTemporarilyUnavailableSourceError } from '../source-errors/is-temporarily-unavailable-source-error'
import type { CurrentUser } from '../types/current-user.type'
import type { SignInInput } from '../types/sign-in-input.type'

/**
 * Создаёт локальную auth session и возвращает только предметную identity.
 */
export const signIn = async (input: SignInInput): Promise<CurrentUser> => {
  try {
    const signInRequestDto = mapSignInInput(input)
    const signInResponseDto = await identityApi.authentication.signIn(signInRequestDto)
    const signInResponse = mapSignInResponseDto(signInResponseDto)

    setAccessToken(signInResponse.accessToken)

    return signInResponse.currentUser
  } catch (error) {
    if (isInvalidCredentialsSourceError(error)) {
      throw createInvalidCredentialsError()
    }

    if (isAccountLockedSourceError(error)) {
      throw createAccountLockedError()
    }

    if (isTemporarilyUnavailableSourceError(error)) {
      throw createAuthenticationUnavailableError()
    }

    throw toApplicationDefect('authentication.signIn', error)
  }
}
