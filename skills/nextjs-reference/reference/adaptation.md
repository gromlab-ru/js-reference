# Что меняется относительно React SPA

Этот документ объясняет выбор профиля. Нормативный порядок работы находится в документах соответствующих областей.

| Исходный подход React SPA | Решение для Next.js App Router | Владелец правила |
| --- | --- | --- |
| Vite, `index.html`, `createRoot` | Next.js запускает React; документ собирает корневой `layout.tsx` | [Структура](application/structure/README.md) |
| React Router, `Outlet`, таблица маршрутов | Файлы `page.tsx`, `layout.tsx`, `loading.tsx`; вложенное содержимое через `children` | [Маршрутизация](application/routing/README.md) |
| Экран подключается непосредственно роутером | `page.tsx` является обязательным адаптером URL к серверному экрану | [Страницы](application/pages/README.md) |
| `index.ts` и `lazy.ts` | `index.ts`, `server.ts`, `client.ts`, `browser.ts`; маршруты разделяет сам Next.js | [Архитектура](application/architecture/README.md) |
| Всё приложение работает в браузере | RSC, SSR клиентских компонентов и браузерные эффекты — разные условия выполнения | [SSR](application/rendering/README.md) |
| SWR для каждого отображаемого GET | Первое чтение на сервере; SWR только при клиентском обновлении | [Данные](application/data-fetching/README.md) |
| Единственный клиентский кеш | Отдельные области: React `cache`, серверный кеш Next.js, Router Cache и SWR | [Кеширование](application/data-fetching/caching.md) |
| Клиентская изменяющая операция | Server Action для действия интерфейса; Route Handler для HTTP-контракта | [Изменение данных](application/data-fetching/mutations.md) |
| Браузерный токен и `AuthGuard` | Серверная сессия, проверка каждой защищённой операции, безопасное представление сессии для UI | [Авторизация](application/authentication/README.md) |
| Общее хранилище Zustand на уровне модуля | Фабрика и экземпляр в области Provider, одинаковые начальные данные SSR и браузера | [Состояние](application/state-management/README.md) |
| `useForm` для любой формы | `useForm` для интерактивных форм; нативная Server Action-форма при требовании отправки без JavaScript | [Формы](application/forms/README.md) |
| Тема и общие стили подключаются при запуске SPA | Клиентский Provider темы и однократный импорт CSS в корневом серверном layout | [Mantine](libraries/mantine.md) |
| Спрайт `react@vite` | Точный `next@app/turbopack` или `next@app/webpack`; иконка совместима с RSC | [Спрайты](libraries/svg-sprites.md) |
| MSW в браузере покрывает загрузку экрана | SSR требует серверной имитации API; браузерный worker не перехватывает запросы Next.js | [Имитация API](application/data-fetching/realtime-and-mocking.md) |
| Проверка браузерной SPA | Производственная сборка, прямой URL, серверный HTML, гидратация и изоляция двух сессий | [Качество](application/quality/README.md) |

Владение ответственностью, предметные адаптеры, закрытая реализация юнитов, колокация, CSS Modules и каноны кода
сохраняются. Ни серверный файл, ни Server Action сами по себе не создают новый архитектурный слой.
