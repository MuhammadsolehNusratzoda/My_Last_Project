# Phase 7 — Partner Portal & Financial Analytics
## Панели шарикон ва таҳлили молиявӣ · Partner Portal · Кабинет партнёра

| | |
|---|---|
| **Лоиҳа / Project / Проект** | TouristSystem (Tajikistan Travel) |
| **Версия / Version** | 1.0 — 19.11.2026 |
| **Стек / Stack** | ASP.NET Core 9 · EF Core · PostgreSQL · MediatR (CQRS) · Unit of Work · JWT · React 19 + Vite + TypeScript + Tailwind v4 |
| **Нақшҳо / Roles / Роли** | `HotelOwner`, `RestaurantOwner`, `TransportOwner`, `Guide` (+ `Admin`, `SuperAdmin` барои назорат) |

> **Забон / Language / Язык.** Сарлавҳаҳо бо се забон. Шарҳи асосӣ бо тоҷикӣ (истилоҳҳои техникӣ бо англисӣ). Қисмҳои техникӣ (entity, endpoint, ҷадвалҳо) бо англисӣ, то барои developer ва AI фаҳмо бошанд. Дар охири ҳар бахши калон хулосаи кӯтоҳи русӣ (**RU**) оварда шудааст.

---

## 0. Мақсад · Goal · Цель

**TJ.** Ҳар шарик (соҳиби меҳмонхона, тарабхона, транспорт ва роҳбалад) бояд панели касбии худро дошта бошад. Ин панел бояд ба панели админ монанд бошад: менюи паҳлӯӣ, кортҳои KPI ва графикҳо. Тафовут дар он аст, ки шарик **танҳо маълумоти худро** мебинад ва идора мекунад:

- объектҳои худро илова, таҳрир ва нест мекунад (CRUD): меҳмонхона, ҳуҷра, тарабхона, мошин, профили роҳбалад;
- ҳамаи bron-ҳоро мебинад: **кӣ**, **кай**, **кадом ҳуҷра/ошёна/миз/ҷой**, **чанд шаб/рӯз**, **чанд нафар**, **чӣ қадар пул**;
- bron-ро тасдиқ, рад ё анҷомёфта қайд мекунад;
- **ҳисоботи молиявӣ** мебинад: даромад, хароҷот, фоида ва зарар. Ҳисобот барои **имрӯз, дирӯз, ҳафтаи гузашта, моҳи ҷорӣ/гузашта, соли ҷорӣ/гузашта** ва давраи дилхоҳ сохта мешавад ва бо давраи пешина муқоиса карда мешавад (`+12.5% vs last month`).

**EN.** Give every partner role a professional, admin-like dashboard that is strictly scoped to their own data: listings CRUD, detailed bookings, booking actions, and real financial analytics (revenue, expenses, profit/loss) for preset and custom periods with period-over-period comparison.

**RU.** Каждый партнёр (отель, ресторан, транспорт, гид) получает профессиональный кабинет как у админа, но видит и управляет **только своими** данными: CRUD объектов, подробные брони, подтверждение/отклонение, финансовая аналитика (доход, расходы, прибыль/убыток) за любой период со сравнением с предыдущим.

---

## 1. Ҳолати ҳозира (аудити код) · Current State Audit · Текущее состояние

Аз коди commit-и `6f32331` (branch `main`) санҷида шуд.

| # | Мушкил / Issue | Ҷой дар код / Location | Вазнинӣ |
|---|---|---|---|
| A1 | **Broken Access Control:** `GET /api/bookings` танҳо `[Authorize]` дорад. `UserId` аз query string гирифта мешавад, на аз token. Ҳар корбари воридшуда, ҳатто `Tourist`, **ҳамаи bron-ҳои ҳамаи корбаронро** бо ном мебинад. `GET /api/bookings/{id}` низ соҳибро намесанҷад | `BookingsController.GetList`, `GetBookingsListQueryHandler`, `BookingRepository.GetPagedAsync`, `GetBookingDetailQueryHandler` | 🔴 Critical |
| A2 | Барои шарик ягон query мавҷуд нест, ки bron-ҳоро аз рӯи **соҳиби объект** филтр кунад. `OwnerDashboardPage` ҳамон `GET /api/bookings`-и умумиро мегирад | `OwnerDashboardPage.tsx` | 🔴 |
| A3 | `OwnerServicesPage` ҳамаи `/hotels`-ро мегирад ва дар **браузер** бо `ownerId` филтр мекунад. Танҳо саҳифаи 1-и pagination меояд | `OwnerServicesPage.tsx:52-63` | 🟠 |
| A4 | Дар frontend **Edit** нест. Backend `PUT /api/hotels/{id}` ва `PUT /api/guides/{id}` дорад, вале UI онҳоро истифода намебарад | `OwnerServicesPage.tsx` | 🟠 |
| A5 | Ҷадвали `Room`/`RoomType` нест. Booking танҳо `Quantity` ва `GuestsCount` дорад, барои ҳамин «кадом ҳуҷра/ошёна» маълум нест | `Booking.cs`, `Hotel.cs` (`TotalRooms`, `AvailableRooms`) | 🟠 |
| A6 | Bron-и тарабхона нест: `BookingType` = `Hotel`, `Transport`, `Guide` | `Enums/BookingType.cs` | 🟠 |
| A7 | Role-и `Guide` ягон route-и кориро надорад. Дар меню танҳо «Баромадан» ҳаст | `App.tsx` (`RoleRoute`) | 🟠 |
| A8 | Дар панели админ рақамҳо **сохтаанд**: `bookings.length \|\| 1248`, `'$45,820'`, `342` ва `mockWave` дар график. Дар экран «$45,820» навишта шудааст, вале дар ҷадвал «No reservation records found» | `AdminDashboardPage.tsx:74,188,212,236` | 🟠 |
| A9 | Асъор дар код ҳамчун `USD` навишта шудааст, вале бозор дар Тоҷикистон аст (TJS) | `useTranslation.ts:77` | 🟡 |
| A10 | Барои хароҷоти шарик ягон entity нест. Бе он «фоида» ва «зарар»-ро ҳисоб кардан ғайриимкон аст | — | 🟡 |
| A11 | `AdminLayout` сарлавҳаи «PARTNER DASHBOARD» ва тугмаи «Add New Tour»-ро дорад, ки ба админ мувофиқ нестанд | `AdminLayout.tsx` | 🟡 |
| A12 | Баъд аз login `refreshToken` ҳамчун `''` сабт мешавад. Token-и мӯҳлаташ гузашта ҳамчунон фиристода мешавад (дар log дида шуд) | `LoginPage.tsx` (`setAuth(token, '', …)`) | 🟡 |

