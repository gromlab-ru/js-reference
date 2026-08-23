import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { RouteErrorBoundary } from './route-error-boundary'

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        lazy: () => import('./routes/home.route')
      },
      {
        path: 'account',
        lazy: () => import('./routes/account.route')
      },
      {
        path: 'sign-in',
        lazy: () => import('./routes/sign-in.route')
      }
    ]
  }
])

/**
 * Подключает app-owned дерево маршрутов к browser history.
 */
export const AppRouter = () => <RouterProvider router={router} />
