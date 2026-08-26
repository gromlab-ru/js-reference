import { Alert, Button, Center, Container, Loader, Stack, Text, Title } from '@mantine/core'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AuthGuard } from 'domains/authentication'
import styles from './styles/require-authentication.module.css'
import type { RequireAuthenticationRouteProps } from './types/require-authentication-route-props.type'

/**
 * Связывает границу авторизации с защищённой маршрутной веткой.
 *
 * Используется для:
 *  - перенаправления гостя с сохранением исходного адреса
 *  - отображения маршрутных состояний проверки сессии
 *  - подключения защищённой ветки через Outlet
 */
export const RequireAuthenticationRoute = (_props: RequireAuthenticationRouteProps) => {
  const location = useLocation()
  const returnTo = `${location.pathname}${location.search}${location.hash}`

  return (
    <AuthGuard
      pendingFallback={(
        <Center className={styles.state} component="section">
          <Stack align="center" gap="md">
            <Loader color="indigo" />
            <Title order={1} size="h3">
              Проверяем сессию
            </Title>
          </Stack>
        </Center>
      )}
      renderError={({ retry }) => (
        <Container className={styles.state} component="section" size="sm">
          <Alert color="red" title="Не удалось проверить авторизацию">
            <Stack gap="md">
              <Text>Сервис временно недоступен. Повторите проверку.</Text>
              <Button onClick={retry} variant="light">
                Повторить
              </Button>
            </Stack>
          </Alert>
        </Container>
      )}
      unauthenticatedFallback={<Navigate replace state={{ returnTo }} to="/sign-in" />}
    >
      <Outlet />
    </AuthGuard>
  )
}
