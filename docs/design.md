# Smart Resort 360 — Frontend Design Spec

> This is the build spec for the frontend team. Every screen maps to endpoints defined in [api.md](./api.md). If a screen needs data that api.md doesn't provide, **change api.md first** (api.md §11), then update this file.
>
> Sources: [prd.md](./prd.md) (what each role needs) · [architecture.md](./architecture.md) §4 (frontend structure) · [decision-engine.md](./decision-engine.md) (recommendations).

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Tech Stack](#2-tech-stack)
3. [Route Map](#3-route-map)
4. [App Shell & Navigation](#4-app-shell--navigation)
5. [Screen Specs — Shared](#5-screen-specs--shared)
6. [Screen Specs — Resort Manager](#6-screen-specs--resort-manager)
7. [Screen Specs — Operations Manager](#7-screen-specs--operations-manager)
8. [Screen Specs — Guest](#8-screen-specs--guest)
9. [Component Inventory](#9-component-inventory)
10. [Design Tokens](#10-design-tokens)
11. [States: Loading, Empty, Error, Prediction Unavailable](#11-states-loading-empty-error-prediction-unavailable)
12. [Frontend Data Layer](#12-frontend-data-layer)
13. [Folder Structure & Ownership](#13-folder-structure--ownership)
14. [Demo Journeys](#14-demo-journeys)
15. [PRD Coverage Checklist](#15-prd-coverage-checklist)

---

## 1. Design Principles

| # | Principle | What it means in the UI |
|---|---|---|
| 1 | **Clear role separation** (PRD §71) | Each role has its own layout, nav and colour accent. A user never sees another role's menu. Manager = *"What is happening to my resort?"*, Operations = *"What is happening with my guests?"*, Guest = *"How can I get the best experience?"* |
| 2 | **Probability, not certainty** (PRD §21) | Say "84% estimated cancellation probability". Never say "will cancel". Every risk badge has a tooltip explaining it's an estimate. |
| 3 | **Forecasts look like forecasts** (arch §9) | Forecast lines are dashed, labelled "Forecast", and optionally show a confidence band. Actual data is a solid line. |
| 4 | **Humans decide** (decision-engine §5) | Recommendation actions are "Accept" / "Dismiss". Never "Apply" or "Execute". A note says accepting does not change anything automatically. |
| 5 | **Explainable** (arch §30 P5) | Every recommendation card shows *what happened → why it matters → suggested action → confidence*. |
| 6 | **Never fake data** (arch §24) | If `predictionStatus` is `UNAVAILABLE`, show "Prediction temporarily unavailable" and don't show a zero or a placeholder number. |
| 7 | **Grounded concierge** (PRD §29) | Chat replies show the resort info they're based on (source chips). Ungrounded replies are shown in a distinct style. |

---

## 2. Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) + React + TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | lucide-react |
| Data fetching | Plain `fetch` wrapper in `lib/api.ts` + small hooks in `hooks/` (SWR optional) |
| Auth | JWT from `POST /api/auth/login`, kept in an httpOnly cookie set by a Next route handler **or** in memory + `localStorage` for the hackathon. `middleware.ts` guards routes by role. |
| Forms | Controlled components (only login and chat for P0) |

---

## 3. Route Map

URL structure follows the role-grouped API: `/manager/*` → `/api/manager/*`, and so on.

| URL | Role | Screen | API calls | Pri |
|---|---|---|---|---|
| `/` | any | Redirect to `/login` or the role home | `GET /api/auth/me` | P0 |
| `/login` | public | Login | `POST /api/auth/login` | P0 |
| `/forbidden` | any | 403 page | — | P0 |
| **Resort Manager** | | | | |
| `/manager/dashboard` | RESORT_MANAGER | Dashboard | `GET /api/manager/dashboard`, `/booking-forecast`, `/occupancy-forecast`, `/cancellation-summary`, `/room-demand` | P0 |
| `/manager/forecast` | RESORT_MANAGER | Booking & occupancy forecast detail | `GET /api/manager/booking-forecast`, `/occupancy-forecast`, `/room-demand` | P0 |
| `/manager/recommendations` | RESORT_MANAGER | Recommendations list | `GET /api/manager/recommendations`, `PATCH /api/manager/recommendations/:recommendationId` | P0 |
| `/manager/pricing` | RESORT_MANAGER | Pricing review | `GET /api/manager/pricing-recommendations` | P1 |
| `/manager/sentiment` | RESORT_MANAGER | Guest sentiment | `GET /api/manager/sentiment` | P1 |
| **Operations Manager** | | | | |
| `/operations/dashboard` | OPERATIONS_MANAGER | Today overview | `GET /api/operations/dashboard` | P0 |
| `/operations/guests` | OPERATIONS_MANAGER | Guest table | `GET /api/operations/guests` | P0 |
| `/operations/guests/[guestId]` | OPERATIONS_MANAGER | Guest profile | `GET /api/operations/guests/:guestId`, `/bookings`, `/preferences`, `/predictions` | P0 |
| `/operations/cancellations` | OPERATIONS_MANAGER | Cancellation risk list | `GET /api/operations/cancellation-risk` | P0 |
| `/operations/staffing` | OPERATIONS_MANAGER | Staffing | `GET /api/operations/staffing` | P1 |
| `/operations/requests` | OPERATIONS_MANAGER | Service requests | `GET/PATCH /api/operations/service-requests` | P1 |
| **Guest** | | | | |
| `/guest/home` | GUEST | Welcome + stay + quick info | `GET /api/guest/profile`, `/bookings`, `/resort-info` | P0 |
| `/guest/concierge` | GUEST | AI Concierge chat | `POST /api/guest/chat`, `GET /api/guest/preferences` | P0 |
| `/guest/profile` | GUEST | My profile & preferences | `GET /api/guest/profile`, `/preferences`, `/bookings` | P0 |
| `/guest/requests` | GUEST | My service requests | `GET/POST /api/guest/service-requests` | P1 |

### 3.1 Role redirect after login

```text
POST /api/auth/login → user.role
  RESORT_MANAGER      → /manager/dashboard
  OPERATIONS_MANAGER  → /operations/dashboard
  GUEST               → /guest/concierge
```

### 3.2 Route guard (`src/middleware.ts`)

```text
/manager/*     requires RESORT_MANAGER
/operations/*  requires OPERATIONS_MANAGER
/guest/*       requires GUEST
no token       → /login?next=<path>
wrong role     → /forbidden
```

The backend also enforces roles. The frontend guard is only there for UX.

### 3.3 Migrating the existing folders

`frontend/src/app/` currently has flat placeholder folders. Move them under role groups in **one** PR (owned by one person) before feature work starts, so nobody else hits conflicts:

| Current | Move to |
|---|---|
| `app/dashboard/` | `app/manager/dashboard/` and `app/operations/dashboard/` |
| `app/forecast/` | `app/manager/forecast/` |
| `app/insights/` | `app/manager/recommendations/` |
| `app/guests/` | `app/operations/guests/` (+ `[guestId]/`) |
| `app/cancellations/` | `app/operations/cancellations/` |
| `app/concierge/` | `app/guest/concierge/` |

---

## 4. App Shell & Navigation

### 4.1 Staff layout (Manager & Operations)

```text
┌──────────────────────────────────────────────────────────────────┐
│ ◉ Smart Resort 360   [Role badge]          [ML ● ok] [👤 Anita ▾]│  ← TopBar (h-14)
├──────────────┬───────────────────────────────────────────────────┤
│ Dashboard    │  Page title                     [date range ▾]    │
│ Forecast     │  Subtitle: "What is happening to my resort?"      │
│ Recommend.   │ ───────────────────────────────────────────────── │
│ ─ P1 ─       │                                                   │
│ Pricing      │                 page content                      │
│ Sentiment    │                                                   │
│              │                                                   │
│ (w-60)       │           (max-w-7xl, p-6, gap-6)                 │
└──────────────┴───────────────────────────────────────────────────┘
```

- `RoleSidebar` gets its items from a per-role config in `lib/constants.ts` (`NAV_ITEMS.RESORT_MANAGER`, ...). P1 items are hidden behind a `FEATURE_FLAGS` constant.
- The `ML ● ok/down` pill comes from `GET /api/health` `services.ml`. When it's down it turns amber and the tooltip says "Predictions temporarily unavailable".
- On mobile (< 768px) the sidebar collapses to a hamburger drawer.

**Nav items**

| Manager | Operations |
|---|---|
| Dashboard `/manager/dashboard` | Dashboard `/operations/dashboard` |
| Forecast `/manager/forecast` | Guests `/operations/guests` |
| Recommendations `/manager/recommendations` | Cancellation Risk `/operations/cancellations` |
| Pricing (P1) | Staffing (P1) |
| Sentiment (P1) | Service Requests (P1) |

### 4.2 Guest layout

A mobile-first, consumer-style app. No sidebar.

```text
┌───────────────────────────────┐
│ ◉ Smart Resort 360     [👤]   │
├───────────────────────────────┤
│                               │
│        page content           │
│        (max-w-2xl)            │
│                               │
├───────────────────────────────┤
│  🏠 Home   💬 Concierge   👤 Me │  ← BottomNav (mobile) / top tabs (desktop)
└───────────────────────────────┘
```

---

## 5. Screen Specs — Shared

### 5.1 Login — `/login`

**Goal:** get into the correct role workspace quickly.

```text
┌───────────────────────────────────────────┐
│            ◉ Smart Resort 360             │
│   AI-powered resort intelligence          │
│                                           │
│   Email     [______________________]      │
│   Password  [______________________]      │
│   [          Sign in           ]          │
│                                           │
│   Demo accounts:                          │
│   [Resort Manager] [Operations] [Guest]   │  ← fills credentials
└───────────────────────────────────────────┘
```

- **API:** `POST /api/auth/login`
- **Errors:** `INVALID_CREDENTIALS` → inline "Email or password is incorrect". `VALIDATION_ERROR` → field-level messages from `error.details`.
- The demo account buttons are there for the hackathon demo. Hide them when `NEXT_PUBLIC_SHOW_DEMO_LOGINS !== "true"`.

### 5.2 Forbidden — `/forbidden`

"You don't have access to this page." plus a button to go to your own role home.

---

## 6. Screen Specs — Resort Manager

### 6.1 Manager Dashboard — `/manager/dashboard`

**Question it answers:** *"What is happening to my resort, and what should I pay attention to?"* (PRD §7, §13)

```text
┌───────────────────────────────────────────────────────────────────────┐
│ Resort Overview                                   Updated 10:15 AM ⟳  │
├───────────┬───────────┬───────────┬───────────┬───────────┬───────────┤
│ Current   │ Predicted │ Upcoming  │ Booking   │ High      │ AI Recs   │
│ Occupancy │ Occupancy │ Bookings  │ Demand    │ Cancel    │           │
│  82.0%    │  87.3% ⓕ  │   220     │ HIGH ↑12% │ Risk 17   │  3 new    │
└───────────┴───────────┴───────────┴───────────┴───────────┴───────────┘
┌───────────────────────────────────┬───────────────────────────────────┐
│ Booking Forecast (7 days)         │ Occupancy Forecast (7 days)       │
│  ── actual  ‒ ‒ forecast          │  ‒ ‒ forecast ░ band ─── 90% line │
│  [LineChart]                      │  [AreaChart]                      │
├───────────────────────────────────┼───────────────────────────────────┤
│ Cancellation Overview             │ Demand by Room Type               │
│  [Donut] Low 165 · Med 38 · High 17│ [Bar] Std · Deluxe · Suite       │
│  ~29 expected cancellations       │  occupancy % + availability       │
├───────────────────────────────────┴───────────────────────────────────┤
│ ✦ AI Insights                                                         │
│  • Booking demand is expected to rise by 12% over the next 7 days.    │
│  • Occupancy may exceed 90% over the weekend.                         │
│  • 17 upcoming bookings have high cancellation risk.                  │
├───────────────────────────────────────────────────────────────────────┤
│ Top Recommendations                                   View all →      │
│  [RecommendationCard] [RecommendationCard] [RecommendationCard]       │
└───────────────────────────────────────────────────────────────────────┘
```

| Section | Component | Data source | Fields |
|---|---|---|---|
| KPI row (6) | `KpiCard` ×6 | `GET /api/manager/dashboard` → `data.kpis` | `currentOccupancy`, `predictedOccupancy`, `upcomingBookings`, `bookingDemand` + `bookingDemandChangePct`, `highRiskCancellations`, `activeRecommendations` |
| Booking forecast | `ForecastLineChart` | `GET /api/manager/booking-forecast?days=7` | `history[].actualBookings`, `points[].predictedBookings` |
| Occupancy forecast | `OccupancyAreaChart` | `GET /api/manager/occupancy-forecast?days=7` | `points[]`, `lowerBound/upperBound`, `highOccupancyThreshold` |
| Cancellation overview | `CancellationDonut` | `GET /api/manager/cancellation-summary` | `summary.low/medium/high`, `expectedCancellations` |
| Room demand | `RoomDemandBar` | `GET /api/manager/room-demand` | `roomType`, `occupancy`, `availableRooms`, `demandLevel` |
| AI Insights | `InsightList` | dashboard → `data.insights` | `text`, `category` |
| Top recs | `RecommendationCard` ×≤3 | dashboard → `data.topRecommendations` | see §6.3 |

**Interactions**
- Clicking a KPI card navigates: occupancy → `/manager/forecast`, High Cancel Risk → `/manager/recommendations?category=CANCELLATION`, AI Recs → `/manager/recommendations`.
- Each chart loads on its own (4 parallel requests). One failing chart must not break the others.
- The ⟳ button refetches all five requests.
- Predicted values carry a small ⓕ "Forecast" marker (tooltip: "Estimated by ML model booking-xgb-v1").

### 6.2 Forecast — `/manager/forecast`

**Question:** *"How will demand develop over the coming days?"* (PRD §8–9)

```text
┌───────────────────────────────────────────────────────────────┐
│ Forecast   Horizon: [7d|14d|30d]   Room type: [All ▾]         │
├───────────────────────────────────────────────────────────────┤
│ Occupancy Forecast (large AreaChart, 90% threshold line)      │
│ Peak: 94.0% on Tue, 29 Sep                                    │
├───────────────────────────────────────────────────────────────┤
│ Booking Forecast (LineChart: actual vs forecast)              │
├───────────────────────────────────────────────────────────────┤
│ Daily table                                                   │
│ Date      | Predicted bookings | Predicted occupancy | vs 90%  │
│ 27 Sep    | 182                | 82.7%              |  —      │
│ 29 Sep    | 198                | 90.0%              |  ▲ High │
├───────────────────────────────────────────────────────────────┤
│ Demand by Room Type (RoomDemandBar + table)                   │
└───────────────────────────────────────────────────────────────┘
```

- **Controls → query params:** horizon → `days`, room type → `roomType`. Keep them in the URL (`?days=14&roomType=DELUXE`) so the view is shareable.
- **API:** `GET /api/manager/booking-forecast`, `/occupancy-forecast`, `/room-demand`
- Footer: "Model: `{modelVersion}` · Confidence {confidence as %}". Hide the confidence part when `confidence` is `null`; ML v1 returns none (decision C-03).
- **Room type selector:** ML v1 forecasts the whole resort only, so the backend returns `400` (`issue: "not_supported"`) when `roomType` is sent. Render the selector disabled with the tooltip "Room-type forecast not available yet" until that changes (decision C-27).

### 6.3 Recommendations — `/manager/recommendations`

**Question:** *"What should I consider doing?"* (PRD §11, decision-engine)

```text
┌───────────────────────────────────────────────────────────────┐
│ Recommendations                                               │
│ [New & Viewed ▾] [Priority: All ▾] [Category: All ▾]          │
├───────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ ● HIGH   OCCUPANCY                          Conf. 89%     │ │
│ │ Prepare for high occupancy                                │ │
│ │ Why: Predicted occupancy is 95% on 2026-09-29.            │ │
│ │ Suggested: Review housekeeping, front-desk and guest-     │ │
│ │ service capacity.                                         │ │
│ │ ▸ Supporting data                                         │ │
│ │                           [Dismiss]  [Accept]             │ │
│ └───────────────────────────────────────────────────────────┘ │
│ ...                                                           │
│ ⓘ Accepting marks a recommendation for action. The system     │
│   never changes prices, bookings or staff automatically.      │
└───────────────────────────────────────────────────────────────┘
```

- **API:** `GET /api/manager/recommendations?status=&priority=&category=&page=`
- **When a card first scrolls into view**, if its `status === "NEW"`, call `PATCH /api/manager/recommendations/:recommendationId` with `{ "status": "VIEWED" }` (fire and forget).
- **Accept / Dismiss:** `PATCH` with `{ "status": "ACCEPTED" | "DISMISSED" }`. Update optimistically and roll back on error. On `409 CONFLICT`, refetch.
- "Supporting data" expands to show `sourceData` as a key/value list (camelCase keys → Title Case labels).
- Final-state cards (ACCEPTED/DISMISSED) show a status chip and no buttons.

### 6.4 Pricing — `/manager/pricing` (P1)

A table built from `GET /api/manager/pricing-recommendations`: Room type | Current ADR | Suggested ADR | Change % | Predicted occupancy | Demand | Reason. The header note says "Suggestions only — prices are not changed automatically."

### 6.5 Sentiment — `/manager/sentiment` (P1)

`GET /api/manager/sentiment?period=`: a sentiment breakdown (stacked bar), a topic trend table (Topic | Negative share | Change | Trend arrow) and an average rating.

---

## 7. Screen Specs — Operations Manager

### 7.1 Operations Dashboard — `/operations/dashboard`

**Question:** *"Who is arriving, and what do I need to prepare?"*

```text
┌───────────┬───────────┬───────────┬───────────┬──────────────────┐
│ Arrivals  │ Departures│ In-house  │ Arrivals  │ Special reqs     │
│ today 24  │ today 19  │ 180       │ 7d 142    │ today 6          │
└───────────┴───────────┴───────────┴───────────┴──────────────────┘
┌─────────────────────────────┬────────────────────────────────────┐
│ Cancellation risk (next 30d)│ Today's arrivals (HIGH risk first) │
│ [RiskDistributionBar]       │ [GuestTable compact, 10 rows]      │
│ High 17 · Med 38 · Low 165  │ → View all guests                  │
└─────────────────────────────┴────────────────────────────────────┘
```

- **API:** `GET /api/operations/dashboard`
- Clicking a risk segment goes to `/operations/cancellations?risk=HIGH`. Clicking a guest row goes to `/operations/guests/[guestId]`.

### 7.2 Guest List — `/operations/guests`

**Question:** *"Who are my guests?"* (PRD §22)

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Guests                                                               │
│ [🔍 Search name/email] [Arrival: 26 Sep – 03 Oct] [Risk ▾] [Room ▾]   │
├──────────────────┬─────────┬──────────┬──────────────┬───────────────┤
│ Guest            │ Room    │ Arrival  │ Preference   │ Cancel. Risk  │
├──────────────────┼─────────┼──────────┼──────────────┼───────────────┤
│ Rahul Sharma     │ Deluxe  │ 28 Sep   │ Spa          │ ● High 84%    │
│ Priya Patel      │ Suite   │ 28 Sep   │ Pool         │ ● Low 12%     │
│ Arjun Mehta      │ Deluxe  │ 29 Sep   │ Restaurant   │ ● Medium 52%  │
├──────────────────┴─────────┴──────────┴──────────────┴───────────────┤
│                                   ‹ 1 2 3 … 8 ›   20 / page          │
└──────────────────────────────────────────────────────────────────────┘
```

- **API:** `GET /api/operations/guests?search=&arrivalFrom=&arrivalTo=&risk=&roomType=&sortBy=&sortOrder=&page=&pageSize=`
- Debounce search by 300ms. All filters live in the URL query.
- The columns follow PRD §22 exactly. The Cancel. Risk column is sortable (`sortBy=cancellationProbability`).
- Clicking a row → `/operations/guests/[guestId]`.
- A null `riskLevel` shows as a "—" badge with the tooltip "Prediction unavailable".

### 7.3 Guest Profile — `/operations/guests/[guestId]`

**Question:** *"What should staff know before this guest arrives?"* (PRD §16–20, §23)

```text
┌──────────────────────────────────────────────────────────────────────┐
│ ← Guests                                                             │
│ Rahul Sharma                          [● HIGH · 84% est. cancel.]    │
│ rahul.sharma@example.com · +91 98765 43210 · ID g-101                │
├───────────────────────────────┬──────────────────────────────────────┤
│ Current Booking               │ Cancellation Risk                    │
│ Deluxe · Room 214             │ [RiskGauge 84%]                      │
│ 28 Sep → 01 Oct (3 nights)    │ Estimated probability — not certain  │
│ 2 adults · Online TA          │ Contributing factors:                │
│ ADR ₹8,500 · No Deposit       │ • Long booking lead time (72 days)   │
│ Special: Late check-in        │ • Previous cancellation history (2)  │
│                               │ • Booking channel: Online TA         │
│                               │ • Deposit type: No Deposit           │
├───────────────────────────────┼──────────────────────────────────────┤
│ Preferences                   │ Predicted Preferences  ✦ ML          │
│ Food: Vegetarian  (history)   │ Room      Deluxe      ████████▉ 91%  │
│ Room: Deluxe      (explicit)  │ Food      Vegetarian  █████████▌ 95% │
│ Activity: Spa     (predicted) │ Activity  Spa         ████████▋ 87%  │
├───────────────────────────────┴──────────────────────────────────────┤
│ ✦ AI summary: "Rahul Sharma's booking has an estimated 84%           │
│ cancellation probability. If the booking remains active, ..."        │
├──────────────────────────────────────────────────────────────────────┤
│ Guest Stats: 3 visits · avg stay 3 nights · avg spend ₹12,500 ·      │
│ 2 previous cancellations                                             │
├──────────────────────────────────────────────────────────────────────┤
│ Activity History        │ Booking History                            │
│ Spa ×4 (14 Mar)         │ [BookingHistoryTable: dates, room, status] │
│ Pool ×3 · Yoga ×2       │                                            │
└──────────────────────────────────────────────────────────────────────┘
```

| Section | API | Fields |
|---|---|---|
| Header, stats, current booking, activities | `GET /api/operations/guests/:guestId` | `profile.*`, `currentBooking.*`, `activities[]` |
| Cancellation risk, predicted prefs, AI summary | `GET /api/operations/guests/:guestId/predictions` | `cancellation.*`, `preferences[]`, `summary` |
| Stored preferences | `GET /api/operations/guests/:guestId/preferences` | `type`, `value`, `source`, `confidence` |
| Booking history | `GET /api/operations/guests/:guestId/bookings` | `Booking[]` |

- Load the four requests in parallel. The profile request gates the page (404 → "Guest not found").
- If `cancellation` is null, show "No upcoming booking". If `predictionStatus` is UNAVAILABLE, use the standard unavailable state (§11).
- Show the `source` of each preference as a small chip: `EXPLICIT` = "Stated", `HISTORY` = "From history", `PREDICTED` = "Predicted ✦".
- **Predicted Preferences card (decision C-08):** ML v1 predicts only `ROOM` and `FOOD` (meal plan, e.g. "Half Board"); it has no activity prediction. The card shows whatever `preferences[]` contains and must not pad missing types. In the demo, Rahul's Spa and Vegetarian appear in the stored **Preferences** card (`HISTORY`/`EXPLICIT`), not as ML predictions.

### 7.4 Cancellation Risk — `/operations/cancellations`

**Question:** *"Which bookings are unstable?"* (PRD §20)

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Cancellation Risk (estimated)   [Risk: High ▾] [Arrival range]       │
├────────────┬─────────┬────────┬──────┬──────────┬─────────┬──────────┤
│ Guest      │ Room    │ Arrival│ Lead │ Channel  │ Deposit │ Prob.    │
│ Rahul S.   │ Deluxe  │ 28 Sep │ 72d  │ Online TA│ None    │ ● 84%    │
│   ▸ Factors: long lead time, previous cancellations                  │
└──────────────────────────────────────────────────────────────────────┘
```

- **API:** `GET /api/operations/cancellation-risk?risk=&minProbability=&arrivalFrom=&arrivalTo=&page=`
- Sorted by probability, highest first. The row expands to show `factors`. Clicking the guest name opens the guest profile.

### 7.5 Staffing — `/operations/staffing` (P1)

`GET /api/operations/staffing?date=`: a department table (Required | Available | Shortage). Shortage rows are highlighted with the `risk-high` token.

### 7.6 Service Requests — `/operations/requests` (P1)

`GET /api/operations/service-requests`, with a status select that calls `PATCH /api/operations/service-requests/:requestId`.

---

## 8. Screen Specs — Guest

The guest UI must never show cancellation probability, revenue, other guests, confidence numbers or internal recommendations (api.md §8).

### 8.1 Guest Home — `/guest/home`

```text
┌───────────────────────────────┐
│ Good evening, Rahul 👋         │
│ Your stay: Deluxe · 28 Sep →  │
│ 01 Oct (3 nights)             │
├───────────────────────────────┤
│ 💬 Ask the Concierge          │
│ "What can I do this evening?" │  → /guest/concierge?q=...
├───────────────────────────────┤
│ Explore                       │
│ [Spa] [Pool] [Restaurants]    │  ← category chips
│ [Activities] [Check-in] [FAQ] │
├───────────────────────────────┤
│ Evening Spa Session           │  ← ResortInfoCard list
│ Daily 5–9 PM, Lotus Spa       │
└───────────────────────────────┘
```

- **API:** `GET /api/guest/profile`, `GET /api/guest/bookings?scope=upcoming`, `GET /api/guest/resort-info?category=`
- The greeting changes with local time of day.

### 8.2 AI Concierge — `/guest/concierge` (hero screen)

**Question:** *"How can I get the best experience?"* (PRD §25–30)

```text
┌───────────────────────────────┐
│ ✦ Resort Concierge            │
│ Personalised for you: Spa ·   │  ← from GET /api/guest/preferences
│ Vegetarian · Pool             │
├───────────────────────────────┤
│  ┌─────────────────────────┐  │
│  │ Hi Rahul! Ask me about  │  │  ← assistant welcome (local)
│  │ activities, dining...   │  │
│  └─────────────────────────┘  │
│        ┌──────────────────┐   │
│        │ What would you   │   │  ← guest bubble (right)
│        │ recommend for me │   │
│        │ this evening?    │   │
│        └──────────────────┘   │
│  ┌─────────────────────────┐  │
│  │ Based on your prefs,    │  │
│  │ I'd recommend the       │  │
│  │ evening spa session...  │  │
│  │ ✦ Based on: Spa, Pool   │  │  ← usedPreferences chips
│  │ 📄 Evening Spa Session  │  │  ← sources chips
│  │ 📄 Pool Timings         │  │
│  └─────────────────────────┘  │
│  ● ● ●  (typing)              │
├───────────────────────────────┤
│ [Relaxing evening?] [Dinner?] │  ← SuggestedPrompts (when empty)
│ [Pool timings?] [Check-out?]  │
├───────────────────────────────┤
│ [ Type your question…   ] [➤] │
└───────────────────────────────┘
```

- **API:** `POST /api/guest/chat` with body `{ message, conversationId? }`. Store `conversationId` from the first reply in component state and send it with later messages.
- **Suggested prompts** (static, from PRD §25): "What activities can I do today?", "What restaurants are available?", "What time does the pool open?", "I want something relaxing tonight."
- **Grounded reply** (`grounded: true`): normal assistant bubble plus source chips. Clicking a chip opens that `ResortInfo` in a bottom sheet (fetched with `GET /api/guest/resort-info?search=<title>`, or cached).
- **Ungrounded reply** (`grounded: false`): a muted bubble with an ⓘ icon and a "Contact front desk" hint. It must look visibly different.
- **Errors:** `429` → "You're sending messages quickly — please wait a moment." `503 AI_SERVICE_UNAVAILABLE` → "The concierge is temporarily unavailable." with a retry button. The guest's message stays in the input.
- Show the typing indicator while the request is pending. Disable send when the input is empty or a request is in flight. Enter sends, Shift+Enter adds a new line.
- Auto-scroll to the newest message. Support a `?q=` param from Home so the prompt is pre-filled and sent.
- Accessibility: the message list is `role="log"` with `aria-live="polite"`.

### 8.3 My Profile — `/guest/profile`

- **API:** `GET /api/guest/profile`, `GET /api/guest/preferences`, `GET /api/guest/bookings?scope=all`
- Sections: Details (name, email, phone, special requirements), My Preferences (chips with a source label and no confidence numbers), My Stays (upcoming + past list).

### 8.4 My Requests — `/guest/requests` (P1)

A list from `GET /api/guest/service-requests`, plus a "New request" form (type select + description) that calls `POST /api/guest/service-requests`.

---

## 9. Component Inventory

Organised into the existing `frontend/src/components/` folders.

| Folder | Component | Props (key) | Used on |
|---|---|---|---|
| `ui/` | `Button`, `Card`, `Badge`, `Select`, `Input`, `Tabs`, `Skeleton`, `Tooltip`, `Drawer`, `Pagination`, `EmptyState`, `ErrorState` | — | everywhere |
| `ui/` | `RiskBadge` | `riskLevel: RiskLevel \| null`, `probability?: number` | ops tables, guest profile |
| `ui/` | `PriorityBadge` | `priority: Priority` | recommendations |
| `ui/` | `ConfidenceBar` | `value: number` (0–1), `label` | predicted preferences |
| `ui/` | `ForecastTag` | `modelVersion?` | KPI and chart forecast markers |
| `ui/` | `PredictionUnavailable` | `compact?` | any prediction slot |
| `layout/` *(new)* | `AppShell`, `TopBar`, `RoleSidebar`, `GuestLayout`, `BottomNav`, `ServiceStatusPill` | `role` | layouts |
| `dashboard/` | `KpiCard` | `label, value, unit?, delta?, isForecast?, href?` | manager, ops dashboards |
| `dashboard/` | `KpiGrid` | `children` | dashboards |
| `charts/` | `ForecastLineChart` | `history, points` | manager dashboard, forecast |
| `charts/` | `OccupancyAreaChart` | `points, threshold` | manager dashboard, forecast |
| `charts/` | `CancellationDonut` | `summary: CancellationSummary` | manager dashboard |
| `charts/` | `RoomDemandBar` | `data: RoomDemand[]` | manager dashboard, forecast |
| `charts/` | `RiskDistributionBar` | `{high, medium, low}` | ops dashboard |
| `charts/` | `RiskGauge` | `probability` | guest profile |
| `insights/` | `InsightList` | `insights: Insight[]` | manager dashboard |
| `insights/` | `RecommendationCard` | `recommendation, onStatusChange` | dashboard, recommendations |
| `insights/` | `RecommendationFilters` | `value, onChange` | recommendations |
| `guests/` | `GuestTable` | `rows: GuestSummary[], compact?` | ops guests, ops dashboard |
| `guests/` | `GuestFilters` | filters | ops guests |
| `guests/` | `GuestHeader`, `CurrentBookingCard`, `CancellationRiskCard`, `PreferenceList`, `PredictedPreferences`, `ActivityHistory`, `BookingHistoryTable`, `GuestStats` | per api.md §7 | guest profile |
| `guests/` | `CancellationRiskTable` | `rows` | ops cancellations |
| `concierge/` | `ChatWindow`, `ChatMessage`, `ChatInput`, `TypingIndicator`, `SuggestedPrompts`, `SourceChips`, `PreferenceChips` | `ChatReply` etc. | guest concierge |
| `concierge/` | `ResortInfoCard`, `CategoryChips` | `ResortInfo` | guest home |

---

## 10. Design Tokens

Define these in `tailwind.config` as CSS variables so dark mode is a variable swap. **Never hard-code hex values in components.**

### 10.1 Colour

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F7F8FA` | `#0F1419` | page background |
| `--surface` | `#FFFFFF` | `#171D24` | cards |
| `--border` | `#E4E7EC` | `#2A323C` | dividers |
| `--text` | `#101828` | `#E6EAF0` | primary text |
| `--text-muted` | `#667085` | `#98A2B3` | secondary text |
| `--brand` | `#0E7C7B` (teal lagoon) | `#2BB3B1` | primary buttons, links |
| `--brand-soft` | `#E6F4F3` | `#123332` | selected nav, chips |
| `--accent-manager` | `#3E5BA9` | `#7F9CF5` | manager role badge |
| `--accent-ops` | `#B7791F` | `#F0B35A` | operations role badge |
| `--accent-guest` | `#0E7C7B` | `#2BB3B1` | guest header |
| `--risk-high` | `#D92D20` | `#F97066` | HIGH risk / priority |
| `--risk-medium` | `#DC6803` | `#FDB022` | MEDIUM |
| `--risk-low` | `#079455` | `#47CD89` | LOW |
| `--forecast` | `#7A5AF8` | `#9B8AFB` | forecast lines, ✦ AI markers |
| `--actual` | `#344054` | `#D0D5DD` | actual-data lines |

**Chart series:** actual = `--actual` solid 2px. Forecast = `--forecast` dashed `4 4`. Confidence band = `--forecast` at 15% opacity. Threshold line = `--risk-high` dotted, labelled "90% high occupancy".

**Risk is never shown by colour alone.** Always include the text label ("High"), and the % where allowed.

### 10.2 Typography

| Token | Size / weight | Use |
|---|---|---|
| `display` | 30px / 700 | KPI values |
| `h1` | 24px / 600 | page titles |
| `h2` | 18px / 600 | card titles |
| `body` | 14px / 400 | default |
| `small` | 12px / 500 | labels, badges |

Font: Inter (via `next/font`), with `font-variant-numeric: tabular-nums` for all numbers.

### 10.3 Spacing, radius, elevation

- Spacing scale is Tailwind's default. Page padding `p-6`, card padding `p-5`, grid gap `gap-6`.
- Radius: cards `rounded-xl`, badges `rounded-full`, inputs `rounded-lg`.
- Elevation: cards use `shadow-sm` and a `--border` border. Modals and drawers use `shadow-lg`.

### 10.4 Number & date formatting (put these in `lib/utils.ts`)

| Helper | Input | Output |
|---|---|---|
| `formatPercent(v)` | `92.27` (0–100) | `92.3%` |
| `formatProbability(p)` | `0.84` (0–1) | `84%` |
| `formatCurrency(n)` | `12500` | `₹12,500` (`en-IN`, INR, 0 decimals) |
| `formatDate(d)` | `"2026-09-28"` | `28 Sep` (table) / `Mon, 28 Sep 2026` (detail) |
| `formatDelta(n)` | `12` | `↑12%` (green/red by context) |
| `titleCaseEnum(e)` | `"GUEST_EXPERIENCE"` | `Guest Experience` |

### 10.5 Accessibility

- WCAG AA contrast for all text and badges.
- Every interactive element is keyboard reachable with a visible focus ring (`ring-2 ring-[--brand]`).
- Every chart has an `aria-label` summary and a data table fallback (the forecast page has one).
- Tooltips work on hover and focus, and must not be the only source of important information.

---

## 11. States: Loading, Empty, Error, Prediction Unavailable

Every data section implements all four states.

| State | Trigger | UI |
|---|---|---|
| Loading | request in flight | `Skeleton` matching the final layout (KPI blocks, chart area, table rows). No spinners on full pages. |
| Empty | `data` is `[]` / zero results | `EmptyState` with a context message, e.g. "No guests arriving in this date range." + "Clear filters" |
| Error | `ApiError` (4xx/5xx other than below) | `ErrorState` "Something went wrong loading {section}." + Retry. Other sections keep working. |
| Prediction unavailable | `predictionStatus: "UNAVAILABLE"` or `503 ML_SERVICE_UNAVAILABLE` | `PredictionUnavailable`: "Prediction temporarily unavailable." Show a **"—"** in KPI slots, never `0`. Non-prediction data still renders. |
| Stale prediction | `predictionStatus: "STALE"` | Show the data plus a small "Last updated {time}" warning chip |
| Unauthorized | `401` | Clear the token → `/login?next=` |
| Forbidden | `403` | → `/forbidden` |

---

## 12. Frontend Data Layer

### 12.1 Types — `src/types/api.ts`

Copy the shapes from api.md §3 and §2 **exactly**. Don't rename fields.

### 12.2 Base client — `src/lib/api.ts`

```ts
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export class ApiRequestError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<{ data: T; meta?: any }> {
  const token = getToken(); // from auth storage
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = body.error ?? { code: "INTERNAL_ERROR", message: res.statusText };
    throw new ApiRequestError(res.status, e.code, e.message, e.details);
  }
  return body;
}
```

### 12.3 Per-role modules (one owner each)

```ts
// src/lib/manager-api.ts
export const managerApi = {
  getDashboard: () => apiRequest<ManagerDashboard>("/manager/dashboard"),
  getBookingForecast: (days = 7, roomType?: RoomType) =>
    apiRequest<BookingForecast>(`/manager/booking-forecast?${qs({ days, roomType })}`),
  getOccupancyForecast: (days = 7, roomType?: RoomType) =>
    apiRequest<OccupancyForecast>(`/manager/occupancy-forecast?${qs({ days, roomType })}`),
  getCancellationSummary: (days = 30) =>
    apiRequest<CancellationSummaryResponse>(`/manager/cancellation-summary?${qs({ days })}`),
  getRoomDemand: (days = 7) => apiRequest<RoomDemand[]>(`/manager/room-demand?${qs({ days })}`),
  getRecommendations: (f: RecommendationFilters) =>
    apiRequest<Recommendation[]>(`/manager/recommendations?${qs(f)}`),
  updateRecommendationStatus: (recommendationId: string, status: "VIEWED" | "ACCEPTED" | "DISMISSED") =>
    apiRequest<Recommendation>(`/manager/recommendations/${recommendationId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
```

`operations-api.ts`, `guest-api.ts` and `auth-api.ts` follow the same pattern, with one function per endpoint in api.md §5, §7 and §8. **Function name = verb + resource** (`getGuests`, `getGuestPredictions`, `sendChatMessage`).

### 12.4 Hooks — `src/hooks/`

`useApi(fn, deps)` returns `{ data, meta, error, isLoading, refetch }`. Add small role hooks on top of it (`useManagerDashboard`, `useGuest(guestId)`, `useChat()`).

### 12.5 Mocks

Put them in `src/mocks/` (one file per role, matching the api.md example responses). They use the PRD §63 demo scenario: Rahul Sharma, 84% cancellation, 95% occupancy peak, 17 high-risk bookings, Deluxe demand rising.

When `NEXT_PUBLIC_USE_MOCKS === "true"`, `apiRequest` resolves from the mocks. This lets the frontend be built before the backend exists, and the switch involves no code changes.

---

## 13. Folder Structure & Ownership

```text
frontend/src/
├── app/
│   ├── layout.tsx                 (shared — touch rarely)
│   ├── page.tsx                   redirect by role
│   ├── login/page.tsx
│   ├── forbidden/page.tsx
│   ├── manager/                   ← Frontend dev A
│   │   ├── layout.tsx             AppShell role=RESORT_MANAGER
│   │   ├── dashboard/page.tsx
│   │   ├── forecast/page.tsx
│   │   ├── recommendations/page.tsx
│   │   ├── pricing/page.tsx       (P1)
│   │   └── sentiment/page.tsx     (P1)
│   ├── operations/                ← Frontend dev B
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── guests/page.tsx
│   │   ├── guests/[guestId]/page.tsx
│   │   ├── cancellations/page.tsx
│   │   ├── staffing/page.tsx      (P1)
│   │   └── requests/page.tsx      (P1)
│   └── guest/                     ← Frontend dev B
│       ├── layout.tsx             GuestLayout
│       ├── home/page.tsx
│       ├── concierge/page.tsx
│       ├── profile/page.tsx
│       └── requests/page.tsx      (P1)
├── components/  ui/ layout/ dashboard/ charts/ insights/   ← dev A
│                guests/ concierge/                         ← dev B
├── hooks/
├── lib/  api.ts  auth-api.ts  manager-api.ts  operations-api.ts  guest-api.ts  constants.ts  utils.ts
├── mocks/  manager.ts  operations.ts  guest.ts
├── types/  api.ts
└── middleware.ts
```

This matches the team split in architecture.md §27 (Member 3 = Manager dashboard + charts; Member 4 = Operations + Guest Concierge).

**Merge rules:**
- Shared files (`layout.tsx`, `lib/api.ts`, `types/api.ts`, `lib/constants.ts`, `ui/`) are set up in the first PR, then only appended to.
- Each dev edits only their own role folder, component folders and `*-api.ts` file.

---

## 14. Demo Journeys

These are the PRD §62 journeys as click paths, for rehearsal.

**Journey 1 — Resort Manager**
1. `/login` → click the "Resort Manager" demo button → Sign in
2. `/manager/dashboard`: point out KPIs (82% → 87% forecast, 17 high-risk bookings), the occupancy forecast crossing the 90% line, and the AI insights
3. Click Predicted Occupancy → `/manager/forecast`: peak 94–95%
4. `/manager/recommendations`: open "Prepare for high occupancy" → Accept (point out the human-in-the-loop note)

**Journey 2 — Operations Manager**
1. Log in as Operations → `/operations/dashboard`: 17 HIGH risk
2. `/operations/guests`: filter Risk = High → Rahul Sharma
3. `/operations/guests/g-101`: 84% *estimated* probability plus factors, predicted Deluxe / Vegetarian / Spa, and the AI summary

**Journey 3 — Guest**
1. Log in as Guest (Rahul) → `/guest/concierge`
2. Personalisation chips show Spa · Vegetarian · Pool
3. Ask "What would you recommend for me this evening?" → the grounded reply cites Evening Spa Session and Pool Timings
4. Ask something unknown (e.g. "Is there a helipad?") → the ungrounded fallback shows the hallucination guard working

---

## 15. PRD Coverage Checklist

| PRD §70 feature | Screen | Endpoint(s) |
|---|---|---|
| Login (all roles) | `/login` | `POST /api/auth/login`, `GET /api/auth/me` |
| Manager dashboard | `/manager/dashboard` | `GET /api/manager/dashboard` |
| Booking prediction | `/manager/dashboard`, `/manager/forecast` | `GET /api/manager/booking-forecast` |
| Occupancy forecast | `/manager/dashboard`, `/manager/forecast` | `GET /api/manager/occupancy-forecast` |
| Cancellation summary | `/manager/dashboard` | `GET /api/manager/cancellation-summary` |
| Demand by room type | `/manager/dashboard`, `/manager/forecast` | `GET /api/manager/room-demand` |
| Overall AI recommendations | `/manager/recommendations` | `GET /api/manager/recommendations`, `PATCH /api/manager/recommendations/:recommendationId` |
| Guest list | `/operations/guests` | `GET /api/operations/guests` |
| Guest profile | `/operations/guests/[guestId]` | `GET /api/operations/guests/:guestId` |
| Guest history | `/operations/guests/[guestId]` | `GET /api/operations/guests/:guestId/bookings` |
| Guest preferences | `/operations/guests/[guestId]` | `GET /api/operations/guests/:guestId/preferences` |
| Preference prediction | `/operations/guests/[guestId]` | `GET /api/operations/guests/:guestId/predictions` |
| Cancellation prediction | `/operations/cancellations`, guest profile | `GET /api/operations/cancellation-risk`, `.../predictions` |
| AI chatbot | `/guest/concierge` | `POST /api/guest/chat` |
| Resort information | `/guest/home` | `GET /api/guest/resort-info` |
| Activity recommendations | `/guest/concierge` | `POST /api/guest/chat` |
| Personalized responses | `/guest/concierge` | `POST /api/guest/chat` (`usedPreferences`), `GET /api/guest/preferences` |
