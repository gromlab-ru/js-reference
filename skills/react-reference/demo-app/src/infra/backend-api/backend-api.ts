import { createApiClient, operationsTree } from './generated'
import { backendHttpClient } from './backend-http-client'

/**
 * Предоставляет операции серверного API через единый настроенный HTTP-клиент.
 */
export const backendApi = createApiClient(backendHttpClient, operationsTree)
