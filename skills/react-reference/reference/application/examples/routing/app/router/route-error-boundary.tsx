import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

/**
 * Показывает безопасное сообщение при сбое загрузки или отображения маршрута.
 */
export const RouteErrorBoundary = () => {
  const error = useRouteError()
  let message = 'Не удалось открыть страницу'

  if (isRouteErrorResponse(error) && error.status === 404) {
    message = 'Страница не найдена'
  }

  return (
    <main>
      <h1>{message}</h1>
      <a href="/">Вернуться на главную</a>
    </main>
  )
}
