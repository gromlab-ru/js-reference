import type {
  ApiRequestClient,
  RequestParams
} from '@gromlab/rest-api-codegen'

import type { IdentityApiProblem } from '../types/identity-api-problem.type'

/**
 * Отзывает текущую server session без автоматического retry.
 */
export const signOut = (
  httpClient: ApiRequestClient,
  params: RequestParams = {}
): Promise<null> => {
  return httpClient.request<null, IdentityApiProblem>({
    path: '/authentication/sign-out',
    method: 'POST',
    ...params,
    secure: true
  })
}
