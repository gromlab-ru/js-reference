import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { RouteErrorBoundary } from './route-error-boundary'

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        lazy: () => import('compositions/pages/home/lazy')
      },
      {
        path: 'account',
        lazy: () => import('compositions/pages/account/lazy')
      },
      {
        path: 'sign-in',
        lazy: () => import('compositions/pages/sign-in/lazy')
      }
    ]
  }
])

/**
 * Подключает принадлежащее app дерево маршрутов к истории браузера.
 */
export const AppRouter = () => <RouterProvider router={router} />
