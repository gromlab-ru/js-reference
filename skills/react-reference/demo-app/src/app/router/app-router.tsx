import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from 'compositions/layouts/main'
import { HomeRoute } from 'compositions/routes/home'
import { NotFoundRoute } from 'compositions/routes/not-found'
import { RouteErrorBoundary } from './route-error-boundary/route-error-boundary'
import { RoutePending } from './route-pending/route-pending'

/**
 * Определяет дерево URL и способ подключения маршрутов приложения.
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
        Component: HomeRoute
      },
      {
        path: 'sign-in',
        lazy: () => import('compositions/routes/sign-in/lazy')
      },
      {
        lazy: () => import('compositions/routes/require-authentication/lazy'),
        children: [
          {
            path: 'account',
            lazy: () => import('compositions/routes/account/lazy')
          }
        ]
      },
      {
        path: '*',
        Component: NotFoundRoute
      }
    ]
  }
])
