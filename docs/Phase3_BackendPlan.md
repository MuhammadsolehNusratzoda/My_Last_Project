# TouristSystem — План реализации ядра Backend-а (Фаза 3)

Этот документ детально описывает планирование, архитектуру проектов, устройство слоев, соглашения по API и пошаговую дорожную карту разработки Backend-части платформы **TouristSystem** на платформе .NET 9.

---

## 1. Цель Фазы 3 (Phase 3 Goal)
Цель этой фазы — детально спланировать и задокументировать структуру проектов решения (Solution), зависимости между слоями, контракты интерфейсов, устройство бизнес-сценариев (CQRS с MediatR), правила валидации, настройки безопасности API и составить дорожную карту разработки.
В этой фазе **код проектов, файлов C# и конфигураций не пишется**. Допускается только проектирование.

---

## 2. Структура решения Backend (Backend Solution Structure)

Проект создается как стандартный .NET Solution (`TouristSystem.sln`), содержащий 4 проекта, разделенных по принципам Clean Architecture.

```
[TouristSystem.WebApi] (API & Middlewares)
         │
         ▼
[TouristSystem.Infrastructure] (Data, Auth, Providers) ──► [TouristSystem.Application] (Use Cases, CQRS)
         │                                                            │
         ▼                                                            ▼
   ───────────────────────────────────────────────────────────────────────
                                     │
                                     ▼
                        [TouristSystem.Domain] (Core Entities)
```

### Проекты и их зависимости:
1.  **TouristSystem.Domain (Class Library):**
    *   *Зависимости:* Нет. Абсолютно чистая библиотека.
    *   *Назначение:* Содержит ядро предметной области.
2.  **TouristSystem.Application (Class Library):**
    *   *Зависимости:* Ссылается на `TouristSystem.Domain`.
    *   *Назначение:* Бизнес-сценарии приложения. Содержит логику, посредников (MediatR), обработчики запросов, DTO-модели.
3.  **TouristSystem.Infrastructure (Class Library):**
    *   *Зависимости:* Ссылается на `TouristSystem.Application` (и косвенно на `Domain`).
    *   *Назначение:* Внешние ресурсы. Реализация баз данных (EF Core), внешних API, провайдеров JWT и хэширования.
4.  **TouristSystem.WebApi (Web API):**
    *   *Зависимости:* Ссылается на `TouristSystem.Infrastructure` и `TouristSystem.Application`.
    *   *Назначение:* Точка входа в приложение (Презентационный слой). Настройка DI, эндпоинтов, middlewares и фильтров авторизации.

---

## 3. Проектирование слоев решения (Layer-by-Layer Design)

### 3.1. Слой TouristSystem.Domain (Домен)
Этот слой — сердце приложения. Он описывает сущности и правила реального мира.

*   **Базовые классы (Common):**
    *   `BaseEntity`: Абстрактный класс, содержащий `Guid Id` и список доменных событий `List<IDomainEvent> _domainEvents` (для асинхронных уведомлений между модулями).
    *   `AuditableEntity : BaseEntity`: Расширяет базовую сущность полями аудита (`CreatedAt`, `CreatedByUserId`, `UpdatedAt`, `UpdatedByUserId`, `DeletedAt`, `DeletedByUserId`, `IsDeleted`).
*   **Сущности (Entities):**
    `User`, `RefreshToken`, `Place`, `Hotel`, `Restaurant`, `Transport`, `Guide`, `Booking`, `Review`, `Favorite`, `Notification`, `AuditLog`.
*   **Enums (Перечисления):**
    Определяют типы ролей, статусы бронирования, типы транспорта и т.д. (см. Раздел 4 Фазы 2).
*   **Интерфейсы репозиториев (Repository Contracts):**
    Интерфейсы для доступа к данным, например:
    ```csharp
    public interface IUserRepository {
        Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task AddAsync(User user, CancellationToken cancellationToken = default);
        void Update(User user);
    }
    ```
    *Важное правило:* Domain определяет контракты (интерфейсы) получения данных, но **не знает**, как они работают. Их реализация находится в Infrastructure.

---

### 3.2. Слой TouristSystem.Application (Приложение)
Этот слой оркестрирует выполнение задач. Мы используем шаблон **CQRS** (Command Query Responsibility Segregation) с библиотекой **MediatR**.

*   **Разделение на команды и запросы:**
    *   `Commands` (Команды): операции, изменяющие состояние (например, `CreateBookingCommand`, `UpdateUserRoleCommand`). Возвращают объект результата `Result<T>` или `Result`.
    *   `Queries` (Запросы): операции чтения данных (например, `GetHotelByIdQuery`, `SearchPlacesQuery`). Возвращают DTO.
*   **DTOs (Data Transfer Objects):**
    Специализированные плоские классы данных для обмена информацией между API и клиентом. 
    Примеры: `UserResponseDto`, `PlaceListDto`, `BookingDetailDto`.
*   **Валидация (FluentValidation):**
    Для каждого класса-команды создается валидатор (наследник `AbstractValidator<T>`).
    Пример: `CreateBookingCommandValidator` проверяет, что `StartDate` меньше `EndDate` и `GuestsCount > 0`. Валидация выполняется автоматически с помощью MediatR Pipeline Behavior.