**Хуб аст / Already good:** `DeleteHotelCommandHandler`, `ConfirmBookingCommandHandler` соҳибро месанҷанд (`hotel.OwnerId == currentUserId`). Ҳамин намунаро барои ҳамаи endpoint-ҳои нав истифода баред.

**RU.** Критично: любой авторизованный пользователь получает **все** брони через `GET /api/bookings` (A1). Нет фильтра броней по владельцу объекта, нет номеров отелей, нет брони столиков, у гида нет кабинета, в админ-панели показываются выдуманные цифры.

---

## 2. Нақшҳо ва ҳуқуқҳо · Roles & Permissions · Роли и права

### 2.1 Қоидаи асосӣ (ownership)

> **Шарик ҳеҷ гоҳ `ownerId`/`partnerId`-ро аз query ё body намефиристад.** Backend онро **танҳо** аз JWT (`ICurrentUserService.UserId`) мегирад. Ҳар query бо `WHERE PartnerId = currentUserId` сохта мешавад. Агар объект аз они дигар бошад, ҷавоб `404 Not Found` аст, на `403`, то мавҷудияти объект ошкор нашавад.

### 2.2 Матритсаи дастрасӣ

| Модул / Module | HotelOwner | RestaurantOwner | TransportOwner | Guide | Admin/SuperAdmin |
|---|:-:|:-:|:-:|:-:|:-:|
| Dashboard (KPI + графикҳо) | ✅ | ✅ | ✅ | ✅ | ✅ (ҳамаи шарикон) |
| Listings CRUD | Hotels | Restaurants | Transports/Vehicles | Guide profile | ✅ |
| Room Types & Rooms | ✅ | — | — | — | ✅ |
| Tables (мизҳо) | — | ✅ | — | — | ✅ |
| Availability calendar | ✅ | ✅ | ✅ (seats) | ✅ (days) | read |
| Bookings: list/detail | ✅ own | ✅ own | ✅ own | ✅ own | ✅ all |
| Bookings: confirm/reject/complete/no-show | ✅ own | ✅ own | ✅ own | ✅ own | ✅ |
| Finance: revenue/expenses/profit | ✅ | ✅ | ✅ | ✅ | ✅ (platform) |
| Expenses CRUD | ✅ | ✅ | ✅ | ✅ | read |
| Reviews: list + reply | ✅ | ✅ | — | ✅ | ✅ |
| Export CSV | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 3. Модели молиявӣ · Financial Model · Финансовая модель

### 3.1 Таърифҳо (бояд дар код айнан ҳамин тавр бошанд)

| Нишондиҳанда / Metric | Формула / Formula | Шарҳ (TJ) |
|---|---|---|
| **Gross Revenue** (даромади умумӣ) | `Σ TotalPrice` барои bron-ҳо бо `Status ∈ {Completed}` **ё** `{Confirmed ва EndDate ≤ now}` | Танҳо хизмате, ки воқеан расонида шудааст |
| **Expected Revenue** (даромади интизорӣ) | `Σ TotalPrice` барои `Confirmed` ва `StartDate > now` | Пули оянда, ҳоло ҳисоб намешавад |
| **Pending Value** | `Σ TotalPrice` барои `Pending` | Bron-ҳои тасдиқнашуда |
| **Platform Commission** | `Σ CommissionAmount` (snapshot дар ҳар booking) | Ҳаққи платформа, масалан 10% |
| **Refunds** | `Σ RefundAmount` барои `Cancelled` (агар пул баргардонда шуда бошад) | |
| **Net Revenue** (даромади соф) | `Gross − Commission − Refunds` | |
| **Expenses** (хароҷот) | `Σ PartnerExpense.Amount` дар давра | Шарик худаш ворид мекунад (§4.4) |
| **Profit / Loss** (фоида / зарар) | `Net Revenue − Expenses` | Агар `< 0` бошад, **зарар** аст ва бо ранги сурх нишон дода мешавад |
| **Profit Margin %** | `Profit / Gross × 100` | Агар `Gross = 0` бошад, `null` (на 0) |
| **Bookings Count** | шумораи bron-ҳо бо `CreatedAt` дар давра | |
| **Cancellation Rate %** | `Cancelled / AllBookings × 100` | |
| **Avg Booking Value** | `Gross / CompletedCount` | |

