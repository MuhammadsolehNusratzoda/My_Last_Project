# TouristSystem — Проектирование базы данных и Доменной модели (Фаза 2)

Этот документ содержит полное описание схемы базы данных (PostgreSQL), перечислений, стратегий индексации, ограничений, аудита и правил доменной модели проекта **TouristSystem**. Документ разработан с учетом возможности легкого понимания Junior-разработчиками и представляет собой прочную основу для реализации backend-слоя.

---

## 1. Цель Фазы 2 (Phase 2 Goal)
Цель этой фазы — спроектировать надежную, масштабируемую, нормализованную реляционную базу данных на PostgreSQL и доменные сущности (Domain Entities) для бизнес-логики TouristSystem. Хорошая база данных — это фундамент проекта. Ошибки проектирования БД на этом этапе приведут к серьезным проблемам поддержки кода в будущем.
В этой фазе **код backend-а и frontend-а не пишется, SQL-скрипты не генерируются**. Допускается только проектирование.

---

## 2. Принципы проектирования базы данных (Database Principles)
При проектировании схемы БД мы руководствуемся следующими правилами:

1.  **PostgreSQL в качестве СУБД:** Надежная реляционная база данных с поддержкой сложных транзакций, ограничений целостности и типа данных `JSONB` для аудита.
2.  **UUID в качестве первичных ключей (Primary Keys):** Вместо автоинкрементных `BIGINT` идентификаторов мы используем `UUID` (тип данных `uuid` в PostgreSQL). Это повышает безопасность (невозможно перебрать ID в URL) и упрощает распределенную генерацию ID на стороне приложения.
3.  **Нормализация данных:** Таблицы спроектированы в Третьей нормальной форме (3NF), чтобы исключить дублирование данных и аномалии при вставке/обновлении.
4.  **Целостность связей:** Все отношения явно связаны через внешние ключи (`FOREIGN KEY`) с прописанными каскадными правилами удаления/обновления.
5.  **Индексация для высокой производительности:** Часто используемые в поиске, фильтрах и связях колонки снабжаются индексами.
6.  **Строгие ограничения (Constraints):** Все важные бизнес-правила (например, цена не может быть отрицательной, оценки от 1 до 5) дублируются на уровне базы данных через `CHECK` ограничения.
7.  **Все временные метки (Timestamps) в UTC:** Даты хранятся в формате `TIMESTAMP WITH TIME ZONE` (UTC), чтобы избежать путаницы с часовыми поясами.
8.  **Безопасный тип данных для денег:** Для цен используется тип `DECIMAL(10,2)` (или `DECIMAL(12,2)` для общего баланса/чеков). Запрещено использовать числа с плавающей точкой (`float`, `double`), так как они приводят к ошибкам округления финансовых данных.
9.  **Стратегия Soft Delete:** Физическое удаление критически важных данных запрещено. Удаление происходит через флаг `is_deleted = true`.
10. **Аудит действий:** Каждая таблица снабжена полями создания и изменения записи для отслеживания истории изменений.

> [!NOTE]
> **Почему нельзя хранить всё в одной большой таблице?**
> Хранение всех сущностей в одной таблице (например, NoSQL-стиль) приведет к избыточности (дублированию) данных (например, имя отеля будет дублироваться в каждом бронировании), аномалиям обновления (если отель сменит название, придется обновлять миллионы записей) и сильному падению производительности на больших объемах данных. Нормализованная схема решает эти проблемы.

---

## 3. Проектирование таблиц (Full Tables Design)

Схема состоит из 12 основных таблиц. Первичный ключ каждого отношения — `id UUID PRIMARY KEY`.

