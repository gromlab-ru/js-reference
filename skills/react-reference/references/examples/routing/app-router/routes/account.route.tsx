import { Navigate } from 'react-router-dom'

import { useGetCurrentUser } from '@/domains/authentication'

/**
 * Отображает аккаунт только после разрешения текущей auth identity.
 */
const AccountRoute = () => {
  const currentUser = useGetCurrentUser()

  if (currentUser.isLoading) {
    return <main aria-busy="true">Проверяем сессию</main>
  }

  if (currentUser.defect !== undefined) {
    throw currentUser.defect
  }

  if (currentUser.error !== undefined) {
    return <main>Сервис аккаунта временно недоступен</main>
  }

  if (currentUser.data === null) {
    return <Navigate replace to="/sign-in" />
  }

  return (
    <main>
      <h1>Аккаунт</h1>
      <p>{currentUser.data?.displayName}</p>
    </main>
  )
}

export { AccountRoute as Component }
