# Источники данных приложения CS2 Match Analyzer

## ✅ Подключенные API

### 1. PandaScore API (Основной источник)
**Статус:** ✅ Активно  
**URL:** https://api.pandascore.co/csgo/matches  
**Токен:** Настроен (`PANDASCORE_API_TOKEN`)

**Использование:**
- Получение реальных предстоящих, live и finished матчей CS2/CS:GO
- Информация о командах с логотипами
- Результаты матчей
- Детальная информация о турнирах
- Расписание матчей

**Функции:**
- `fetchPandaScore()` - получение актуальных матчей (backend)
- `fetchCS2Matches()` - клиентская функция
- `fetchMatchDetails(matchId)` - детальная информация о матче
- `fetchTeamDetails(teamId)` - информация о команде
- `enrichMatchWithDetails(match)` - дополнительные данные

**Обновление:** Каждые 3 минуты (автоматически через React Query)

**Особенности:**
- ✅ Официальный API для киберспорта
- ✅ Реальные данные из множества источников
- ✅ Логотипы команд в высоком качестве
- ✅ Статусы матчей: not_started, running, finished
- ✅ Информация о турнирах и лигах
- ⚠️ Free tier: 1000 requests/hour (достаточно с кэшированием)

**Rate Limits & Optimization:**
- Backend кэширует результаты на 3 минуты
- Retry механизм с exponential backoff
- Timeout: 10 секунд

### 2. HLTV API (Fallback)
**Статус:** ✅ Активно  
**URL:** https://hltv-api.vercel.app/api  
**Использование:** Резервный источник если PandaScore недоступен

**Функции:**
- Получение матчей с HLTV.org
- Информация о командах и игроках
- Результаты матчей
- История встреч команд

**Обновление:** По запросу при недоступности PandaScore

**Особенности:**
- ✅ Публичный API без регистрации
- ✅ Реальные данные с HLTV.org
- ✅ Логотипы команд от HLTV
- ✅ Нет лимитов на количество запросов
- 🔄 Автоматическое переключение при сбое PandaScore

### 3. Live Score Service
**Статус:** ✅ Активно  
**Метод:** WebSocket (web) / Polling (mobile)  
**Источник:** HLTV API

**Функции:**
- Реальный счёт матчей в live режиме
- Информация о текущей карте
- Номер раунда и счёт по раундам
- Результаты по картам
- Автоматическое обновление каждые 10 секунд (polling)

**Особенности:**
- ✅ Web: WebSocket подключение для реального времени
- ✅ Mobile: Polling каждые 10 секунд
- ✅ Автоматический reconnect при сбое
- ✅ Graceful degradation

### 4. AI Deep Analysis
**Статус:** ✅ Активно  
**Источник:** Rork Toolkit SDK  
**Язык:** Русский

**Функции:**
- `generateDeepMatchAnalysis()` - комплексный анализ матча
  - 📊 История личных встреч (H2H)
  - 📈 Анализ формы команд за 3-4 недели
  - 🗺️ Маппул и анализ карт
  - 🔄 Анализ предпочитаемых сторон (CT/T)
  - 🎯 Важность турнира для команд
  - ⚡ Ключевые игроки и их форма
  - 📰 Последние новости
  - 🧠 Сценарии развития матча
  - 🔑 Ключевые факторы успеха
  - 🎲 Прогноз и рекомендации

- `generateLiveMatchPrediction()` - live прогноз
  - Актуальные вероятности победы
  - Анализ текущей ситуации
  - Рекомендации для live ставок

- `generateTeamDetailedAnalysis()` - детальный анализ команды
  - Последние 10-15 игр
  - Маппул команды
  - Статистика по сторонам (CT/T)
  - Стратегии и тактика

- `analyzeBettingOpportunity()` - анализ возможностей для ставок
  - Value bets
  - Expected Value (EV)
  - Уровень риска
  - Рекомендации по размеру ставки

**Особенности:**
- ✅ Глубокий анализ на русском языке
- ✅ Structured output с Zod схемами
- ✅ Учитывает психологию, мотивацию, усталость
- ✅ Рекомендации для букмекера BetBoom
- ✅ Оценка вероятностей и рисков

### 5. Bookmakers API
**Статус:** 🟡 Симуляция + Частичная интеграция  
**Букмекеры:**
- BetBoom (основной, симуляция)
- 1xBet (симуляция)
- Parimatch (симуляция)

**Функции:**
- `fetchBookmakerOdds()` - получение коэффициентов
- `findBestOdds()` - поиск лучших коэффициентов
- `calculateExpectedValue()` - расчет EV
- `calculateImpliedProbability()` - implied probability

**Данные:**
- Коэффициенты на победу команд
- Гандикапы по картам (+1.5, -1.5)
- Тотал карт в матче (over/under 2.5)

