import { Alert, Button, Center, Container, Loader, Stack, Text, Title } from '@mantine/core'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useGetCurrentSession } from 'domains/authentication'
import styles from './styles/authenticated.module.css'
import type { AuthenticatedRouteProps } from './types/authenticated-route-props.type'

/**
 * Ограничивает вложенную маршрутную ветку действующей сессией.
 *
 * Используется для:
 *  - ожидания результата проверки авторизации
 *  - перенаправления гостя с сохранением исходного адреса
 *  - отображения защищённой ветки через Outlet
 */
export const AuthenticatedRoute = (_props: AuthenticatedRouteProps) => {
  const currentSession = useGetCurrentSession()
  const location = useLocation()

  /**
   * Повторяет проверку текущей сессии.
   */
  const handleRetry = (): void => {
    void currentSession.refresh()
  }

  if (currentSession.defect !== undefined) {
    throw currentSession.defect
  }

  if (currentSession.error !== undefined) {
    return (
      <Container className={styles.state} component="section" size="sm">
        <Alert color="red" title="Не удалось проверить авторизацию">
          <Stack gap="md">
            <Text>Сервис временно недоступен. Повторите проверку.</Text>
            <Button onClick={handleRetry} variant="light">
              Повторить
            </Button>
          </Stack>
        </Alert>
      </Container>
    )
  }

  if (currentSession.isLoading || currentSession.data === undefined) {
    return (
      <Center className={styles.state} component="section">
        <Stack align="center" gap="md">
          <Loader color="indigo" />
          <Title order={1} size="h3">
            Проверяем сессию
          </Title>
        </Stack>
      </Center>
    )
  }

  if (currentSession.data === null) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`

    return <Navigate replace state={{ returnTo }} to="/sign-in" />
  }

  return <Outlet />
}