**Нишондиҳандаҳои махсус барои ҳар намуд:**

| Role | Metric | Formula |
|---|---|---|
| Hotel | **Occupancy %** | `booked room-nights / (active rooms × days in period) × 100` |
| Hotel | **ADR** (Average Daily Rate) | `room revenue / booked room-nights` |
| Hotel | **RevPAR** | `room revenue / (active rooms × days)` |
| Transport | **Seat Load Factor %** | `booked seats / offered seats × 100` |
| Restaurant | **Covers** | `Σ GuestsCount` барои bron-ҳои `Completed` |
| Guide | **Utilization %** | `booked days / available days × 100` |

### 3.2 Давраҳо · Periods · Периоды

`period` = `today` · `yesterday` · `last7days` · `thisWeek` · `lastWeek` · `thisMonth` · `lastMonth` · `thisYear` · `lastYear` · `custom` (`from`, `to`).

- **Муқоиса:** ҳар KPI бо **давраи пешинаи ҳамандоза** муқоиса мешавад. Масалан, `thisMonth` (1–19 ноябр) бо 1–19 октябр. Натиҷа: `changePercent`, ки метавонад `null` бошад, агар қимати пешина 0 бошад.
- **Минтақаи вақт:** дар DB вақт ҳамеша **UTC** сабт мешавад. Ҳудуди рӯз, ҳафта ва моҳ дар **`Asia/Dushanbe`** ҳисоб мешавад. Ҳафта аз **душанбе** сар мешавад.
- **Группабандии график (`groupBy`):** `today/yesterday` → `hour`; давраҳои то 31 рӯз → `day`; то 1 сол → `week` ё `month`; `year` → `month`.

### 3.3 Асъор · Currency

- Асъори асосӣ **TJS** (сомонӣ). Онро аз `appsettings` → `Finance:Currency` мегиранд, на аз код.
- `formatCurrency` дар frontend асъорро аз API мегирад: `currency` дар ҷавоби `/partner/finance/*`.
- Ҳамаи пулҳо дар C# ҳамчун `decimal` ва дар PostgreSQL ҳамчун `numeric(18,2)` нигоҳ дошта мешаванд. `double/float` **манъ** аст.

### 3.4 Қоидаи муҳим: рақамҳои сохта манъ аст

Ягон KPI, график ё процент набояд қимати сохта, `|| 1248`, `mockWave` ё `Math.random` дошта бошад. Агар маълумот набошад, **0** ва ҳолати «Ҳоло маълумот нест» нишон дода мешавад. Ин қоида ба `AdminDashboardPage` низ дахл дорад (A8).

**RU.** Доход учитывается только по реально оказанным услугам (Completed или Confirmed с прошедшей датой окончания). Прибыль = чистый доход − расходы, отрицательное значение = убыток. Все периоды сравниваются с предыдущим периодом той же длины, границы дней по `Asia/Dushanbe`, валюта TJS из конфигурации, никаких выдуманных цифр.

---

## 4. Тағйироти база · Data Model Changes · Изменения модели данных

Ҳамаи entity-ҳои нав аз `AuditableEntity` мерос мегиранд (soft delete, `CreatedAt` ва ғайра). Migration: **`AddPartnerPortal`**.

### 4.1 Booking (тағйир)

```csharp
public class Booking : AuditableEntity
{
    // ... existing fields ...

    public Guid PartnerId { get; set; }            // NEW: owner of the referenced listing (denormalized for fast, safe queries)
    public Guid? RoomTypeId { get; set; }          // NEW: hotel only
    public Guid? RoomId { get; set; }              // NEW: hotel only — assigned on confirm or at check-in
    public Guid? RestaurantTableId { get; set; }   // NEW: restaurant only (optional)
    public decimal UnitPrice { get; set; }         // NEW: price per night/seat/day at booking time (snapshot)
    public decimal CommissionRate { get; set; }    // NEW: e.g. 0.10 (snapshot from config)
    public decimal CommissionAmount { get; set; }  // NEW: TotalPrice * CommissionRate
    public decimal RefundAmount { get; set; }      // NEW: default 0
    public string? RejectionReason { get; set; }   // NEW
    public DateTime? CompletedAt { get; set; }     // NEW
    public bool IsNoShow { get; set; }             // NEW

    public RoomType? RoomType { get; set; }
    public Room? Room { get; set; }
}
```

- `BookingType`: **`Restaurant = 4`** илова мешавад.
- **Backfill** дар migration: `PartnerId` барои bron-ҳои мавҷуда аз рӯи `ReferenceId` пур карда мешавад (Hotel → `Hotels.OwnerId`, Transport → `Transports.OwnerId`, Guide → `Guides.UserId`). `UnitPrice` ва `CommissionAmount` аз `TotalPrice` ҳисоб карда мешаванд.
- `CreateBookingCommandHandler` `PartnerId`, `UnitPrice` ва `Commission*`-ро **дар backend** муқаррар мекунад. Нарх ҳеҷ гоҳ аз frontend қабул карда намешавад.