### 3.1. Таблица `users` (Пользователи)
Хранит данные учетных записей всех участников платформы.
*   `id` `UUID` (PRIMARY KEY) — Уникальный идентификатор пользователя.
*   `full_name` `VARCHAR(100)` (NOT NULL) — Полное имя.
*   `email` `VARCHAR(256)` (NOT NULL) — Электронная почта.
*   `password_hash` `VARCHAR(256)` (NOT NULL) — Хэш пароля.
*   `phone_number` `VARCHAR(20)` (NULL) — Номер телефона.
*   `role` `VARCHAR(50)` (NOT NULL) — Роль пользователя (см. Enums).
*   `is_active` `BOOLEAN` (NOT NULL, DEFAULT TRUE) — Статус активности аккаунта.
*   `email_confirmed` `BOOLEAN` (NOT NULL, DEFAULT FALSE) — Подтверждена ли почта.
*   `last_login_at` `TIMESTAMP WITH TIME ZONE` (NULL) — Время последнего входа.
*   *Поля аудита:* `created_at`, `created_by_user_id`, `updated_at`, `updated_by_user_id`, `deleted_at`, `deleted_by_user_id`, `is_deleted` (все даты `TIMESTAMP WITH TIME ZONE`, `is_deleted` BOOLEAN DEFAULT FALSE).
*   *Уникальные ограничения:* `UNIQUE (email)` (регистронезависимый индекс будет создан на уровне БД).

### 3.2. Таблица `refresh_tokens` (Токены обновления)
Хранит сессии пользователей для безопасного обновления JWT Access токенов.
*   `id` `UUID` (PRIMARY KEY)
*   `user_id` `UUID` (NOT NULL, FOREIGN KEY -> `users(id)` ON DELETE CASCADE) — Владелец токена.
*   `token_hash` `VARCHAR(256)` (NOT NULL) — SHA256 хэш токена.
*   `expires_at` `TIMESTAMP WITH TIME ZONE` (NOT NULL) — Срок действия токена.
*   `created_at` `TIMESTAMP WITH TIME ZONE` (NOT NULL) — Время генерации.
*   `revoked_at` `TIMESTAMP WITH TIME ZONE` (NULL) — Время отзыва токена.
*   `replaced_by_token_id` `UUID` (NULL, FOREIGN KEY -> `refresh_tokens(id)` ON DELETE SET NULL) — ID токена, который заменил текущий при ротации.
*   `device_info` `VARCHAR(256)` (NULL) — Информация об устройстве (User-Agent).
*   `ip_address` `VARCHAR(45)` (NULL) — IP адрес пользователя (IPv4/IPv6).
*   `is_revoked` `BOOLEAN` (NOT NULL, DEFAULT FALSE) — Отозван ли токен вручную (например, при логауте).

### 3.3. Таблица `tourist_places` (Достопримечательности / Места)
Каталог туристических мест, доступных для посещения.
*   `id` `UUID` (PRIMARY KEY)
*   `name` `VARCHAR(150)` (NOT NULL) — Название места.
*   `slug` `VARCHAR(150)` (NOT NULL) — Уникальный человекочитаемый идентификатор для URL.
*   `description` `TEXT` (NOT NULL) — Подробное описание.
*   `city` `VARCHAR(100)` (NOT NULL) — Город нахождения.
*   `address` `VARCHAR(250)` (NULL) — Точный адрес.
*   `latitude` `DECIMAL(9,6)` (NULL) — Географическая широта.
*   `longitude` `DECIMAL(9,6)` (NULL) — Географическая долгота.
*   `image_url` `VARCHAR(500)` (NULL) — Ссылка на основное изображение.
*   `entry_fee` `DECIMAL(10,2)` (NOT NULL, DEFAULT 0.00) — Стоимость входа.
*   `rating_average` `DECIMAL(3,2)` (NOT NULL, DEFAULT 0.00) — Средняя оценка пользователей.
*   `reviews_count` `INTEGER` (NOT NULL, DEFAULT 0) — Количество отзывов.
*   `status` `VARCHAR(50)` (NOT NULL) — Статус модерации (см. Enums).
*   *Поля аудита:* `created_at`, `created_by_user_id`, `updated_at`, `updated_by_user_id`, `deleted_at`, `deleted_by_user_id`, `is_deleted`.
*   *Уникальные ограничения:* `UNIQUE (slug)`.

