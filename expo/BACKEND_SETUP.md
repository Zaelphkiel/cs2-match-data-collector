# Backend Setup для получения реальных матчей CS2

## Что было сделано

Теперь ваше приложение использует **backend-сервер** для получения реальных данных о матчах CS2, обходя CORS ограничения браузера.

## Архитектура

### Backend API (tRPC)

Созданы 3 эндпоинта для получения данных:

1. **`trpc.matches.fetch`** - Получение матчей с PandaScore API
   - Источник: https://api.pandascore.co/csgo/matches
   - Возвращает актуальные матчи CS2

2. **`trpc.matches.hltv`** - Получение матчей с HLTV API
   - Источник: https://hltv-api.vercel.app/api/matches.json
   - Возвращает матчи с популярного CS2 ресурса

3. **`trpc.matches.all`** - Комбинированный метод (используется в приложении)
   - Получает данные из всех источников параллельно
   - Объединяет и дедуплицирует матчи
   - Возвращает максимальное количество актуальных матчей

### Frontend

**MatchesContext** (`contexts/MatchesContext.tsx`) использует backend API через tRPC:
- Автоматическое обновление каждые 3 минуты
- Retry логика при ошибках
- Фильтрация матчей по статусу (upcoming/live/finished)

## Как это работает

### 1. Backend обходит CORS

```
Frontend (React Native Web)
    ↓
Backend Server (Hono + tRPC)
    ↓
External APIs (PandaScore, HLTV)
```

Вместо прямых запросов из браузера, которые блокируются CORS, frontend обращается к вашему backend серверу, который делает запросы к внешним API.

### 2. Множественные источники данных

Backend пытается получить данные из нескольких источников одновременно:
- **PandaScore** - профессиональный API для киберспорта
- **HLTV** - популярный CS2 ресурс

Если один источник недоступен, используются данные из другого.

### 3. Автоматическое обновление

Приложение автоматически обновляет список матчей:
- Каждые 3 минуты (для live матчей)
- При нажатии кнопки обновления
- При возврате в приложение

## Файлы

### Backend
- `backend/trpc/routes/matches/fetch-matches/route.ts` - PandaScore API
- `backend/trpc/routes/matches/fetch-hltv/route.ts` - HLTV API
- `backend/trpc/routes/matches/fetch-all/route.ts` - Комбинированный метод
- `backend/trpc/app-router.ts` - Роутер tRPC

### Frontend
- `contexts/MatchesContext.tsx` - Контекст для управления матчами
- `app/(tabs)/index.tsx` - Главная страница со списком матчей
- `lib/trpc.ts` - Клиент tRPC

## Возможные проблемы и решения

### Проблема: "No matches available"

**Решение:**
1. Проверьте интернет-соединение
2. Проверьте, запущен ли backend сервер
3. Попробуйте обновить данные кнопкой ⟳

### Проблема: "Failed to fetch"

**Причины:**
- Backend сервер не запущен
- Нет интернет-соединения
- API источники временно недоступны

**Решение:**
1. Убедитесь, что backend запущен
2. Проверьте интернет-соединение
3. Подождите несколько минут и обновите

### Проблема: API токен истек (PandaScore)

**Решение:**
Если токен PandaScore истек, получите новый на https://pandascore.co/
и замените его в файле `backend/trpc/routes/matches/fetch-matches/route.ts`:

```typescript
const token = "YOUR_NEW_TOKEN_HERE";
```

## Дальнейшие улучшения

Для получения более детального анализа матчей можно добавить:

1. **AI анализ** - Использовать AI для анализа статистики команд
2. **Live обновления** - WebSocket для real-time обновлений
3. **Расширенная статистика** - Получение детальной информации о командах
4. **Кэширование** - Сохранение данных для офлайн режима

## Источники данных

### PandaScore
- Профессиональный API для киберспорта
- Поддержка multiple игр
- Официальная документация: https://developers.pandascore.co/

### HLTV
- Крупнейший CS2 ресурс
- Неофициальный API: https://github.com/dajk/hltv-api
- Публичный эндпоинт: https://hltv-api.vercel.app/

## Технологии

- **Backend**: Hono + tRPC
- **Frontend**: React Native + React Query
- **Data sources**: PandaScore API, HLTV API
- **State management**: React Context + TanStack Query