### 4.2 RoomType ва Room (нав)

```csharp
public class RoomType : AuditableEntity
{
    public Guid HotelId { get; set; }
    public string Name { get; set; } = string.Empty;        // "Standard Double", "Deluxe Suite"
    public string? Description { get; set; }
    public int Capacity { get; set; }                        // max guests
    public int BedsCount { get; set; }
    public decimal PricePerNight { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public Hotel Hotel { get; set; } = null!;
    public ICollection<Room> Rooms { get; set; } = new List<Room>();
}

public class Room : AuditableEntity
{
    public Guid RoomTypeId { get; set; }
    public string Number { get; set; } = string.Empty;       // "305"
    public int Floor { get; set; }                           // ошёна / этаж
    public RoomStatus Status { get; set; } = RoomStatus.Available;
    public RoomType RoomType { get; set; } = null!;
}

public enum RoomStatus { Available = 1, Maintenance = 2, OutOfService = 3 }
```

- `Hotel.TotalRooms` ва `AvailableRooms` дигар дастӣ нигоҳ дошта намешаванд. Онҳо аз `Rooms` ҳисоб карда мешаванд. Сутунҳоро барои мутобиқат то фазаи оянда нигоҳ доред.
- **Санҷиши банд будан:** ҳуҷра дар давраи `[Start, End)` банд аст, агар bron-и `Confirmed` бо ҳамин `RoomId` ва давраи бо он бархӯрдкунанда вуҷуд дошта бошад. Ҳангоми confirm ин дар **transaction** санҷида мешавад, то ду нафар як ҳуҷраро bron накунанд.

### 4.3 RestaurantTable ва GuideAvailability (нав)

```csharp
public class RestaurantTable : AuditableEntity
{
    public Guid RestaurantId { get; set; }
    public string Label { get; set; } = string.Empty;   // "T5", "VIP-1"
    public int Seats { get; set; }
    public bool IsActive { get; set; } = true;
    public Restaurant Restaurant { get; set; } = null!;
}

public class GuideAvailability : BaseEntity
{
    public Guid GuideId { get; set; }
    public DateOnly Date { get; set; }
    public bool IsAvailable { get; set; } = true;       // false = day off / blocked
    public string? Note { get; set; }
    public Guide Guide { get; set; } = null!;
}
```

### 4.4 PartnerExpense (нав): барои ҳисоби фоида ва зарар

```csharp
public class PartnerExpense : AuditableEntity
{
    public Guid PartnerId { get; set; }                  // always from JWT
    public ExpenseCategory Category { get; set; }
    public decimal Amount { get; set; }                  // > 0
    public DateOnly ExpenseDate { get; set; }
    public string? Description { get; set; }
    public BookingType? ListingType { get; set; }        // optional link to a listing
    public Guid? ListingId { get; set; }
    public string? ReceiptUrl { get; set; }              // uploaded file (image/pdf)
    public bool IsRecurring { get; set; }                // e.g. monthly rent
}

public enum ExpenseCategory
{
    Salaries = 1, Rent = 2, Utilities = 3, Maintenance = 4, Supplies = 5,
    Food = 6, Fuel = 7, Marketing = 8, Taxes = 9, Commission = 10, Other = 99
}
```

### 4.5 BookingStatusHistory (нав): кӣ, кай ва чӣ тағйир дод

```csharp
public class BookingStatusHistory : BaseEntity
{
    public Guid BookingId { get; set; }
    public BookingStatus FromStatus { get; set; }
    public BookingStatus ToStatus { get; set; }
    public Guid ChangedByUserId { get; set; }
    public string? Reason { get; set; }
    public DateTime ChangedAt { get; set; }
}
```

### 4.6 Index-ҳо (барои суръати ҳисобот)

```text
IX_Bookings_PartnerId_StartDate
IX_Bookings_PartnerId_Status
IX_Bookings_RoomId_StartDate_EndDate
IX_PartnerExpenses_PartnerId_ExpenseDate
IX_Rooms_RoomTypeId_Number  (UNIQUE)
IX_GuideAvailability_GuideId_Date (UNIQUE)
```

**RU.** В `Booking` добавляются `PartnerId` (владелец, всегда с сервера), номер/тип номера, снимок цены и комиссии, причина отказа. Новые таблицы: `RoomType`, `Room`, `RestaurantTable`, `GuideAvailability`, `PartnerExpense` (расходы для расчёта прибыли), `BookingStatusHistory`. Миграция `AddPartnerPortal` с заполнением `PartnerId` для старых броней.

---

## 5. API · Endpoints · API

Ҳама дар `PartnerController`-ҳо ҷойгир мешаванд, prefix: **`/api/partner`**. Attribute: `[Authorize(Roles = "HotelOwner,RestaurantOwner,TransportOwner,Guide,Admin,SuperAdmin")]`. Ҷавобҳо дар формати мавҷудаи лоиҳа ҳастанд (`PagedList<T>` барои рӯйхатҳо). Pattern: MediatR `Command`/`Query` + `Validator` (FluentValidation) + `Handler`, мисли `Features/Hotels`.