### 3.4. Таблица `hotels` (Отели)
Отели, зарегистрированные владельцами.
*   `id` `UUID` (PRIMARY KEY)
*   `owner_id` `UUID` (NOT NULL, FOREIGN KEY -> `users(id)` ON DELETE RESTRICT) — Владелец отеля.
*   `name` `VARCHAR(150)` (NOT NULL)
*   `slug` `VARCHAR(150)` (NOT NULL)
*   `description` `TEXT` (NOT NULL)
*   `city` `VARCHAR(100)` (NOT NULL)
*   `address` `VARCHAR(250)` (NOT NULL)
*   `latitude` `DECIMAL(9,6)` (NULL)
*   `longitude` `DECIMAL(9,6)` (NULL)
*   `phone_number` `VARCHAR(20)` (NOT NULL) — Телефон отеля для связи.
*   `website_url` `VARCHAR(250)` (NULL)
*   `image_url` `VARCHAR(500)` (NULL)
*   `price_per_night` `DECIMAL(10,2)` (NOT NULL) — Минимальная цена проживания за ночь.
*   `stars` `INTEGER` (NOT NULL) — Класс отеля (1-5 звезд).
*   `rating_average` `DECIMAL(3,2)` (NOT NULL, DEFAULT 0.00)
*   `reviews_count` `INTEGER` (NOT NULL, DEFAULT 0)
*   `total_rooms` `INTEGER` (NOT NULL) — Общее количество номеров.
*   `available_rooms` `INTEGER` (NOT NULL) — Свободные номера на текущий момент (кеш-поле).
*   `has_wifi` `BOOLEAN` (NOT NULL, DEFAULT FALSE)
*   `has_parking` `BOOLEAN` (NOT NULL, DEFAULT FALSE)
*   `has_pool` `BOOLEAN` (NOT NULL, DEFAULT FALSE)
*   `has_gym` `BOOLEAN` (NOT NULL, DEFAULT FALSE)
*   `has_restaurant` `BOOLEAN` (NOT NULL, DEFAULT FALSE)
*   `is_family_friendly` `BOOLEAN` (NOT NULL, DEFAULT FALSE)
*   `is_luxury` `BOOLEAN` (NOT NULL, DEFAULT FALSE)
*   `is_budget` `BOOLEAN` (NOT NULL, DEFAULT FALSE)
*   `status` `VARCHAR(50)` (NOT NULL) — Статус модерации.
*   *Поля аудита:* `created_at`, `created_by_user_id`, `updated_at`, `updated_by_user_id`, `deleted_at`, `deleted_by_user_id`, `is_deleted`.
*   *Уникальные ограничения:* `UNIQUE (slug)`.

### 3.5. Таблица `restaurants` (Рестораны)
Заведения общественного питания.
*   `id` `UUID` (PRIMARY KEY)
*   `owner_id` `UUID` (NOT NULL, FOREIGN KEY -> `users(id)` ON DELETE RESTRICT)
*   `name` `VARCHAR(150)` (NOT NULL)
*   `slug` `VARCHAR(150)` (NOT NULL)
*   `description` `TEXT` (NOT NULL)
*   `city` `VARCHAR(100)` (NOT NULL)
*   `address` `VARCHAR(250)` (NOT NULL)
*   `latitude` `DECIMAL(9,6)` (NULL)
*   `longitude` `DECIMAL(9,6)` (NULL)
*   `phone_number` `VARCHAR(20)` (NOT NULL)
*   `website_url` `VARCHAR(250)` (NULL)
*   `image_url` `VARCHAR(500)` (NULL)
*   `cuisine_type` `VARCHAR(100)` (NOT NULL) — Тип кухни (например, "Итальянская", "Азиатская").
*   `price_range` `VARCHAR(50)` (NOT NULL) — Диапазон цен (Low, Medium, High).
*   `opening_hours` `VARCHAR(100)` (NOT NULL) — Время работы (например, "09:00 - 23:00").
*   `rating_average` `DECIMAL(3,2)` (NOT NULL, DEFAULT 0.00)
*   `reviews_count` `INTEGER` (NOT NULL, DEFAULT 0)
*   `has_delivery` `BOOLEAN` (NOT NULL, DEFAULT FALSE)
*   `has_wifi` `BOOLEAN` (NOT NULL, DEFAULT FALSE)
*   `has_parking` `BOOLEAN` (NOT NULL, DEFAULT FALSE)
*   `status` `VARCHAR(50)` (NOT NULL) — Статус модерации.
*   *Поля аудита:* `created_at`, `created_by_user_id`, `updated_at`, `updated_by_user_id`, `deleted_at`, `deleted_by_user_id`, `is_deleted`.
*   *Уникальные ограничения:* `UNIQUE (slug)`.