*   **Маппинг (AutoMapper):**
    Конфигурации `Profile` для автоматической сборки DTO из сущностей домена без ручного копирования свойств.
*   **Общие модели ответов (Common Models):**
    *   `Result` и `Result<T>`: Шаблон Result Pattern, показывающий успех или неудачу выполнения бизнес-операции без выбрасывания дорогостоящих Exception.
    *   `PagedResult<T>`: Стандартизированный ответ для списков с пагинацией:
        ```csharp
        public class PagedResult<T> {
            public IReadOnlyCollection<T> Items { get; }
            public int PageNumber { get; }
            public int PageSize { get; }
            public int TotalCount { get; }
            public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
        }
        ```
    *   `PaginationRequest` и `FilterRequest`: Базовые классы для фильтрации и пагинации списков.

---

### 3.3. Слой TouristSystem.Infrastructure (Инфраструктура)
Реализует интерфейсы из слоев Application и Domain, связывая приложение с внешним миром.

*   **База данных (DbContext & EF Core):**
    *   `ApplicationDbContext : DbContext` — основная точка подключения к PostgreSQL.
    *   Конфигурации Fluent API выносятся в отдельные классы `IEntityTypeConfiguration<T>` для чистоты кода.
    *   Глобальные фильтры `HasQueryFilter(e => !e.IsDeleted)` настраиваются для автоматического исключения мягко удаленных записей.
    *   Переопределенный метод `SaveChangesAsync` автоматически заполняет даты создания и изменения, используя информацию о текущем пользователе.
*   **Репозитории (Repositories):**
    Конкретная реализация интерфейсов из Domain с использованием EF Core (например, `UserRepository`, `BookingRepository`).
*   **Аутентификация (JWT & Security):**
    *   `JwtProvider`: сервис генерации JWT токенов (Access Token) на основе конфигураций из `appsettings.json`.
    *   `PasswordHasher`: сервис для безопасного хэширования паролей пользователей с использованием алгоритма `BCrypt` или `PBKDF2` (не MD5/SHA1!).
*   **Заглушки сервисов (Service Placeholders):**
    *   `EmailService`: отправляет письма (верификация почты, уведомления о бронированиях). На первом этапе логирует отправку в консоль, в будущем подключается SMTP или SendGrid.
    *   `StorageService`: загружает изображения мест и отелей. На первом этапе сохраняет файлы в локальную папку API (внутри Workspace), в будущем переключается на AWS S3 или Azure Blob Storage.

---

### 3.4. Слой TouristSystem.WebApi (API презентации)
Слой отвечает за прием HTTP-запросов и возврат ответов.

*   **Контроллеры (Controllers):**
    Тонкие классы-контроллеры, которые принимают HTTP-запрос, валидируют DTO, передают его в MediatR и возвращают результат. Вся бизнес-логика выполняется в обработчиках MediatR.
*   **Middlewares (Промежуточное ПО):**
    *   `ExceptionHandlingMiddleware`: Глобальный перехватчик ошибок. Логирует исключение и возвращает стандартизированный ответ RFC 7807 (ProblemDetails).
    *   `RequestLoggingMiddleware`: Логирует входящие запросы (URL, метод, тело) для аудита производительности.
*   **Настройки Swagger / OpenAPI:**
    Настраивается генерация Swagger-документации, включая поддержку авторизации через заголовок `Authorization: Bearer <token>`.
*   **CORS (Cross-Origin Resource Sharing):**
    Разрешает запросы от фронтенда (например, `http://localhost:3000`), блокируя неавторизованные источники.
*   **Health Checks:**
    Эндпоинт `/health` проверяет доступность базы данных PostgreSQL и дискового пространства, что необходимо для мониторинга в контейнерах.

---

## 4. Соглашения по API (API Specifications)

### Стандарт ответа (API Response Standard)
Все ответы API имеют единый облик:
```csharp
public class ApiResponse<T> {
    public bool Success { get; set; }
    public string Message { get; set; }
    public T Data { get; set; }
    public List<ValidationError> Errors { get; set; }
    public int StatusCode { get; set; }
}
```

### Группы Эндпоинтов (Endpoint Groups)
1.  **Auth (`/api/auth`):**
    *   `POST /register` — Регистрация туриста.
    *   `POST /login` — Аутентификация, получение Access токена и запись Refresh токена в HttpOnly cookie.
    *   `POST /refresh-token` — Ротация JWT токенов.
    *   `POST /logout` — Отзыв сессии Refresh токена.
2.  **Users (`/api/users`):**
    *   `GET /me` — Данные текущего авторизованного пользователя.
    *   `PUT /profile` — Изменение личной информации (имя, телефон).
    *   `PUT /change-password` — Смена пароля.
3.  **Places (`/api/places`):**
    *   `GET /` — Получить список мест (с пагинацией, фильтрацией по городу, поиском по названию).
    *   `GET /{id}` — Детали места по ID или `slug`.
    *   `POST /` — Добавить новое место (модераторы/админы).
    *   `PUT /{id}` — Редактирование места.
    *   `DELETE /{id}` — Мягкое удаление места.