### 5.1 Dashboard ва молия

| Method | Route | Тавсиф |
|---|---|---|
| GET | `/api/partner/dashboard?period=thisMonth` | KPI-ҳо ва `changePercent`, 5 bron-и охирин, check-in/out-ҳои имрӯза |
| GET | `/api/partner/finance/summary?period=…&from=&to=` | Gross, Net, Commission, Refunds, Expenses, Profit, Margin, муқоиса |
| GET | `/api/partner/finance/timeseries?period=…&groupBy=day` | `[{ bucket, revenue, expenses, profit, bookings }]` барои график |
| GET | `/api/partner/finance/breakdown?period=…&by=listing\|roomType\|category\|status` | Тақсимот барои donut ва ҷадвалҳо |
| GET | `/api/partner/finance/export?period=…&format=csv` | CSV (UTF-8 BOM, то Excel кириллиро дуруст кушояд) |

Намунаи ҷавоби `finance/summary`:

```json
{
  "period": { "from": "2026-11-01", "to": "2026-11-19", "timezone": "Asia/Dushanbe" },
  "previousPeriod": { "from": "2026-10-01", "to": "2026-10-19" },
  "currency": "TJS",
  "grossRevenue":   { "value": 48250.00, "previous": 41300.00, "changePercent": 16.8 },
  "commission":     { "value": 4825.00,  "previous": 4130.00,  "changePercent": 16.8 },
  "refunds":        { "value": 600.00,   "previous": 0,        "changePercent": null },
  "netRevenue":     { "value": 42825.00, "previous": 37170.00, "changePercent": 15.2 },
  "expenses":       { "value": 31000.00, "previous": 39500.00, "changePercent": -21.5 },
  "profit":         { "value": 11825.00, "previous": -2330.00, "changePercent": null },
  "profitMargin":   24.5,
  "expectedRevenue": 15600.00,
  "pendingValue": 3200.00,
  "bookingsCount": 64,
  "cancellationRate": 6.3,
  "typeSpecific": { "occupancyRate": 71.4, "adr": 540.00, "revPar": 385.60 }
}
```

### 5.2 Listings (объектҳо)

| Method | Route | Role |
|---|---|---|
| GET | `/api/partner/listings` | ҳама: танҳо объектҳои худ, бо pagination, `search`, `status` |
| GET/PUT/DELETE | `/api/partner/hotels/{id}` · POST `/api/partner/hotels` | HotelOwner |
| GET/POST | `/api/partner/hotels/{hotelId}/room-types` · PUT/DELETE `/room-types/{id}` | HotelOwner |
| GET/POST | `/api/partner/room-types/{roomTypeId}/rooms` · PUT/DELETE `/rooms/{id}` | HotelOwner |
| CRUD | `/api/partner/restaurants` · `/api/partner/restaurants/{id}/tables` | RestaurantOwner |
| CRUD | `/api/partner/transports` | TransportOwner |
| GET/PUT | `/api/partner/guide-profile` | Guide |
| GET/PUT | `/api/partner/guide-availability?month=2026-11` | Guide |

- Объекти нав ё объекте, ки таҳрир шудааст, бо `Status = Pending` сабт мешавад, то админ онро модератсия кунад. Ин бо `EntityStatus`-и мавҷуда мувофиқ аст.
- `DELETE` **soft delete** аст (`IsDeleted`). Агар объект bron-и фаъол (`Pending`/`Confirmed` дар оянда) дошта бошад, ҷавоб `409 Conflict` бо паёми фаҳмо аст.

### 5.3 Bookings (bron-ҳо)

| Method | Route | Тавсиф |
|---|---|---|
| GET | `/api/partner/bookings` | Филтрҳо: `status`, `listingId`, `roomTypeId`, `roomId`, `from`, `to`, `search` (номи меҳмон/email), `sort`, pagination |
| GET | `/api/partner/bookings/{id}` | Тафсилот: меҳмон (ном, телефон, email), объект, ҳуҷра/ошёна/миз, санаҳо, шабҳо, нафарҳо, нарх, комиссия, таърихи status |
| POST | `/api/partner/bookings/{id}/confirm` | Body: `{ roomId? }`. Санҷиши банд набудани ҳуҷра дар transaction |
| POST | `/api/partner/bookings/{id}/reject` | Body: `{ reason }` (ҳатмӣ) |
| POST | `/api/partner/bookings/{id}/complete` | Танҳо баъд аз `EndDate` |
| POST | `/api/partner/bookings/{id}/no-show` | Танҳо баъд аз `StartDate` |
| GET | `/api/partner/calendar?from=&to=&listingId=` | Барои календар: ҳуҷраҳо × рӯзҳо → `bookingId`/status |

Гузариши status-ҳо (state machine). Гузаришҳои дигар **`400 Bad Request`** медиҳанд:

```text
Pending ──confirm──▶ Confirmed ──complete──▶ Completed
   │                    │
   └──reject──▶ Cancelled ◀──cancel (tourist/partner)
   └──(timeout 24h)──▶ Expired          Confirmed ──no-show──▶ Completed (IsNoShow = true)
```

Ҳар гузариш: `BookingStatusHistory` сабт мешавад, `Notification` ба турист фиристода мешавад ва `AuditLog` навишта мешавад.

