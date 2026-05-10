# Nanoboost Admin Panel

Внутренняя админ-панель Nanoboost. React 19 + Vite + CSS Modules.
Без TypeScript, без Tailwind. Все UI-тексты на русском.

## Стек

- React 19 + Vite 7 (JS / JSX)
- React Router v7
- TanStack Query v5 (server state) + TanStack Table v8 (таблицы)
- Zustand v5 (client state, с `persist` для токенов)
- Radix UI primitives + lucide-react (иконки)
- React Hook Form + Yup (валидация форм)
- Axios (HTTP-клиент с auto refresh)
- CSS Modules (camelCase) + дизайн-токены в `src/styles/tokens.css`

## Запуск

```bash
cp .env.example .env       # настроить VITE_API_URL
npm install
npm run dev                # http://localhost:5173
```

## Скрипты

| Команда           | Описание                          |
| ----------------- | --------------------------------- |
| `npm run dev`     | dev-сервер на 5173                |
| `npm run build`   | production-сборка в `dist/`       |
| `npm run preview` | предпросмотр сборки               |
| `npm run lint`    | ESLint                            |
| `npm run format`  | Prettier — форматирует `src/**`   |

## Переменные окружения

```
VITE_API_URL=http://localhost:8000/api/v1
```

## Структура

```
src/
├── main.jsx, App.jsx, router.jsx
├── styles/         # tokens.css, reset.css, globals.css
├── lib/            # api-client.js, query-client.js, utils.js
├── components/
│   ├── ui/         # Button, Input, Card, Dialog, DropdownMenu, Select,
│   │               # Switch, Toast, Tabs, Badge, Spinner, Avatar, Label
│   ├── layout/     # AppLayout, Sidebar, Header, ProtectedRoute
│   └── shared/     # EmptyState, LoadingSkeleton, ConfirmDialog
├── features/auth/  # pages, components, hooks, services, stores
├── pages/          # Dashboard, Games, Services, Orders, Clients, Reviews, NotFound
└── locales/ru.js   # все ru-тексты
```

## API контракт (auth)

Frontend ожидает от backend:

- `POST /auth/login` → `{ access_token, refresh_token, user }` (snake_case;
  camelCase тоже принимается)
- `POST /auth/refresh` body `{ refresh_token }` → `{ access_token, refresh_token? }`
- `GET /auth/me` (Bearer) → `{ id, email, name?, ... }`
- `POST /auth/logout` (Bearer, опционально)

При `401` для не-auth эндпоинтов axios-интерсептор автоматически вызывает
refresh; если он тоже `401` — логаут + redirect на `/login`.

## Дизайн-система

Все цвета, отступы, радиусы, тени, шрифты — в `src/styles/tokens.css`
как CSS-переменные. Хардкоженные значения в стилях запрещены.

## Соглашения

- Файл компонента: `PascalCase.jsx` + `PascalCase.module.css`
- Хуки: `useXxx.js` (camelCase, префикс `use`)
- CSS-классы: camelCase (CSS Modules)
- Алиас: `@` → `src`
- Все UI-тексты только из `locales/ru.js`
- Без inline-стилей, без хардкоженых цветов/отступов
