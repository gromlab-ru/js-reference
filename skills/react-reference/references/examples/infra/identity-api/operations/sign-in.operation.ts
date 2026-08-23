import type {
  ApiRequestClient,
  RequestParams
} from '@gromlab/rest-api-codegen'

import type { IdentityApiProblem } from '../types/identity-api-problem.type'
import type { SignInRequestDto } from '../types/sign-in-request-dto.type'
import type { SignInResponseDto } from '../types/sign-in-response-dto.type'

/**
 * Выполняет публичный sign-in запрос по wire-контракту Identity API.
 */
export const signIn = (
  httpClient: ApiRequestClient,
  input: SignInRequestDto,
  params: RequestParams = {}
): Promise<SignInResponseDto> => {
  return httpClient.request<SignInResponseDto, IdentityApiProblem>({
    path: '/authentication/sign-in',
    method: 'POST',
    body: input,
    format: 'json',
    ...params,
    secure: false
  })
}
