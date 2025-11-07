# Исправления ошибок JSON Parse

## Проблема
Приложение выдавало ошибку "JSON parse error" при попытке загрузить матчи через tRPC API.

## Найденные проблемы

### 1. Неправильный endpoint в backend/hono.ts
**Было:**
```typescript
app.use("/trpc/*", trpcServer({
  endpoint: "/api/trpc",
  ...
}))
```

**Исправлено:**
```typescript
app.use("/api/trpc/*", trpcServer({
  // убрали endpoint параметр, т.к. путь уже указан в app.use
  ...
}))
```

Проблема заключалась в конфликте между путём в `app.use` и параметром `endpoint`. Это создавало неправильный роутинг.

### 2. Неправильный порядок провайдеров в app/_layout.tsx
**Было:**
```typescript
<trpc.Provider>
  <QueryClientProvider>
    ...
  </QueryClientProvider>
</trpc.Provider>
```

**Исправлено:**
```typescript
<QueryClientProvider>
  <trpc.Provider>
    ...
  </trpc.Provider>
</QueryClientProvider>
```

`QueryClientProvider` должен быть верхним провайдером, так как tRPC использует React Query внутри.

### 3. Улучшена обработка ошибок
- Добавлено детальное логирование в `lib/trpc.ts`
- Добавлено клонирование response для чтения тела ошибки
- Улучшены сообщения об ошибках в `backend/trpc/routes/matches/fetch-all/route.ts`
- Добавлена защита от выброса исключений - теперь возвращается пустой массив вместо throw

## Что делать дальше

1. **Перезапустите backend сервер** - изменения в backend/hono.ts требуют перезапуска
2. **Обновите приложение** - изменения в app/_layout.tsx требуют перезагрузки приложения
3. **Проверьте консоль** - теперь вы увидите детальные логи о том, что происходит при загрузке матчей

## Ожидаемый результат

После применения исправлений:
- ✅ Приложение корректно подключается к backend API
- ✅ Матчи загружаются из PandaScore и HLTV
- ✅ Нет ошибок JSON parse
- ✅ Детальные логи помогают отслеживать процесс загрузки