**Примечание:** В настоящее время коэффициенты генерируются в реалистичном диапазоне (1.5-2.5) с использованием PandaScore данных. Планируется интеграция с реальными API букмекеров.

---

## 📊 Типы данных

### Match Data
```typescript
{
  id: string;              // pandascore-{id} или hltv-{id}
  date: string;            // ISO 8601
  tournament: string;
  team1: Team;
  team2: Team;
  status: "upcoming" | "live" | "finished";
  odds: BettingOdds[];
  stats?: {
    maps?: string[];
    viewerCount?: number;
    duration?: string;
    mvp?: string;
  };
}
```

### Team Data
```typescript
{
  name: string;
  logo: string;            // URL from PandaScore or HLTV
  players: Player[];
  winRate: number;
  recentForm: ("W" | "L")[];
  score?: number;
  hltvRanking?: number;
}
```

### Match Analysis (AI)
```typescript
{
  matchId: string;
  analysisVersion: "comprehensive";
  headToHead: {
    team1Wins: number;
    team2Wins: number;
    lastMeetings: Array<{
      date: string;
      winner: string;
      score: string;
      maps: string[];
    }>;
  };
  formAnalysis: {
    team1: FormData;
    team2: FormData;
  };
  mapAnalysis: MapAnalysisData;
  tournamentImportance: ImportanceData;
  aiScenarios: Array<{
    scenario: string;
    probability: number;
    reasoning: string;
  }>;
  keyFactors: string[];
  predictedWinner: string;
  confidence: number;
  bettingRecommendations: Array<{
    recommendation: string;
    expectedValue: number;
    risk: "low" | "medium" | "high";
  }>;
}
```

---

## 🔄 Обновление данных

1. **Матчи** - каждые 3 минуты (React Query с staleTime)
2. **Live счёт** - каждые 10 секунд (Polling)
3. **Коэффициенты** - при загрузке страницы матча
4. **AI Анализ** - по запросу пользователя
5. **Детали команды** - по запросу пользователя

---

## 🛠️ Как работает система

### 1. Загрузка матчей (Backend)
```
Client Request
  ↓
tRPC: matches.all
  ↓
Backend: fetch-all route
  ↓
Promise.allSettled([
  fetchPandaScore(),  // Основной источник
  fetchHLTV()         // Fallback
])
  ↓
Merge & Deduplicate (по названиям команд)
  ↓
Sort by date
  ↓
Return unique matches
  ↓
Client receives data
```

### 2. Fallback логика
```
Try PandaScore
  ↓
Success? → Use PandaScore data
  ↓
Failed? → Try HLTV
  ↓
Success? → Use HLTV data
  ↓
Both failed? → Return empty array
  ↓
Frontend shows "No matches" or mock data fallback
```

### 3. Live обновления
```
User opens live match
  ↓
liveScoreService.connect(matchId)
  ↓
Platform check:
  • Web → WebSocket connection
  • Mobile → Polling (10 sec)
  ↓
Fetch from HLTV API
  ↓
Update UI in real-time
  ↓
On match finish → Stop updates
```

### 4. AI Анализ
```
User clicks "Полный анализ"
  ↓
AIAnalysisContext.analyzeMatch()
  ↓
generateDeepMatchAnalysis(match)
  ↓
Rork Toolkit SDK (AI)
  ↓
Structured output (Zod)
  ↓
Display in UI with sections:
  • H2H
  • Form Analysis
  • Map Analysis
  • Tournament Importance
  • AI Scenarios
  • Key Factors
  • Predictions
  • Betting Recommendations
```

---

## 🚀 Архитектура данных

### Backend (Hono + tRPC)
```
backend/trpc/routes/matches/fetch-all/route.ts
  ├── fetchPandaScore()
  │   ├── API: https://api.pandascore.co/csgo/matches
  │   ├── Headers: Authorization Bearer token
  │   ├── Params: sort, per_page, page
  │   └── Timeout: 10s
  │
  ├── fetchHLTV()
  │   ├── API: https://hltv-api.vercel.app/api/matches.json
  │   ├── Headers: Accept, User-Agent
  │   └── Timeout: 10s
  │
  └── Response: Match[]
```

### Frontend (React Native + Expo)
```
contexts/MatchesContext.tsx
  ├── trpc.matches.all.useQuery()
  │   ├── staleTime: 30s
  │   ├── refetchInterval: 3min (if backend available)
  │   └── retry: 1
  │
  ├── State: matches, backendAvailable
  ├── Filters: all, upcoming, live, finished
  └── Functions: getMatchById, getMatchAnalysis, refetch
```

---

## 📈 Статус API