### 3.6. Таблица `transports` (Транспорт)
Рейсы, предлагаемые перевозчиками.
*   `id` `UUID` (PRIMARY KEY)
*   `owner_id` `UUID` (NOT NULL, FOREIGN KEY -> `users(id)` ON DELETE RESTRICT) — Перевозчик.
*   `name` `VARCHAR(150)` (NOT NULL) — Название рейса/транспорта (например, "Поезд Сапсан 23А").
*   `type` `VARCHAR(50)` (NOT NULL) — Тип транспорта (см. Enums).
*   `origin_city` `VARCHAR(100)` (NOT NULL) — Город отправления.
*   `destination_city` `VARCHAR(100)` (NOT NULL) — Город прибытия.
*   `departure_time` `TIMESTAMP WITH TIME ZONE` (NOT NULL) — Время отправления.
*   `arrival_time` `TIMESTAMP WITH TIME ZONE` (NOT NULL) — Время прибытия.
*   `price_per_seat` `DECIMAL(10,2)` (NOT NULL) — Цена за одно место.
*   `total_seats` `INTEGER` (NOT NULL) — Всего мест в транспортном средстве.
*   `available_seats` `INTEGER` (NOT NULL) — Количество доступных мест.
*   `vehicle_number` `VARCHAR(50)` (NOT NULL) — Государственный/бортовой номер транспорта.
*   `contact_phone` `VARCHAR(20)` (NOT NULL) — Номер телефона службы поддержки перевозчика.
*   `status` `VARCHAR(50)` (NOT NULL) — Активен ли рейс.
*   *Поля аудита:* `created_at`, `created_by_user_id`, `updated_at`, `updated_by_user_id`, `deleted_at`, `deleted_by_user_id`, `is_deleted`.

### 3.7. Таблица `guides` (Гиды)
Профили гидов для найма.
*   `id` `UUID` (PRIMARY KEY)
*   `user_id` `UUID` (NOT NULL, FOREIGN KEY -> `users(id)` ON DELETE RESTRICT) — Ссылка на аккаунт пользователя.
*   `bio` `TEXT` (NOT NULL) — Биография гида.
*   `languages` `VARCHAR(250)` (NOT NULL) — Языки, которыми владеет гид (хранятся списком кодов через запятую: "en,ru,uz").
*   `city` `VARCHAR(100)` (NOT NULL) — Город предоставления услуг.
*   `price_per_day` `DECIMAL(10,2)` (NOT NULL) — Стоимость услуг за один день.
*   `experience_years` `INTEGER` (NOT NULL) — Опыт работы в годах.
*   `rating_average` `DECIMAL(3,2)` (NOT NULL, DEFAULT 0.00)
*   `reviews_count` `INTEGER` (NOT NULL, DEFAULT 0)
*   `image_url` `VARCHAR(500)` (NULL) — Ссылка на фото профиля гида.
*   `is_available` `BOOLEAN` (NOT NULL, DEFAULT TRUE) — Доступен ли для найма.
*   `status` `VARCHAR(50)` (NOT NULL) — Статус верификации аккаунта администрацией.
*   *Поля аудита:* `created_at`, `created_by_user_id`, `updated_at`, `updated_by_user_id`, `deleted_at`, `deleted_by_user_id`, `is_deleted`.
*   *Уникальные ограничения:* `UNIQUE (user_id)` (один пользователь может иметь только один профиль гида).

### 3.8. Таблица `bookings` (Бронирования)
Журнал заказов услуг.
*   `id` `UUID` (PRIMARY KEY)
*   `user_id` `UUID` (NOT NULL, FOREIGN KEY -> `users(id)` ON DELETE RESTRICT) — Заказчик (турист).
*   `booking_type` `VARCHAR(50)` (NOT NULL) — Тип бронируемой услуги (Hotel, Transport, Guide).
*   `reference_id` `UUID` (NOT NULL) — Идентификатор конкретного отеля, рейса или гида (Полиморфная связь).
*   `start_date` `TIMESTAMP WITH TIME ZONE` (NOT NULL) — Дата начала брони (или дата отправления транспорта).
*   `end_date` `TIMESTAMP WITH TIME ZONE` (NOT NULL) — Дата окончания брони (или дата прибытия транспорта).
*   `guests_count` `INTEGER` (NOT NULL) — Количество гостей/человек.
*   `quantity` `INTEGER` (NOT NULL, DEFAULT 1) — Количество (например, комнат в отеле или мест в транспорте).
*   `total_price` `DECIMAL(12,2)` (NOT NULL) — Итоговая стоимость бронирования (снимок цены на момент покупки).
*   `status` `VARCHAR(50)` (NOT NULL) — Статус бронирования (см. Enums).
*   `notes` `TEXT` (NULL) — Особые пожелания клиента.
*   `confirmed_at` `TIMESTAMP WITH TIME ZONE` (NULL) — Время подтверждения.
*   `cancelled_at` `TIMESTAMP WITH TIME ZONE` (NULL) — Время отмены.
*   *Поля аудита:* `created_at`, `created_by_user_id`, `updated_at`, `updated_by_user_id`, `deleted_at`, `deleted_by_user_id`, `is_deleted`.

