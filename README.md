# Real Estate Service

Сервис объявлений о недвижимости: React-форма с Formik/Yup и backend для сканирования объявлений Авито через Selenium Grid и RabbitMQ.

## Структура

```
├── frontend/     # React + TypeScript + Formik + Yup + Chakra UI
├── backend/      # FastAPI, эндпоинт POST /browse
├── consumer/     # Python consumer (Selenium + RabbitMQ)
└── docker-compose.yml
```

## Быстрый старт

### Backend (Docker)

```powershell
docker compose up -d --build
```

Публичный порт: **8000** (только API). RabbitMQ, Selenium Grid и consumer доступны только внутри docker-сети.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Приложение: http://localhost:5173

---

## Часть 1. Frontend

### Привязка полей к Formik

Хук `useFormField(name)` автоматически подключает любой инпут к контексту Formik — не нужно вручную прописывать `onChange` / `onBlur` для каждого поля:

```tsx
const field = useFormField<string>('name');

<Input
  name={field.name}
  value={field.value ?? ''}
  onChange={field.onChange}
  onBlur={field.onBlur}
/>
```

Готовые компоненты `FormTextInput`, `FormNumberInput`, `FormRadio`, `FormCheckbox` используют этот хук — для добавления поля достаточно указать `name` и `label`:

```tsx
<FormTextInput name="name" label="Название объекта" />
<FormRadio name="propertyType" label="Тип" options={options} />
<FormCheckbox name="hasBalcony" label="Есть балкон" />
```

### Валидация Yup

- Глобальные тексты ошибок для `required`, `min`, `max` заданы через `Yup.setLocale`
- Локальное правило для площади через кастомный метод `moreThanSumOfFields`:

```ts
Yup.number().moreThanSumOfFields(
  ['kitchenSquare', 'livingSquare'],
  'Общая площадь должна быть больше суммы жилой площади и площади кухни',
)
```

---

## Часть 2. Backend + инфраструктура

### Как это работает

```
Клиент  →  POST /browse  →  FastAPI  →  RabbitMQ  →  Consumer  →  Selenium Grid  →  LOG (HTML)
```

1. API принимает URL и кладёт задачу в очередь `browse_tasks`
2. Consumer забирает задачу из RabbitMQ
3. Selenium Grid открывает страницу в headless Chrome
4. HTML страницы выводится в лог consumer

### Эндпоинт

```http
POST /browse
Content-Type: application/json

{
  "url": "https://www.avito.ru/..."
}
```

Ответ `202 Accepted` — задача поставлена в очередь RabbitMQ.

### Проверка (PowerShell)

```powershell
# Healthcheck
Invoke-RestMethod http://localhost:8000/health

# Отправить задачу на сканирование
Invoke-RestMethod `
  -Uri http://localhost:8000/browse `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"url":"https://www.avito.ru/moskva/kvartiry/test"}'

# Посмотреть HTML в логах
docker compose logs -f consumer
```

### Проверка (bash / curl)

```bash
curl http://localhost:8000/health

curl -X POST http://localhost:8000/browse \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.avito.ru/moskva/kvartiry/test"}'

docker compose logs -f consumer
```

---

## Технологии

| Слой | Стек |
|------|------|
| Frontend | React, TypeScript, Formik, Yup, Chakra UI, Vite |
| Backend | FastAPI, Pika (RabbitMQ) |
| Consumer | Python, Selenium, RabbitMQ |
| Infra | Docker Compose, Selenium Grid, RabbitMQ |