4.  **Hotels (`/api/hotels`):**
    *   `GET /` — Поиск отелей по фильтрам (город, цены, звезды, доступность).
    *   `GET /{id}` — Детали отеля и список свободных номеров.
    *   `POST /` — Создать отель (`HotelOwner`).
    *   `PUT /{id}` — Обновить отель.
5.  **Restaurants (`/api/restaurants`):**
    *   `GET /` — Список ресторанов с фильтром по типу кухни и цене.
    *   `POST /` — Создать ресторан (`RestaurantOwner`).
6.  **Transports (`/api/transports`):**
    *   `GET /` — Поиск рейсов (Откуда -> Куда -> Когда).
    *   `POST /` — Создать рейс транспорта (`TransportOwner`).
7.  **Guides (`/api/guides`):**
    *   `GET /` — Список гидов с фильтром по цене и опыту.
    *   `POST /profile` — Создать профиль гида (`Guide`).
8.  **Bookings (`/api/bookings`):**
    *   `GET /my` — История бронирований текущего пользователя.
    *   `POST /` — Создать новое бронирование (Hotel, Guide, Transport).
    *   `POST /{id}/confirm` — Подтвердить бронь (владелец услуги).
    *   `POST /{id}/cancel` — Отменить бронь.
9.  **Reviews (`/api/reviews`):**
    *   `POST /` — Оставить отзыв об объекте (турист).
    *   `DELETE /{id}` — Удалить отзыв (администратор).
10. **Admin (`/api/admin`):**
    *   `GET /stats` — Общая статистика для дашборда.
    *   `GET /audit-logs` — Просмотр логов безопасности (только SuperAdmin).
    *   `POST /verify-business` — Верификация профилей бизнеса/гидов.

### Правила безопасности эндпоинтов (Security Access Levels)
*   **Public Endpoints:** Просмотр мест (`/api/places`), отелей, ресторанов, рейсов транспорта, гидов и отзывов. Доступны гостям без авторизации.
*   **Authenticated Endpoints:** Личный кабинет (`/api/users/me`), создание бронирования, добавление в избранное, написание отзыва. Доступны всем авторизованным пользователям.
*   **Owner-only Endpoints:** Создание, обновление отелей, ресторанов, транспорта, подтверждение бронирований своих услуг. Доступно пользователям с ролями `HotelOwner`, `RestaurantOwner`, `TransportOwner` и `Guide`.
*   **Admin-only Endpoints:** Модерация, блокировка пользователей, просмотр логов аудита. Доступно ролям `Admin` и `SuperAdmin`.

---

## 5. Пошаговая дорожная карта Backend (Implementation Roadmap)

Разработка Backend будет вестись по следующим микро-шагам:

1.  **Шаг 1: Инициализация Solution.**
    Создание структуры папок и 4 проектов через .NET CLI. Настройка ссылок между проектами. Установка необходимых NuGet пакетов (MediatR, Serilog, FluentValidation, AutoMapper, EF Core Npgsql).
2.  **Шаг 2: Создание ядра Domain.**
    Определение базовых сущностей `BaseEntity`, `AuditableEntity`. Описание всех сущностей и перечислений (Enums) в проекте `TouristSystem.Domain`. Определение контрактов репозиториев.
3.  **Шаг 3: Настройка инфраструктуры данных.**
    Написание `ApplicationDbContext`. Описание конфигураций Fluent API для связи один-ко-многим и один-к-одному. Создание начальной миграции базы данных PostgreSQL и настройка Seed данных (базовые роли и системный аккаунт администратора).
4.  **Шаг 4: Реализация авторизации (Authentication Module).**
    Написание логики хэширования паролей, генерации JWT Access и Refresh токенов. Реализация обработчиков MediatR для `RegisterCommand` и `LoginCommand`. Создание контроллера авторизации.
5.  **Шаг 5: Реализация бизнес-логики (Feature by Feature).**
    Последовательная реализация вертикальных CQRS слайсов:
    *   Модуль Places (Места)
    *   Модули Hotels, Restaurants, Transports, Guides (Каталоги услуг)
    *   Модуль Bookings (Создание бронирований, расчет цены, смена статуса)
    *   Модуль Reviews и Favorites
6.  **Шаг 6: Глобальные сервисы и полировка.**
    Настройка глобального логирования (Serilog), middlewares обработки ошибок, Swagger с поддержкой JWT заголовка, Health Checks и CORS политик.

---

## 6. Финальный чек-лист планирования (Final Backend Checklist)
- [x] Спроектирована архитектура решения на .NET 9 из 4 связанных проектов.
- [x] Определена ответственность каждого проекта.
- [x] Описана структура CQRS с помощью MediatR, FluentValidation и AutoMapper.
- [x] Запланировано устройство инфраструктурного слоя (EF Core, JWT, Hashing).
- [x] Разработан единый стандарт ответов `ApiResponse` и обработки ошибок.
- [x] Распределены группы эндпоинтов по уровням безопасности (Public, Auth, Owner, Admin).
- [x] Создана детальная пошаговая дорожная карта backend-разработки.
