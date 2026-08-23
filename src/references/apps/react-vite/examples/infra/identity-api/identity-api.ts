import { createApiClient } from '@gromlab/rest-api-codegen'

import { identityHttpClient } from './http-client'
import { getCurrentUser } from './operations/get-current-user.operation'
import { signIn } from './operations/sign-in.operation'
import { signOut } from './operations/sign-out.operation'

/**
 * Частичный Identity API client, содержащий только операции auth-сценария SPA.
 */
export const identityApi = createApiClient(identityHttpClient, {
  authentication: {
    getCurrentUser,
    signIn,
    signOut
  }
})
