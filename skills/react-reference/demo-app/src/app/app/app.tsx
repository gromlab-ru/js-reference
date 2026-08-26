import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from 'infra/theme'
import { appRouter } from '../router/app-router'
import type { AppProps } from './types/app-props.type'

/**
 * Отображает корневую композицию приложения.
 *
 * Используется для:
 *  - подключения общей темы
 *  - подключения маршрутизатора
 */
export const App = (_props: AppProps) => (
  <ThemeProvider>
    <RouterProvider router={appRouter} />
  </ThemeProvider>
)