| Сервис | Статус | Обновление | URL | Rate Limit |
|--------|--------|------------|-----|------------|
| PandaScore Matches | ✅ Работает | 3 мин | https://api.pandascore.co/csgo/matches | 1000/hour |
| HLTV Matches | ✅ Работает | Fallback | https://hltv-api.vercel.app/api/matches.json | Нет |
| HLTV Match Details | ✅ Работает | По запросу | https://hltv-api.vercel.app/api/match/{id}.json | Нет |
| Live Score Service | ✅ Работает | 10 сек | HLTV Match Details API | Нет |
| AI Analysis | ✅ Работает | По запросу | Rork AI Toolkit | Fair use |
| Bookmaker Odds | 🟡 Симуляция | По запросу | Локальная генерация | N/A |

---

## 🔍 Проверка работы API

### Console Logs
Откройте консоль браузера/Metro и найдите логи:

**Backend:**
- `[Backend] 🔍 Trying PandaScore API...` - запрос к PandaScore
- `[Backend] ✅ PandaScore: X matches` - успешная загрузка
- `[Backend] ❌ PandaScore failed` - ошибка PandaScore
- `[Backend] 🔍 Trying HLTV API...` - fallback на HLTV
- `[Backend] ✅ HLTV: X matches` - успешная загрузка HLTV
- `[Backend] ✅ Total unique matches: X` - итоговое количество

**Frontend:**
- `[MatchesContext] 🔍 Checking backend availability...` - проверка backend
- `[MatchesContext] ✅ Backend available - using real matches: X` - успех
- `[MatchesContext] ⚠️ Backend not available - using mock data` - fallback
- `[MatchesContext] 🔄 Updating matches from backend: X` - обновление

**Live Updates:**
- `[LiveScore] Connecting to match X` - подключение
- `[LiveScore] 🔍 Fetching live score for match X...` - запрос
- `[LiveScore] 📊 Received match data for X` - получено

**AI Analysis:**
- `[AI Deep Analysis] 🧠 Starting comprehensive analysis...` - начало анализа
- `[AI Deep Analysis] ✅ Analysis complete` - анализ завершен

### Успешные запросы
```
[Backend] 🚀 START: Fetching matches from multiple sources...
[Backend] 🔍 Trying PandaScore API...
[Backend] ✅ PandaScore: 45 matches
[Backend] 🔍 Trying HLTV API...
[Backend] ✅ HLTV: 32 matches
[Backend] ✅ Total unique matches: 65
[Backend] 📋 Status breakdown: upcoming=30, live=5, finished=30
[Backend] ✅ END: Returning matches array

[MatchesContext] 🔍 Checking backend availability...
[MatchesContext] ✅ Backend available - using real matches: 65
```

---

## 📝 Примечания

### Работа с данными
- ✅ Реальные данные из PandaScore и HLTV
- ✅ Автоматический fallback при недоступности основного источника
- ✅ Deduplication матчей (по названиям команд)
- ✅ Сортировка по дате
- ✅ Mock данные только если backend недоступен

### Оптимизация
- ✅ Backend кэширует результаты
- ✅ Frontend кэширует через React Query (staleTime: 30s)
- ✅ Retry механизм с timeout
- ✅ Одновременные запросы к нескольким источникам (Promise.allSettled)
- ✅ Graceful degradation при ошибках

### Мониторинг
- 📊 Все запросы логируются
- 🔍 Легко отследить источник данных
- ⚡ Показатели производительности в логах
- 🐛 Детальные сообщения об ошибках

---

## 🆘 Troubleshooting

### Нет матчей
1. Проверить backend health: `https://cs2-match-data-collector.onrender.com/api/health`
2. Проверить логи backend на Render
3. Проверить PandaScore API токен
4. Проверить HLTV API доступность
5. Cold start может занять 30-60 секунд

### Backend недоступен
1. Render free tier "засыпает" после 15 минут неактивности
2. Первый запрос после сна занимает 30-60 секунд
3. Проверить статус сервиса на Render.com
4. Проверить Environment Variables
5. Перезапустить сервис (Manual Deploy)

### AI анализ не работает
1. Проверить интернет соединение
2. Проверить Rork Toolkit SDK доступность
3. Проверить логи в консоли
4. Попробовать другой матч

---

## 🎯 Итоговая картина

**Источники данных:**
1. 🥇 PandaScore - основной источник (1000 req/hour)
2. 🥈 HLTV - резервный источник (no limits)
3. 🤖 Rork AI - анализ и прогнозы
4. 🎲 Bookmakers - коэффициенты (симуляция)

**Обновления:**
- Матчи: каждые 3 минуты
- Live: каждые 10 секунд
- AI: по запросу

**Качество данных:**
- ✅ Реальные матчи
- ✅ Реальные команды
- ✅ Реальные турниры
- ✅ Реальный счет (live)
- 🟡 Симуляция коэффициентов (планируется интеграция)

**Надежность:**
- ✅ Множественные источники
- ✅ Автоматический fallback
- ✅ Retry механизм
- ✅ Graceful degradation
- ✅ Comprehensive logging

Приложение готово к использованию с реальными данными! 🚀