### 3.9. Таблица `reviews` (Отзывы)
Отзывы и оценки, оставленные пользователями.
*   `id` `UUID` (PRIMARY KEY)
*   `user_id` `UUID` (NOT NULL, FOREIGN KEY -> `users(id)` ON DELETE RESTRICT) — Автор отзыва.
*   `review_type` `VARCHAR(50)` (NOT NULL) — Тип объекта отзыва (Place, Hotel, Guide, Restaurant).
*   `reference_id` `UUID` (NOT NULL) — ID объекта, о котором оставлен отзыв (Полиморфная связь).
*   `rating` `INTEGER` (NOT NULL) — Оценка (от 1 до 5).
*   `comment` `TEXT` (NOT NULL) — Текстовый отзыв.
*   `status` `VARCHAR(50)` (NOT NULL) — Статус модерации отзыва (см. Enums).
*   *Поля аудита:* `created_at`, `created_by_user_id`, `updated_at`, `updated_by_user_id`, `deleted_at`, `deleted_by_user_id`, `is_deleted`.

### 3.10. Таблица `favorites` (Избранное)
Сохраненный контент пользователей.
*   `id` `UUID` (PRIMARY KEY)
*   `user_id` `UUID` (NOT NULL, FOREIGN KEY -> `users(id)` ON DELETE CASCADE) — Пользователь.
*   `favorite_type` `VARCHAR(50)` (NOT NULL) — Тип избранного (Place, Hotel, Restaurant, Guide).
*   `reference_id` `UUID` (NOT NULL) — ID объекта.
*   `created_at` `TIMESTAMP WITH TIME ZONE` (NOT NULL)
*   *Уникальные ограничения:* `UNIQUE (user_id, favorite_type, reference_id)` (нельзя добавить один объект в избранное дважды).

### 3.11. Таблица `notifications` (Уведомления)
Системные уведомления для пользователей.
*   `id` `UUID` (PRIMARY KEY)
*   `user_id` `UUID` (NOT NULL, FOREIGN KEY -> `users(id)` ON DELETE CASCADE) — Получатель уведомления.
*   `title` `VARCHAR(150)` (NOT NULL) — Заголовок.
*   `message` `TEXT` (NOT NULL) — Текст сообщения.
*   `type` `VARCHAR(50)` (NOT NULL) — Тип уведомления (Booking, Review, System, Admin, Payment).
*   `is_read` `BOOLEAN` (NOT NULL, DEFAULT FALSE) — Прочитано ли пользователем.
*   `created_at` `TIMESTAMP WITH TIME ZONE` (NOT NULL)
*   `read_at` `TIMESTAMP WITH TIME ZONE` (NULL) — Время прочтения.

### 3.12. Таблица `audit_logs` (Логи аудита)
Журнал безопасности и отслеживания административных действий.
*   `id` `UUID` (PRIMARY KEY)
*   `user_id` `UUID` (NULL, FOREIGN KEY -> `users(id)` ON DELETE SET NULL) — Кто произвел действие.
*   `action` `VARCHAR(100)` (NOT NULL) — Тип действия (например, "VerifyGuide", "DeleteReview", "UpdateUser").
*   `entity_name` `VARCHAR(100)` (NOT NULL) — Название измененной таблицы/сущности (например, "Guides", "Reviews").
*   `entity_id` `UUID` (NOT NULL) — ID измененной записи.
*   `old_values` `JSONB` (NULL) — Состояние до изменений (хранится в JSON формате).
*   `new_values` `JSONB` (NULL) — Состояние после изменений.
*   `ip_address` `VARCHAR(45)` (NULL) — IP адрес, с которого производилось действие.
*   `user_agent` `VARCHAR(500)` (NULL) — User-Agent браузера/клиента.
*   `created_at` `TIMESTAMP WITH TIME ZONE` (NOT NULL)

