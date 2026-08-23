import type {
  ApiRequestClient,
  RequestParams
} from '@gromlab/rest-api-codegen'

import type { CurrentUserDto } from '../types/current-user-dto.type'
import type { IdentityApiProblem } from '../types/identity-api-problem.type'

/**
 * Выполняет защищённый запрос текущего пользователя по wire-контракту Identity API.
 */
export const getCurrentUser = (
  httpClient: ApiRequestClient,
  params: RequestParams = {}
): Promise<CurrentUserDto> => {
  return httpClient.request<CurrentUserDto, IdentityApiProblem>({
    path: '/authentication/current-user',
    method: 'GET',
    format: 'json',
    ...params,
    secure: true
  })
}