### 5.4 Expenses (хароҷот)

| Method | Route |
|---|---|
| GET | `/api/partner/expenses?from=&to=&category=&listingId=` (paged) |
| POST | `/api/partner/expenses` |
| PUT/DELETE | `/api/partner/expenses/{id}` |
| POST | `/api/partner/expenses/{id}/receipt` (multipart, ≤ 5 MB, jpg/png/pdf) |

Validation: `Amount > 0`, `ExpenseDate` на дертар аз имрӯз, `Category` аз enum.

### 5.5 Reviews

| GET | `/api/partner/reviews?listingId=&rating=` |
|---|---|
| POST | `/api/partner/reviews/{id}/reply` |

### 5.6 Ислоҳи амниятии ҳатмӣ (A1): `/api/bookings`

```csharp
// GetBookingsListQueryHandler — BEFORE (vulnerable): UserId comes from the query string
var (items, total) = await _unitOfWork.Bookings.GetPagedAsync(request.UserId, ...);

// AFTER: tourists only see their own bookings; admins may filter by any user
// (same pattern as DeleteHotelCommandHandler — ICurrentUserService exposes only UserId)
var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException();
var currentUser = await _unitOfWork.Users.GetByIdAsync(currentUserId, cancellationToken);
var isAdmin = currentUser is { Role: UserRole.Admin or UserRole.SuperAdmin };
var userIdFilter = isAdmin ? request.UserId : currentUserId;
var (items, total) = await _unitOfWork.Bookings.GetPagedAsync(userIdFilter, ...);
```

`GetBookingDetailQueryHandler`: агар корбар на соҳиби bron, на `PartnerId` ва на админ бошад, ҷавоб **`404`** аст.

**RU.** Все партнёрские эндпоинты под `/api/partner`, владелец определяется только по JWT. Финансы: summary, timeseries, breakdown, экспорт CSV. Полный CRUD объектов, номеров, столиков, доступности гида. Брони: фильтры, детали, подтверждение с назначением номера (в транзакции), отклонение с причиной, завершение, no-show. Обязательно закрыть уязвимость в `/api/bookings`.

---

## 6. Frontend · Интерфейс · Интерфейс

### 6.1 Сохтор

```text
src/
├── components/layout/PartnerLayout.tsx      # sidebar + header (like AdminLayout)
├── components/partner/
│   ├── PeriodSwitcher.tsx                   # Today | Yesterday | 7 days | Month | Year | Custom
│   ├── KpiCard.tsx                          # value + changePercent (green ↑ / red ↓)
│   ├── RevenueExpenseChart.tsx              # SVG line/area: revenue, expenses, profit
│   ├── BreakdownDonut.tsx
│   ├── BookingStatusBadge.tsx
│   └── BookingDrawer.tsx                    # side panel with full booking details + actions
├── pages/partner/
│   ├── PartnerDashboardPage.tsx
│   ├── PartnerListingsPage.tsx              # list + create/edit modal (role-aware form)
│   ├── PartnerRoomsPage.tsx                 # HotelOwner: room types → rooms (floor, number)
│   ├── PartnerTablesPage.tsx                # RestaurantOwner
│   ├── PartnerAvailabilityPage.tsx          # Guide: month calendar
│   ├── PartnerBookingsPage.tsx              # table + filters + drawer
│   ├── PartnerCalendarPage.tsx              # rooms × days grid
│   ├── PartnerFinancePage.tsx               # summary + charts + breakdown + export
│   ├── PartnerExpensesPage.tsx              # CRUD + receipt upload
│   ├── PartnerReviewsPage.tsx
│   └── PartnerProfilePage.tsx
└── services/partnerApi.ts                   # typed calls to /api/partner/*
```

Routes: `/partner/dashboard`, `/partner/listings`, `/partner/rooms`, `/partner/tables`, `/partner/availability`, `/partner/bookings`, `/partner/calendar`, `/partner/finance`, `/partner/expenses`, `/partner/reviews`, `/partner/profile`.

- `RoleRoute allowedRoles={['HotelOwner','RestaurantOwner','TransportOwner','Guide','Admin','SuperAdmin']}`.
- Route-ҳои кӯҳнаи `/owner/dashboard` ва `/owner/services` ба `/partner/dashboard` → `<Navigate replace>` равона мешаванд.
- Баъд аз login шарик ба `/partner/dashboard` меравад. Дар менюи Navbar барои ҳамаи 4 role «Панели ман» намоён аст, аз ҷумла барои **Guide**.

### 6.2 Менюи паҳлӯӣ аз рӯи role

| Item | Hotel | Restaurant | Transport | Guide |
|---|:-:|:-:|:-:|:-:|
| Шарҳи умумӣ / Overview | ✅ | ✅ | ✅ | ✅ |
| Объектҳои ман / My Listings | Меҳмонхонаҳо | Тарабхонаҳо | Мошинҳо ва хатсайрҳо | Профил |
| Ҳуҷраҳо / Rooms | ✅ | | | |
| Мизҳо / Tables | | ✅ | | |
| Рӯзҳои озод / Availability | | | | ✅ |
| Bron-ҳо / Bookings | ✅ | ✅ | ✅ | ✅ |
| Тақвим / Calendar | ✅ | ✅ | ✅ | ✅ |
| Молия / Finance | ✅ | ✅ | ✅ | ✅ |
| Хароҷот / Expenses | ✅ | ✅ | ✅ | ✅ |
| Шарҳҳо / Reviews | ✅ | ✅ | | ✅ |
| Профил / Profile | ✅ | ✅ | ✅ | ✅ |