---

## 4. Перечисления (Enums)
Все перечисления в PostgreSQL хранятся в виде `VARCHAR` с ограничением длины, чтобы обеспечить переносимость данных и избежать проблем при расширении значений enums в .NET коде.

1.  **UserRole:** `Tourist`, `Guide`, `HotelOwner`, `RestaurantOwner`, `TransportOwner`, `Admin`, `SuperAdmin` (Роли пользователей).
2.  **BookingType:** `Hotel`, `Transport`, `Guide` (Типы бронируемых услуг).
3.  **BookingStatus:** `Pending` (Ожидает), `Confirmed` (Подтверждено владельцем), `Cancelled` (Отменено), `Expired` (Истек срок оплаты), `Completed` (Успешно завершено).
4.  **TransportType:** `Bus` (Автобус), `Taxi` (Такси), `Car` (Легковой автомобиль), `Train` (Поезд), `Van` (Минивэн).
5.  **ReviewType / FavoriteType:** `Place`, `Hotel`, `Restaurant`, `Guide` (Типы объектов для отзывов/избранного).
6.  **NotificationType:** `Booking`, `Review`, `System`, `Admin`, `Payment` (Типы уведомлений).
7.  **EntityStatus (Статус модерации):** `Pending` (На модерации), `Approved` (Одобрено/Активно), `Rejected` (Отклонено).
8.  **PriceRange (Ценовой диапазон ресторана):** `Low` (Дешево), `Medium` (Средне), `High` (Дорого).

---

## 5. Связи между таблицами (Relationships)

*   **User 1 - M RefreshTokens:** Один пользователь может иметь несколько активных сессий (на телефоне, ноутбуке и т.д.).
*   **User 1 - M Bookings:** Пользователь-турист может совершать множество бронирований.
*   **User 1 - M Reviews:** Пользователь может оставлять множество отзывов.
*   **User 1 - 1 Guide:** У пользователя может быть максимум один профиль гида (связь `user_id` с уникальным индексом).
*   **HotelOwner 1 - M Hotels:** Владелец отеля может управлять списком своих отелей.
*   **RestaurantOwner 1 - M Restaurants:** Владелец ресторана может владеть сетью ресторанов.
*   **TransportOwner 1 - M Transports:** Перевозчик может создавать множество рейсов.
*   **Полиморфные связи (Bookings, Reviews, Favorites):** 
    Бронирование (`Bookings`) содержит `booking_type` и `reference_id`. Если тип `Hotel`, то `reference_id` указывает на таблицу `hotels`. Аналогично для `Reviews` и `Favorites`.
    *Особенность:* БД не поддерживает нативную проверку целостности (FOREIGN KEY) на один столбец для разных таблиц. Поэтому контроль корректности `reference_id` осуществляется на уровне бизнес-логики (Application Layer) в C# сервисах с помощью валидации.

---

## 6. Стратегия индексов (Index Strategy)

Индексы повышают скорость поиска, но замедляют запись. Мы создаем индексы на часто запрашиваемые поля:

1.  **Users.Email:** Уникальный индекс `idx_users_email` (для быстрой авторизации по почте).
2.  **Places.City & Places.Slug:** `idx_places_city` (фильтр по городам) и уникальный индекс `idx_places_slug` (поиск по URL).
3.  **Hotels.City, Hotels.PricePerNight, Hotels.Stars, Hotels.RatingAverage:** Композитные и одиночные индексы для поиска отелей по городу, цене, звездам и рейтингу.
4.  **Restaurants.City & Restaurants.CuisineType:** Индексы для фильтрации заведений по кухне и местоположению.
5.  **Transports.OriginCity, DestinationCity, DepartureTime:** Композитный индекс `idx_transports_search` для быстрого поиска рейсов (Откуда -> Куда -> Когда).
6.  **Guides.City & Guides.PricePerDay:** Индексы для фильтрации гидов.
7.  **Bookings.UserId & Bookings.Status:** Быстрый вывод бронирований конкретного пользователя и фильтр по статусу.
8.  **Полиморфные ключи (Bookings, Reviews, Favorites):** Композитные индексы по `(booking_type, reference_id)`, `(review_type, reference_id)`, `(favorite_type, reference_id)` для быстрого сбора отзывов/бронирований по конкретному объекту.
9.  **Notifications.UserId + IsRead:** Композитный индекс для подсчета непрочитанных уведомлений конкретного пользователя.
10. **AuditLogs.EntityName + EntityId:** Индекс для вывода истории изменений конкретной сущности в панели управления.

