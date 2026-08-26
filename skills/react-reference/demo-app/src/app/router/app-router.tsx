import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from 'compositions/layouts/main'
import { RouteErrorBoundary } from './route-error-boundary/route-error-boundary'
import { RoutePending } from './route-pending/route-pending'

/**
 * Определяет дерево URL и динамически подключаемые страницы приложения.
 */
export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <RouteErrorBoundary />,
    hydrateFallbackElement: <RoutePending />,
    children: [
      {
        index: true,
        lazy: () => import('compositions/routes/home/lazy')
      },
      {
        path: 'sign-in',
        lazy: () => import('compositions/routes/sign-in/lazy')
      },
      {
        lazy: () => import('compositions/routes/authenticated/lazy'),
        children: [
          {
            path: 'account',
            lazy: () => import('compositions/routes/account/lazy')
          }
        ]
      },
      {
        path: '*',
        lazy: () => import('compositions/routes/not-found/lazy')
      }
    ]
  }
])