### 6.3 Dashboard: таркиб (аз боло ба поён)

1. **Сарлавҳа** + `PeriodSwitcher` + тугмаи «Навсозӣ».
2. **5 корти KPI:** Даромади соф · Хароҷот · **Фоида/Зарар** (сабз ё сурх) · Bron-ҳо · KPI-и махсус (Occupancy / Seat load / Covers / Utilization). Дар ҳар корт `▲ 16.8% нисбат ба давраи пешина` нишон дода мешавад.
3. **График «Даромад vs Хароҷот vs Фоида»** (SVG, мисли графики админ, вале бо маълумоти воқеӣ) + **donut**-и тақсимот (аз рӯи объект ё намуди ҳуҷра).
4. **Имрӯз:** check-in ва check-out-ҳо (меҳмонхона), bron-ҳои имрӯза (тарабхона), рейсҳои имрӯза (транспорт), турҳои имрӯза (роҳбалад).
5. **Bron-ҳои охирин** (5 адад) → «Ҳамааш» → `/partner/bookings`.
6. **Pending**-ҳо бо тугмаҳои зуди Confirm/Reject.

### 6.4 Ҷадвали Bookings: сутунҳо

| Сутун | HotelOwner | Restaurant | Transport | Guide |
|---|---|---|---|---|
| Меҳмон (ном, телефон) | ✅ | ✅ | ✅ | ✅ |
| Объект | Меҳмонхона | Тарабхона | Хатсайр | — |
| Тафсил | **Намуди ҳуҷра · №305 · Ошёнаи 3** | Миз T5 · соат 19:30 | Ҷойҳо: 3 | Тур |
| Санаҳо | Check-in → Check-out (**N шаб**) | Сана ва вақт | Рафтан | Аз → то (**N рӯз**) |
| Нафарон | GuestsCount | GuestsCount | Seats | GuestsCount |
| Нарх / Комиссия / Соф | ✅ | ✅ | ✅ | ✅ |
| Status | badge | badge | badge | badge |
| Амал | Confirm (+ интихоби ҳуҷра) · Reject · Complete · No-show | ← | ← | ← |

### 6.5 Талаботи UI

- Ҳамаи матнҳо тавассути `translations.ts` дар **EN/RU/TJ** навишта мешаванд. Матни сахт навишташуда (hardcoded) манъ аст.
- Режимҳои торик ва равшан дастгирӣ мешаванд. Аз `text-white` дар `select`/`input` истифода набаред (ниг. `index.css`).
- Ҳолатҳои ҳатмӣ: `loading` → skeleton, `error` → `ErrorState` (аллакай ҳаст), `empty` → «Ҳоло маълумот нест».
- Mobile: sidebar → drawer (☰). Ҷадвалҳо дар mobile → кортҳо.
- Тасдиқи амалҳои хатарнок (Delete, Reject) бо modal-и худи сайт, на `alert()`/`confirm()`.

---

## 7. Background Services ва Cache

| Service | Давра | Кор |
|---|---|---|
| `BookingLifecycleService` (`BackgroundService`) | ҳар 15 дақиқа | `Pending` > 24 соат → `Expired`; `Confirmed` бо `EndDate` гузашта → `Completed` (+ `CompletedAt`, history) |
| `RecurringExpenseService` | ҳар рӯз 00:05 (Dushanbe) | Барои хароҷоти `IsRecurring` дар рӯзи аввали моҳ нусхаи нав месозад |
| Cache (`IMemoryCache`) | TTL 5 дақиқа | Калид: `partner:{id}:summary:{period}:{from}:{to}`. Ҳангоми ҳар тағйири bron ё хароҷоти ҳамин шарик тоза мешавад |

---

## 8. Талаботи ғайрифунксионалӣ · Non-functional

- **Амният:** ҳамаи санҷишҳои ownership дар **Handler** ҳастанд, на дар frontend. Тестҳои дастӣ: шарики A наметавонад bron, хароҷот ё ҳуҷраи шарики B-ро бо `id` бинад ё тағйир диҳад, ҷавоб бояд `404` бошад.
- **Суръат:** `finance/summary` барои 10 000 bron < 300 ms. Ҷамъбаст дар SQL (`GROUP BY`, `SUM`) иҷро мешавад, на дар хотира (`ToList()` → LINQ).
- **Дақиқӣ:** пул ҳамеша `decimal` аст. Яклухткунӣ: `MidpointRounding.AwayFromZero`, 2 рақам.
- **Audit:** create, update ва delete-и объектҳо, тағйири status-и bron ва хароҷот дар `AuditLog` сабт мешаванд.
- **Swagger:** ҳамаи endpoint-ҳои нав бо `[ProducesResponseType]` ва намунаҳо ҳуҷҷатгузорӣ мешаванд.
- **Тестҳои xUnit лозим нест.** Санҷиш тавассути Swagger ва дастӣ анҷом дода мешавад.

---