---

## 7. Стратегия ограничений (Constraint Strategy)

Для предотвращения порчи данных на уровне СУБД мы используем строгие ограничения (Constraints):

*   **NOT NULL:** Для всех критических полей (Email, Name, Role, Status, Prices).
*   **UNIQUE:** Ограничение на дублирование почты пользователя (`users.email`), профиля гида (`guides.user_id`), ссылки (`slug` в местах, отелях, ресторанах), а также пар в избранном (`(user_id, favorite_type, reference_id)`).
*   **CHECK constraints:**
    *   `stars` в `hotels`: `CHECK (stars BETWEEN 1 AND 5)`.
    *   `rating` в `reviews`: `CHECK (rating BETWEEN 1 AND 5)`.
    *   `rating_average` во всех сущностях: `CHECK (rating_average BETWEEN 0.00 AND 5.00)`.
    *   Цены (`price_per_night`, `price_per_day`, `price_per_seat`, `entry_fee`, `total_price`): `CHECK (price >= 0)`.
    *   Количество мест (`total_seats`, `available_seats`): `CHECK (total_seats > 0 AND available_seats >= 0 AND available_seats <= total_seats)`.
    *   Даты бронирования: `CHECK (end_date >= start_date)`.
    *   Транспортное время: `CHECK (arrival_time > departure_time)`.

---

## 8. Стратегия мягкого удаления (Soft Delete Strategy)

*   **Зачем это нужно:** Случайное или злонамеренное удаление записи отеля, гида или пользователя сломает связанные исторические данные бронирований.
*   **Как работает:**
    *   Каждая сущность наследует интерфейс `ISoftDelete` (или наследуется от `AuditableEntity`), содержащий поля `is_deleted` (BOOLEAN) и `deleted_at` (TIMESTAMP WITH TIME ZONE), `deleted_by_user_id` (UUID).
    *   При вызове метода удаления в приложении, EF Core перехватывает операцию и меняет `is_deleted = true`, сохраняя запись в БД.
    *   В EF Core настраивается **Global Query Filter**, который по умолчанию отсекает все записи со значением `is_deleted == true` при запросах.
    *   *Восстановление:* Администратор в панели управления имеет возможность переключить флаг обратно на `false` для восстановления данных.
    *   *Исключение:* Таблицы `refresh_tokens` и `notifications` могут удаляться физически (Hard Delete) по прошествии времени для очистки базы данных.

---

## 9. Стратегия аудита (Audit Strategy)
*   **Audit Fields:** Поля `created_at`, `created_by_user_id`, `updated_at`, `updated_by_user_id` присутствуют во всех основных таблицах.
*   **Автоматизация:** Заполнение этих полей происходит в перегруженном методе `SaveChangesAsync` нашего класса `DbContext` в слое Infrastructure. Он автоматически считывает `CurrentUserService.UserId` и проставляет текущее UTC время перед сохранением в БД.
*   **AuditLogs:** Действия администраторов и критические изменения (изменение статуса бронирования, смена роли пользователя) фиксируются в таблице `audit_logs`. Использование формата `JSONB` для колонок `old_values` и `new_values` позволяет хранить срезы измененных полей любой структуры и легко делать по ним поиск прямо в SQL.

---

## 10. Поддержка поиска и фильтрации (Search & Filter Support)

База данных оптимизирована под следующие пользовательские фильтры на фронтенде:

*   **Отели:** Фильтрация по городу (индекс), диапазону цен (индекс по цене), звездам (CHECK), рейтингу, наличию удобств (индексы по boolean полям `has_wifi`, `has_pool` и т.д.).
*   **Места:** Поиск по имени (регистронезависимый индекс `ILIKE`), городу, рейтингу, цене входа.
*   **Рестораны:** Фильтрация по городу, кухне, ценовому диапазону (Low, Medium, High).
*   **Транспорт:** Поиск по точкам отправления и назначения (композитный индекс), дате рейса (индекс по дате), цене.
*   **Гиды:** Поиск по городу, языкам (индекс по строке), опыту, стоимости.

---

## 11. Текстовая диаграмма связей (ERD Text Diagram)

Ниже представлена логическая схема связей таблиц базы данных:

```
+------------------+          +-----------------------+
|      users       | 1 --- M  |    refresh_tokens     |
|   (PK: id)       |          | (FK: user_id -> users)|
+------------------+          +-----------------------+
    | 1      | 1
    |        +-----------------------------------+
    | 1                                          | 1
+------------------+                      +---------------+
|      guides      |                      |   bookings    |
| (FK: user_id)    |                      | (FK: user_id) |
+------------------+                      +---------------+
    | 1 (Owner)                                  * (Polymorphic Ref)
    |                                            |
    +-----> hotels (FK: owner_id -> users) <-----+
    |
    +-----> restaurants (FK: owner_id -> users)
    |
    +-----> transports (FK: owner_id -> users)

+------------------+          +-----------------------+
|     reviews      | M --- 1  |         users         |
| (Polymorphic)    |          |   (FK: user_id)       |
+------------------+          +-----------------------+

+------------------+          +-----------------------+
|    favorites     | M --- 1  |         users         |
| (Polymorphic)    |          |   (FK: user_id)       |
+------------------+          +-----------------------+

+------------------+          +-----------------------+
|  notifications   | M --- 1  |         users         |
|   (PK: id)       |          |   (FK: user_id)       |
+------------------+          +-----------------------+

+------------------+          +-----------------------+
|    audit_logs    | M --- 1  |   users (nullable)    |
|   (PK: id)       |          |   (FK: user_id)       |
+------------------+          +-----------------------+
```

---

## 12. Правила доменной модели (Domain Model Rules)

При реализации бизнес-логики в проекте `TouristSystem.Domain` мы следуем правилам Domain-Driven Design (DDD):

1.  **Базовый класс Entity:** Все сущности наследуют `BaseEntity`, который содержит `Id` типа `Guid`.
2.  **Базовый класс AuditableEntity:** Сущности с отслеживанием изменений и мягким удалением наследуют `AuditableEntity : BaseEntity`.
3.  **Aggregate Roots (Корни агрегатов):** Основные сущности, которые могут существовать независимо и управлять дочерними элементами. В нашем проекте это: `User`, `Place`, `Hotel`, `Restaurant`, `Transport`, `Booking`.
4.  **Value Objects (Объекты-значения):** Используются для группировки связанных полей, не имеющих собственного идентификатора (например, `Location` с широтой и долготой, `Address`).
5.  **Чистота домена:** Доменный слой не имеет зависимостей от EF Core. Никаких атрибутов `[Table]` или `[Key]`. Вся конфигурация базы данных (Fluent API) должна быть описана в проекте `TouristSystem.Infrastructure`.
6.  **Enums в Domain:** Все перечисления (UserRole, BookingStatus и т.д.) объявляются в слое `Domain.Enums` и используются во всей системе.

---

## 13. Финальный чек-лист базы данных (Final Database Checklist)
- [x] Выбран PostgreSQL в качестве реляционной базы данных.
- [x] Все первичные ключи имеют тип UUID.
- [x] Для денежных полей используется тип DECIMAL с точностью (10,2) или (12,2).
- [x] Все даты имеют тип TIMESTAMP WITH TIME ZONE.
- [x] База данных нормализована до 3NF.
- [x] Добавлены индексы на поля поиска, фильтрации и связей.
- [x] Добавлены ограничения (CHECK) для цен, звезд, рейтингов и дат.
- [x] Продумана стратегия мягкого удаления (Soft Delete) и глобальной фильтрации.
- [x] Спроектирован детальный аудит изменений (поля в таблицах и отдельная таблица логов с типом JSONB).
- [x] Разработана концепция полиморфных связей для бронирований, отзывов и избранного.