## 9. Фазаҳо ва меъёрҳои қабул · Phases & Acceptance · Этапы и критерии приёмки

### Фаза 0: Амният ва тозакунӣ (1–2 рӯз) — **аввал ҳатмист**
- [ ] A1: `/api/bookings` ва `/api/bookings/{id}` аз рӯи token маҳдуд шудаанд. Турист танҳо bron-ҳои худро мебинад.
- [ ] A8: рақамҳои сохта ва `mockWave` аз `AdminDashboardPage` хориҷ шудаанд. Агар маълумот набошад, 0 нишон дода мешавад.
- [ ] A9: асъор аз `Finance:Currency` (TJS) гирифта мешавад.
- [ ] A11: `AdminLayout` сарлавҳаи «ADMIN PANEL»-ро дорад. «Add New Tour» хориҷ шудааст.

### Фаза 1: Асоси Partner Portal (4–6 рӯз)
- [ ] Migration `AddPartnerPortal`: `Booking.PartnerId` + backfill, `PartnerExpense`, `BookingStatusHistory`, `BookingType.Restaurant`.
- [ ] `PartnerLayout` + routes + redirect аз `/owner/*` + пункти меню барои ҳамаи 4 role (аз ҷумла Guide).
- [ ] `/partner/bookings`: рӯйхат, филтрҳо, drawer, confirm, reject, complete ва no-show бо `BookingStatusHistory`.
- [ ] `/partner/listings`: CRUD бо **Edit** барои ҳамаи 4 намуд, филтр дар backend (A3, A4).
- [ ] `BookingLifecycleService`.

**Қабул:** HotelOwner `hotelowner@…` танҳо bron-ҳои меҳмонхонаҳои худро мебинад ва Confirm/Reject кор мекунад. Guide ба `/partner/dashboard` дохил мешавад. Шарики дигар бо `id`-и бегона `404` мегирад.

### Фаза 2: Молия (4–5 рӯз)
- [ ] `finance/summary`, `timeseries`, `breakdown`, `export` бо давраҳо ва муқоиса (§3).
- [ ] `/partner/expenses`: CRUD, категорияҳо, квитансия, хароҷоти такроршаванда.
- [ ] `/partner/dashboard` ва `/partner/finance`: KPI, график, donut, `PeriodSwitcher`.
- [ ] Cache + invalidation.

**Қабул:** агар 2 bron-и `Completed` (1000 + 500 TJS) ва хароҷоти 800 TJS ворид карда шавад, бо комиссияи 10%: Gross = 1500, Commission = 150, Net = 1350, Profit = **550**. Агар хароҷот 2000 бошад, Profit = **−650** бо ранги сурх ва калимаи «Зарар». Рақамҳо барои `thisMonth` ва `lastMonth` дуруст ҳастанд ва `changePercent` дуруст аст.

### Фаза 3: Ҳуҷраҳо, мизҳо, тақвим (4–5 рӯз)
- [ ] `RoomType`, `Room` (рақам, ошёна, status) CRUD. Ҳангоми confirm ҳуҷра интихоб мешавад ва бархӯрди санаҳо санҷида мешавад.
- [ ] Occupancy, ADR ва RevPAR дар dashboard-и меҳмонхона.
- [ ] `RestaurantTable` + bron-и тарабхона (`BookingType.Restaurant`), Covers.
- [ ] `GuideAvailability` + Utilization.
- [ ] `/partner/calendar`.

**Қабул:** ду bron барои як ҳуҷра бо санаҳои бархӯрдкунанда тасдиқ **намешаванд** (`409`). Дар ҷадвали bron-ҳо «Deluxe · №305 · Ошёнаи 3 · 3 шаб · 2 нафар» намоён аст.

### Фаза 4: Шарҳҳо ва сайқал (2–3 рӯз)
- [ ] Reviews + reply.
- [ ] Mobile layout, тарҷумаҳои пурра (EN/RU/TJ), режими равшан ва торик.
- [ ] Swagger documentation, README (скриншотҳои Partner Portal барои портфолио).

---

## 10. Луғат · Glossary · Глоссарий

| Тоҷикӣ | English | Русский |
|---|---|---|
| Шарик / Соҳибкор | Partner / Owner | Партнёр / Владелец |
| Bron / Фармоиш | Booking / Reservation | Бронирование |
| Даромади умумӣ | Gross revenue | Валовой доход |
| Даромади соф | Net revenue | Чистый доход |
| Хароҷот | Expenses | Расходы |
| Фоида | Profit | Прибыль |
| Зарар | Loss | Убыток |
| Ҳаққи платформа | Platform commission | Комиссия платформы |
| Баргардонидани пул | Refund | Возврат |
| Пуршавии ҳуҷраҳо | Occupancy rate | Загрузка номеров |
| Нархи миёнаи шабона | ADR | Средняя цена за ночь |
| Намуди ҳуҷра | Room type | Тип номера |
| Ошёна | Floor | Этаж |
| Миз | Table | Столик |
| Рӯзҳои озод | Availability | Доступность |
| Давраи пешина | Previous period | Предыдущий период |
| Тасдиқ / Рад | Confirm / Reject | Подтвердить / Отклонить |
| Наомадан | No-show | Неявка |
| Квитансия | Receipt | Чек / Квитанция |
