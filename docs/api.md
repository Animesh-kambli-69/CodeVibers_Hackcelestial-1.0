# Smart Resort 360 — API Contract

> **This file is the single source of truth for every HTTP endpoint in the project.**
> Frontend, backend and ML code must use the names, paths, fields and enums defined here.
> If another doc (prd.md, architecture.md, decision-engine.md) shows a different name, **this file wins** — see [§10 Superseded Names](#10-superseded-names).

| | |
|---|---|
| Public API | Node.js / Express — `/api/*` — consumed by the Next.js frontend |
| Internal API | Python / FastAPI ML service — `/predict/*` — consumed **only** by the Node backend |
| Related docs | [prd.md](./prd.md) · [architecture.md](./architecture.md) · [database.md](./database.md) · [decision-engine.md](./decision-engine.md) · [ml-contracts.md](./ml-contracts.md) · [design.md](./design.md) |

---

## Table of Contents

1. [Conventions](#1-conventions)
2. [Enums](#2-enums)
3. [Shared Data Models](#3-shared-data-models)
4. [Endpoint Index](#4-endpoint-index)
5. [Health & Auth](#5-health--auth)
6. [Resort Manager API](#6-resort-manager-api)
7. [Operations Manager API](#7-operations-manager-api)
8. [Guest API](#8-guest-api)
9. [Internal ML Service API](#9-internal-ml-service-api)
10. [Superseded Names](#10-superseded-names)
11. [Contract Rules — Avoiding Merge Conflicts](#11-contract-rules--avoiding-merge-conflicts)
12. [Environment Variables](#12-environment-variables)

---

## 1. Conventions

### 1.1 Base URL

```text
Local:       http://localhost:5000/api
Production:  https://<backend-host>/api
```

No version prefix. All public routes start with `/api`.

### 1.2 Route naming

| Rule | Example |
|---|---|
| Routes are grouped by **role**, not by resource | `/api/manager/*`, `/api/operations/*`, `/api/guest/*` |
| Path segments are **lowercase kebab-case nouns** | `/booking-forecast`, `/cancellation-risk`, `/resort-info` |
| Path params are **camelCase** and named after the entity | `:guestId`, `:bookingId`, `:recommendationId`, `:requestId` |
| IDs are **UUID strings** | `"b3f1c2e4-..."` |
| No verbs in paths — use HTTP methods | `PATCH /recommendations/:id` not `/recommendations/:id/accept` |
| Query params are **camelCase** | `?arrivalFrom=2026-09-28&pageSize=20` |

### 1.3 JSON casing

| Layer | Casing |
|---|---|
| Public API (`/api/*`) request + response bodies | **camelCase** (`suggestedAction`, `cancellationProbability`) |
| Database columns | snake_case (`suggested_action`) — mapped once in the backend repository layer |
| ML service (`/predict/*`) | snake_case — mapped once in `backend/src/services/mlService.js` |

The frontend must **never** see snake_case keys.

### 1.4 Value formats

| Kind | Format | Example |
|---|---|---|
| Date | ISO `YYYY-MM-DD` | `"2026-09-28"` |
| Timestamp | ISO 8601 UTC | `"2026-09-26T10:15:00Z"` |
| Probability / confidence | float `0–1` | `0.84` |
| Percentage (occupancy, share) | number `0–100` | `92.4` |
| Money | number in INR, no symbol | `12500` |

### 1.5 Authentication

```http
Authorization: Bearer <JWT>
```

JWT payload:

```json
{
  "userId": "uuid",
  "role": "RESORT_MANAGER | OPERATIONS_MANAGER | GUEST",
  "guestId": "uuid | null",
  "exp": 1790000000
}
```

- `guestId` is present only when `role = GUEST`.
- **Guest routes never accept a `guestId` from the path, query or body.** The backend always reads it from the JWT. A guest can therefore never access another guest's data (PRD §57).

### 1.6 Role access

| Route prefix | Allowed role |
|---|---|
| `/api/health`, `/api/auth/login`, `/api/auth/register` (P1) | public |
| `/api/auth/*` (others) | any authenticated user |
| `/api/manager/*` | `RESORT_MANAGER` |
| `/api/operations/*` | `OPERATIONS_MANAGER` |
| `/api/guest/*` | `GUEST` |

A valid token with the wrong role gets `403 FORBIDDEN`.

### 1.7 Response envelope

**Success**

```json
{
  "data": { },
  "meta": { }
}
```

`meta` is optional and is used for pagination and generation info.

**Error**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "arrivalFrom must be a valid date",
    "details": [
      { "field": "arrivalFrom", "issue": "invalid_date" }
    ]
  }
}
```

### 1.8 Pagination

List endpoints accept `?page=1&pageSize=20` (default `page=1`, `pageSize=20`, max `pageSize=100`) and return:

```json
{
  "data": [ ],
  "meta": { "page": 1, "pageSize": 20, "total": 220, "totalPages": 11 }
}
```

### 1.9 Status codes & error codes

| HTTP | `error.code` | When |
|---|---|---|
| 200 | — | OK |
| 201 | — | Resource created |
| 400 | `VALIDATION_ERROR` | Invalid body / query / params |
| 401 | `UNAUTHORIZED` | Missing, invalid or expired token |
| 401 | `INVALID_CREDENTIALS` | Wrong email/password on login |
| 403 | `FORBIDDEN` | Authenticated but wrong role |
| 404 | `NOT_FOUND` | Entity does not exist |
| 409 | `CONFLICT` | Duplicate (e.g. email already registered) or invalid status transition |
| 429 | `RATE_LIMITED` | Too many requests (chat especially) |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
| 503 | `ML_SERVICE_UNAVAILABLE` | ML service down and the endpoint cannot return anything useful |
| 503 | `AI_SERVICE_UNAVAILABLE` | LLM provider down (chat) |

### 1.10 Degraded predictions

Architecture §24: *a failed prediction must never be shown as a valid prediction.*

When the ML service is unavailable, endpoints that **mix** DB data with predictions still return `200`, but:

- every prediction value is `null`
- the response contains `"predictionStatus": "UNAVAILABLE"`

```json
{
  "data": {
    "currentOccupancy": 82.0,
    "predictedOccupancy": null,
    "predictionStatus": "UNAVAILABLE"
  }
}
```

`predictionStatus` values: `AVAILABLE | UNAVAILABLE | STALE` (`STALE` = served from the `predictions` table cache, older than 24h).

Endpoints that return **only** predictions (e.g. `/booking-forecast`) return `503 ML_SERVICE_UNAVAILABLE` instead.

---

## 2. Enums

Values are UPPER_SNAKE and match [database.md](./database.md) exactly. Frontend copies these into `frontend/src/lib/constants.ts`.

| Enum | Values |
|---|---|
| `Role` | `RESORT_MANAGER`, `OPERATIONS_MANAGER`, `GUEST` |
| `RiskLevel` | `LOW`, `MEDIUM`, `HIGH` |
| `BookingStatus` | `CONFIRMED`, `CANCELLED`, `CHECKED_IN`, `CHECKED_OUT` |
| `RoomStatus` | `AVAILABLE`, `OCCUPIED`, `CLEANING`, `MAINTENANCE`, `RESERVED` |
| `RoomType` | `STANDARD`, `DELUXE`, `SUITE` *(extend only by adding)* |
| `PreferenceType` | `FOOD`, `ROOM`, `ACTIVITY`, `SPA`, `POOL`, `RESTAURANT` |
| `PreferenceSource` | `EXPLICIT`, `HISTORY`, `PREDICTED` |
| `RecommendationCategory` | `OCCUPANCY`, `CANCELLATION`, `OPERATIONS`, `GUEST_EXPERIENCE`, `PRICING`, `MAINTENANCE`, `GUEST_PERSONALIZATION` |
| `Priority` | `HIGH`, `MEDIUM`, `LOW` |
| `RecommendationStatus` | `NEW`, `VIEWED`, `ACCEPTED`, `DISMISSED` |
| `ResortInfoCategory` | `ROOMS`, `RESTAURANTS`, `ACTIVITIES`, `SPA`, `POOL`, `CHECK_IN`, `CHECK_OUT`, `FACILITIES`, `POLICIES`, `FAQ`, `SERVICES` |
| `Sentiment` | `POSITIVE`, `NEUTRAL`, `NEGATIVE` |
| `DemandLevel` | `LOW`, `MEDIUM`, `HIGH` |
| `ServiceRequestStatus` | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CANCELLED` |
| `PredictionStatus` | `AVAILABLE`, `UNAVAILABLE`, `STALE` |

### Risk thresholds (from decision-engine.md §10)

| RiskLevel | `cancellationProbability` |
|---|---|
| `HIGH` | `>= 0.70` |
| `MEDIUM` | `>= 0.40` and `< 0.70` |
| `LOW` | `< 0.40` |

The backend computes `riskLevel`; the frontend must display it, not recompute it.

---

## 3. Shared Data Models

TypeScript shapes. The frontend copies these verbatim into `frontend/src/types/api.ts`. Optional fields are marked `?`; nullable fields use `| null`.

```ts
// ---------- Common ----------
export interface ApiSuccess<T, M = undefined> { data: T; meta?: M }
export interface ApiError {
  error: { code: string; message: string; details?: { field: string; issue: string }[] }
}
export interface PageMeta { page: number; pageSize: number; total: number; totalPages: number }

// ---------- Auth ----------
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  guestId: string | null;
}

// ---------- Guests & bookings ----------
export interface Booking {
  id: string;
  guestId: string;
  roomId: string | null;
  roomNumber: string | null;
  roomType: RoomType;
  bookingDate: string;       // YYYY-MM-DD
  arrivalDate: string;
  departureDate: string;
  nights: number;
  adults: number;
  children: number;
  babies: number;
  adr: number;               // INR
  depositType: string;       // "No Deposit" | "Non Refund" | "Refundable"
  bookingChannel: string;    // "Direct" | "Online TA" | "Offline TA/TO" | "Corporate"
  customerType: string;      // "Transient" | "Contract" | "Group" | "Transient-Party"
  specialRequests: number;
  status: BookingStatus;
}

export interface GuestSummary {           // row in operations guest table
  id: string;
  name: string;
  roomType: RoomType | null;
  arrivalDate: string | null;
  departureDate: string | null;
  topPreference: string | null;           // e.g. "Spa"
  cancellationProbability: number | null;
  riskLevel: RiskLevel | null;
  bookingStatus: BookingStatus | null;
}

export interface GuestProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  foodPreference: string | null;
  preferredRoom: RoomType | null;
  averageStay: number | null;             // nights
  averageSpend: number | null;            // INR
  specialRequirements: string | null;
  previousVisits: number;
  previousCancellations: number;
  createdAt: string;
}

export interface GuestPreference {
  id: string;
  type: PreferenceType;
  value: string;
  confidence: number | null;              // 0–1, null for EXPLICIT
  source: PreferenceSource;
  updatedAt: string;
}

export interface GuestActivity {
  id: string;
  activity: string;
  frequency: number;
  lastUsed: string | null;
}

// ---------- Predictions ----------
export interface CancellationPrediction {
  bookingId: string;
  cancellationProbability: number | null;  // 0–1
  riskLevel: RiskLevel | null;
  factors: string[];                       // "Long booking lead time", ...
  modelVersion: string | null;
  predictionStatus: PredictionStatus;
}

export interface PreferencePrediction {
  type: PreferenceType;
  value: string;
  confidence: number;                      // 0–1
}

export interface ForecastPoint {
  date: string;
  predictedBookings: number;
  predictedOccupancy: number;              // 0–100
  lowerBound?: number;                     // occupancy %, optional band
  upperBound?: number;
}

// ---------- Manager ----------
export interface KpiSummary {
  currentOccupancy: number;                // 0–100
  predictedOccupancy: number | null;       // next-day forecast, 0–100
  upcomingBookings: number;
  bookingDemand: DemandLevel | null;
  bookingDemandChangePct: number | null;   // e.g. 12 means +12%
  highRiskCancellations: number | null;
  activeRecommendations: number;
}

export interface CancellationSummary {
  total: number;
  low: number;
  medium: number;
  high: number;
  expectedCancellations: number | null;    // sum of probabilities, rounded
}

export interface RoomDemand {
  roomType: RoomType;
  totalRooms: number;
  bookedRooms: number;
  availableRooms: number;
  occupancy: number;                       // 0–100
  demandLevel: DemandLevel;
  demandChangePct: number | null;
}

export interface Recommendation {
  id: string;
  category: RecommendationCategory;
  priority: Priority;
  title: string;
  reason: string;
  suggestedAction: string;
  confidence: number | null;
  sourceData: Record<string, unknown>;
  status: RecommendationStatus;
  createdAt: string;
}

export interface Insight {                  // short AI insight line
  id: string;
  text: string;
  category: RecommendationCategory;
}

// ---------- Guest concierge ----------
export interface ResortInfo {
  id: string;
  category: ResortInfoCategory;
  title: string;
  content: string;
  updatedAt: string;
}

export interface ChatSource { id: string; category: ResortInfoCategory; title: string }

export interface ChatReply {
  conversationId: string;
  messageId: string;
  reply: string;
  grounded: boolean;                        // false => fallback, no verified info found
  sources: ChatSource[];
  usedPreferences: { type: PreferenceType; value: string }[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "GUEST" | "ASSISTANT";
  content: string;
  sources?: ChatSource[];
  createdAt: string;
}

// ---------- P1 ----------
export interface ServiceRequest {
  id: string;
  guestId: string;
  guestName?: string;                        // operations view only
  requestType: string;
  description: string;
  priority: Priority;
  status: ServiceRequestStatus;
  createdAt: string;
}
```

---

## 4. Endpoint Index

**P0** = hackathon MVP (PRD §59/§70). **P1** = secondary; the name is reserved and must not be used for anything else.

| Group | Method | Path | Role | Pri |
|---|---|---|---|---|
| Health | GET | `/api/health` | public | P0 |
| Auth | POST | `/api/auth/login` | public | P0 |
| | POST | `/api/auth/logout` | any | P0 |
| | GET | `/api/auth/me` | any | P0 |
| | POST | `/api/auth/register` | public | P1 |
| Manager | GET | `/api/manager/dashboard` | RESORT_MANAGER | P0 |
| | GET | `/api/manager/booking-forecast` | RESORT_MANAGER | P0 |
| | GET | `/api/manager/occupancy-forecast` | RESORT_MANAGER | P0 |
| | GET | `/api/manager/cancellation-summary` | RESORT_MANAGER | P0 |
| | GET | `/api/manager/room-demand` | RESORT_MANAGER | P0 |
| | GET | `/api/manager/recommendations` | RESORT_MANAGER | P0 |
| | PATCH | `/api/manager/recommendations/:recommendationId` | RESORT_MANAGER | P0 |
| | GET | `/api/manager/pricing-recommendations` | RESORT_MANAGER | P1 |
| | GET | `/api/manager/sentiment` | RESORT_MANAGER | P1 |
| Operations | GET | `/api/operations/dashboard` | OPERATIONS_MANAGER | P0 |
| | GET | `/api/operations/guests` | OPERATIONS_MANAGER | P0 |
| | GET | `/api/operations/guests/:guestId` | OPERATIONS_MANAGER | P0 |
| | GET | `/api/operations/guests/:guestId/bookings` | OPERATIONS_MANAGER | P0 |
| | GET | `/api/operations/guests/:guestId/preferences` | OPERATIONS_MANAGER | P0 |
| | GET | `/api/operations/guests/:guestId/predictions` | OPERATIONS_MANAGER | P0 |
| | GET | `/api/operations/cancellation-risk` | OPERATIONS_MANAGER | P0 |
| | GET | `/api/operations/staffing` | OPERATIONS_MANAGER | P1 |
| | GET | `/api/operations/sentiment` | OPERATIONS_MANAGER | P1 |
| | GET | `/api/operations/service-requests` | OPERATIONS_MANAGER | P1 |
| | PATCH | `/api/operations/service-requests/:requestId` | OPERATIONS_MANAGER | P1 |
| Guest | GET | `/api/guest/profile` | GUEST | P0 |
| | GET | `/api/guest/preferences` | GUEST | P0 |
| | GET | `/api/guest/bookings` | GUEST | P0 |
| | GET | `/api/guest/resort-info` | GUEST | P0 |
| | POST | `/api/guest/chat` | GUEST | P0 |
| | GET | `/api/guest/chat/history` | GUEST | P1 |
| | GET | `/api/guest/service-requests` | GUEST | P1 |
| | POST | `/api/guest/service-requests` | GUEST | P1 |
| ML (internal) | GET | `/health` | Node only | P0 |
| | POST | `/predict/bookings` | Node only | P0 |
| | POST | `/predict/occupancy` | Node only | P0 |
| | POST | `/predict/cancellation` | Node only | P0 |
| | POST | `/predict/preferences` | Node only | P0 |
| | POST | `/predict/sentiment` | Node only | P1 |

---

## 5. Health & Auth

### 5.1 `GET /api/health`

Liveness check. Also reports downstream status so the frontend can show a banner.

**Response 200**

```json
{
  "data": {
    "status": "ok",
    "services": { "database": "ok", "ml": "ok", "llm": "ok" },
    "timestamp": "2026-09-26T10:15:00Z"
  }
}
```

`services.*` values: `ok | down`.

---

### 5.2 `POST /api/auth/login`

**Body**

| Field | Type | Required |
|---|---|---|
| `email` | string (email) | ✓ |
| `password` | string, min 6 | ✓ |

```json
{ "email": "manager@smartresort360.com", "password": "demo1234" }
```

**Response 200**

```json
{
  "data": {
    "token": "eyJhbGciOi...",
    "expiresIn": 86400,
    "user": {
      "id": "u-001",
      "name": "Anita Desai",
      "email": "manager@smartresort360.com",
      "role": "RESORT_MANAGER",
      "guestId": null
    }
  }
}
```

**Errors:** `400 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS`, `429 RATE_LIMITED`

The frontend redirects on `user.role` — see [design.md](./design.md#3-route-map).

---

### 5.3 `POST /api/auth/logout`

Stateless JWT: the client discards the token. The endpoint exists so a token denylist can be added later without changing the frontend.

**Response 200** `{ "data": { "success": true } }`

---

### 5.4 `GET /api/auth/me`

Returns the current user from the token. Used on app load to restore the session.

**Response 200** `{ "data": User }`

**Errors:** `401 UNAUTHORIZED`

---

### 5.5 `POST /api/auth/register` — P1

Guest self-signup for demos. Always creates `role = GUEST` (roles cannot be chosen by the client) and a linked `guests` row.

**Body:** `{ "name": string, "email": string, "password": string, "phone"?: string }`

**Response 201:** same shape as login.

**Errors:** `400 VALIDATION_ERROR`, `409 CONFLICT` (email exists)

---

## 6. Resort Manager API

All routes require `role = RESORT_MANAGER`.
Backend file: `backend/src/routes/manager.routes.js` → `controllers/manager.controller.js`.

### 6.1 `GET /api/manager/dashboard`

Everything the manager dashboard needs in one call: KPIs, short AI insights and the top recommendations. Charts load separately (§6.2–6.5) so one slow chart does not block the page.

**Tables:** `bookings`, `rooms`, `recommendations` (+ ML)

**Response 200**

```json
{
  "data": {
    "kpis": {
      "currentOccupancy": 82.0,
      "predictedOccupancy": 87.3,
      "upcomingBookings": 220,
      "bookingDemand": "HIGH",
      "bookingDemandChangePct": 12,
      "highRiskCancellations": 17,
      "activeRecommendations": 3
    },
    "insights": [
      { "id": "ins-1", "text": "Booking demand is expected to rise by 12% over the next 7 days.", "category": "OCCUPANCY" },
      { "id": "ins-2", "text": "Occupancy may exceed 90% over the weekend.", "category": "OCCUPANCY" },
      { "id": "ins-3", "text": "17 upcoming bookings have high cancellation risk.", "category": "CANCELLATION" },
      { "id": "ins-4", "text": "Deluxe room demand is increasing while availability is decreasing.", "category": "PRICING" }
    ],
    "topRecommendations": [
      {
        "id": "7c1e...",
        "category": "OCCUPANCY",
        "priority": "HIGH",
        "title": "Prepare for high occupancy",
        "reason": "Predicted occupancy is 95%.",
        "suggestedAction": "Review housekeeping, front-desk and guest-service capacity.",
        "confidence": 0.89,
        "sourceData": { "predictedOccupancy": 95 },
        "status": "NEW",
        "createdAt": "2026-09-26T06:00:00Z"
      }
    ],
    "predictionStatus": "AVAILABLE",
    "generatedAt": "2026-09-26T10:15:00Z"
  }
}
```

`topRecommendations` = max 3, status `NEW` or `VIEWED`, sorted by priority then `createdAt` desc.

Insights are generated by the Decision Engine from real data; the LLM may only rephrase them (PRD §12).

---

### 6.2 `GET /api/manager/booking-forecast`

**Query**

| Param | Type | Default | Notes |
|---|---|---|---|
| `days` | int 1–30 | `7` | Forecast horizon |
| `roomType` | `RoomType` | — | Optional filter |

**Tables:** `bookings`, `events` → ML `/predict/bookings`

**Response 200**

```json
{
  "data": {
    "currentBookings": 175,
    "totalRooms": 220,
    "points": [
      { "date": "2026-09-27", "predictedBookings": 182, "predictedOccupancy": 82.7 },
      { "date": "2026-09-28", "predictedBookings": 190, "predictedOccupancy": 86.4 },
      { "date": "2026-09-29", "predictedBookings": 198, "predictedOccupancy": 90.0 },
      { "date": "2026-09-30", "predictedBookings": 205, "predictedOccupancy": 93.2 },
      { "date": "2026-10-01", "predictedBookings": 212, "predictedOccupancy": 96.4 }
    ],
    "history": [
      { "date": "2026-09-24", "actualBookings": 168 },
      { "date": "2026-09-25", "actualBookings": 172 },
      { "date": "2026-09-26", "actualBookings": 175 }
    ],
    "confidence": 0.89,
    "modelVersion": "booking-xgb-v1",
    "predictionStatus": "AVAILABLE"
  }
}
```

`history` = last 7 days of actual bookings, for the "actual vs forecast" chart.

> **Backend decisions** ([backend/docs/decisions.md](../backend/docs/decisions.md)):
> - `predictedBookings` and `history[].actualBookings` both mean **confirmed (non-cancelled) arrivals for that date**. `currentBookings` = confirmed arrivals today (C-28).
> - `confidence` is `number | null`. ML v1 returns no confidence, so it is `null` until it does (C-03).
> - `roomType`: ML v1 forecasts the whole resort only. Until it supports room types, a supplied `roomType` returns `400 VALIDATION_ERROR` with `{ "field": "roomType", "issue": "not_supported" }`. It is never silently ignored (C-27).
> - If the ML forecast does not start tomorrow (resort timezone), it is treated as unavailable → `503` (C-04).

**Errors:** `400 VALIDATION_ERROR`, `503 ML_SERVICE_UNAVAILABLE`

---

### 6.3 `GET /api/manager/occupancy-forecast`

**Query:** same as §6.2 (`days`, `roomType`).

Occupancy = `predictedOccupiedRooms / totalRooms × 100` (architecture §9), calculated by Node from the booking forecast + room inventory.

> **Backend decision C-05** ([decisions.md](../backend/docs/decisions.md)): ML v1 does not return predicted occupied rooms, so the formula above cannot be applied. `predictedOccupancy` = the ML `predicted_occupancy_rate`, clamped to 0–100. Node supplies `totalRooms`, `peak` and `highOccupancyThreshold`. `lowerBound`/`upperBound` are omitted until ML provides bands (C-04). The `roomType` and forecast-date rules from §6.2 apply here too (C-27, C-04).

**Response 200**

```json
{
  "data": {
    "currentOccupancy": 82.0,
    "totalRooms": 220,
    "points": [
      { "date": "2026-09-27", "predictedBookings": 191, "predictedOccupancy": 87.0, "lowerBound": 84.1, "upperBound": 89.8 },
      { "date": "2026-09-28", "predictedBookings": 200, "predictedOccupancy": 91.0, "lowerBound": 87.5, "upperBound": 94.2 },
      { "date": "2026-09-29", "predictedBookings": 207, "predictedOccupancy": 94.0, "lowerBound": 90.3, "upperBound": 97.1 }
    ],
    "peak": { "date": "2026-09-29", "predictedOccupancy": 94.0 },
    "highOccupancyThreshold": 90,
    "modelVersion": "booking-xgb-v1",
    "predictionStatus": "AVAILABLE"
  }
}
```

`highOccupancyThreshold` comes from the Decision Engine config so the chart can draw the threshold line without hard-coding it.

**Errors:** `400 VALIDATION_ERROR`, `503 ML_SERVICE_UNAVAILABLE`

---

### 6.4 `GET /api/manager/cancellation-summary`

Aggregate only; no guest names (per-guest detail belongs to Operations, PRD §10).

**Query**

| Param | Type | Default |
|---|---|---|
| `days` | int 1–60 | `30` (upcoming arrivals window) |

**Tables:** `bookings` → ML `/predict/cancellation` (batch) / `predictions` cache

**Response 200**

```json
{
  "data": {
    "summary": {
      "total": 220,
      "low": 165,
      "medium": 38,
      "high": 17,
      "expectedCancellations": 29
    },
    "byChannel": [
      { "bookingChannel": "Online TA", "total": 120, "high": 12 },
      { "bookingChannel": "Direct", "total": 70, "high": 2 },
      { "bookingChannel": "Offline TA/TO", "total": 30, "high": 3 }
    ],
    "windowDays": 30,
    "modelVersion": "cancel-xgb-v1",
    "predictionStatus": "AVAILABLE"
  }
}
```

If ML is down: `summary.low/medium/high/expectedCancellations = null`, `total` stays, `predictionStatus = "UNAVAILABLE"`.

---

### 6.5 `GET /api/manager/room-demand`

Demand by room type (PRD §13 chart "Demand by Room Type").

**Query:** `days` int 1–30, default `7`.

**Tables:** `rooms`, `bookings`

**Response 200**

```json
{
  "data": [
    { "roomType": "STANDARD", "totalRooms": 100, "bookedRooms": 78, "availableRooms": 22, "occupancy": 78.0, "demandLevel": "MEDIUM", "demandChangePct": 4 },
    { "roomType": "DELUXE",   "totalRooms": 80,  "bookedRooms": 74, "availableRooms": 6,  "occupancy": 92.5, "demandLevel": "HIGH",   "demandChangePct": 15 },
    { "roomType": "SUITE",    "totalRooms": 40,  "bookedRooms": 23, "availableRooms": 17, "occupancy": 57.5, "demandLevel": "LOW",    "demandChangePct": -3 }
  ]
}
```

---

### 6.6 `GET /api/manager/recommendations`

**Query**

| Param | Type | Default |
|---|---|---|
| `status` | `RecommendationStatus`, comma-separated allowed | `NEW,VIEWED` |
| `priority` | `Priority` | — |
| `category` | `RecommendationCategory` | — |
| `page`, `pageSize` | int | `1`, `20` |

**Tables:** `recommendations`

**Response 200**

```json
{
  "data": [
    {
      "id": "7c1e...",
      "category": "OCCUPANCY",
      "priority": "HIGH",
      "title": "Prepare for high occupancy",
      "reason": "Predicted occupancy is 95% on 2026-09-29.",
      "suggestedAction": "Review housekeeping, front-desk and guest-service capacity.",
      "confidence": 0.89,
      "sourceData": { "predictedOccupancy": 95, "date": "2026-09-29" },
      "status": "NEW",
      "createdAt": "2026-09-26T06:00:00Z"
    },
    {
      "id": "9a4b...",
      "category": "CANCELLATION",
      "priority": "HIGH",
      "title": "Review high-risk bookings before peak occupancy",
      "reason": "High occupancy is forecast while 17 bookings have elevated cancellation risk.",
      "suggestedAction": "Review high-risk bookings and prepare operations for forecast demand.",
      "confidence": 0.84,
      "sourceData": { "highRiskCancellations": 17, "predictedOccupancy": 95 },
      "status": "NEW",
      "createdAt": "2026-09-26T06:00:00Z"
    },
    {
      "id": "b2d7...",
      "category": "PRICING",
      "priority": "MEDIUM",
      "title": "Review Deluxe room pricing",
      "reason": "Deluxe demand is HIGH and only 6 of 80 rooms (7.5%) remain available.",
      "suggestedAction": "Review Deluxe room pricing and availability strategy.",
      "confidence": 0.78,
      "sourceData": { "roomType": "DELUXE", "availableRooms": 6, "totalRooms": 80 },
      "status": "VIEWED",
      "createdAt": "2026-09-26T06:00:00Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 3, "totalPages": 1 }
}
```

Sorted by `priority` (HIGH → LOW), then `createdAt` desc.

---

### 6.7 `PATCH /api/manager/recommendations/:recommendationId`

Updates the recommendation lifecycle (decision-engine §21). `ACCEPTED` means "accepted for consideration" — **nothing is executed automatically**.

**Body**

```json
{ "status": "ACCEPTED" }
```

| Field | Type | Required |
|---|---|---|
| `status` | `VIEWED \| ACCEPTED \| DISMISSED` | ✓ |
| `note` | string, max 500 | — |

Allowed transitions:

```text
NEW     → VIEWED | ACCEPTED | DISMISSED
VIEWED  → ACCEPTED | DISMISSED
ACCEPTED, DISMISSED → (final)
```

**Response 200** `{ "data": Recommendation }` (updated)

**Errors:** `400 VALIDATION_ERROR`, `404 NOT_FOUND`, `409 CONFLICT` (invalid transition)

---

### 6.8 `GET /api/manager/pricing-recommendations` — P1

Suggested price reviews per room type. **Never** changes prices.

**Query:** `days` int, default `7`.

```json
{
  "data": [
    {
      "roomType": "DELUXE",
      "currentAdr": 8000,
      "suggestedAdr": 9200,
      "changePct": 15,
      "predictedOccupancy": 93.0,
      "demandLevel": "HIGH",
      "availability": "LOW",
      "reason": "Predicted occupancy is 93% with high demand and low availability."
    }
  ],
  "meta": { "predictionStatus": "AVAILABLE" }
}
```

---

### 6.9 `GET /api/manager/sentiment` — P1

**Query:** `period` = `7d | 30d | 90d` (default `30d`).

```json
{
  "data": {
    "period": "30d",
    "totalReviews": 412,
    "breakdown": { "positive": 68, "neutral": 20, "negative": 12 },
    "averageRating": 4.2,
    "topics": [
      { "topic": "AC", "negativeSharePct": 27, "changePct": 12, "trend": "UP" },
      { "topic": "Wi-Fi", "negativeSharePct": 12, "changePct": 4, "trend": "UP" },
      { "topic": "Cleanliness", "negativeSharePct": 8, "changePct": 1, "trend": "FLAT" }
    ]
  }
}
```

`breakdown` values are percentages. `trend`: `UP | DOWN | FLAT`.

---

## 7. Operations Manager API

All routes require `role = OPERATIONS_MANAGER`.
Backend file: `backend/src/routes/operations.routes.js` → `controllers/operations.controller.js`.

### 7.1 `GET /api/operations/dashboard`

**Response 200**

```json
{
  "data": {
    "arrivalsToday": 24,
    "departuresToday": 19,
    "inHouseGuests": 180,
    "upcomingArrivals7d": 142,
    "risk": { "high": 17, "medium": 38, "low": 165 },
    "specialRequirementsToday": 6,
    "todayArrivals": [
      {
        "id": "g-101",
        "name": "Rahul Sharma",
        "roomType": "DELUXE",
        "arrivalDate": "2026-09-26",
        "departureDate": "2026-09-29",
        "topPreference": "Spa",
        "cancellationProbability": 0.84,
        "riskLevel": "HIGH",
        "bookingStatus": "CONFIRMED"
      }
    ],
    "predictionStatus": "AVAILABLE"
  }
}
```

`todayArrivals` = up to 10 `GuestSummary` rows (§3), HIGH risk first.

---

### 7.2 `GET /api/operations/guests`

Guest table (PRD §22).

**Query**

| Param | Type | Default | Notes |
|---|---|---|---|
| `search` | string | — | Matches name or email (case-insensitive) |
| `arrivalFrom` | date | today | |
| `arrivalTo` | date | today + 7d | |
| `risk` | `RiskLevel` | — | |
| `roomType` | `RoomType` | — | |
| `status` | `BookingStatus` | — | |
| `sortBy` | `arrivalDate \| name \| cancellationProbability` | `arrivalDate` | |
| `sortOrder` | `asc \| desc` | `asc` | |
| `page`, `pageSize` | int | `1`, `20` | |

**Response 200**

```json
{
  "data": [
    {
      "id": "g-101",
      "name": "Rahul Sharma",
      "roomType": "DELUXE",
      "arrivalDate": "2026-09-28",
      "departureDate": "2026-10-01",
      "topPreference": "Spa",
      "cancellationProbability": 0.84,
      "riskLevel": "HIGH",
      "bookingStatus": "CONFIRMED"
    },
    {
      "id": "g-102",
      "name": "Priya Patel",
      "roomType": "SUITE",
      "arrivalDate": "2026-09-28",
      "departureDate": "2026-09-30",
      "topPreference": "Pool",
      "cancellationProbability": 0.12,
      "riskLevel": "LOW",
      "bookingStatus": "CONFIRMED"
    },
    {
      "id": "g-103",
      "name": "Arjun Mehta",
      "roomType": "DELUXE",
      "arrivalDate": "2026-09-29",
      "departureDate": "2026-10-02",
      "topPreference": "Restaurant",
      "cancellationProbability": 0.52,
      "riskLevel": "MEDIUM",
      "bookingStatus": "CONFIRMED"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 142, "totalPages": 8 }
}
```

---

### 7.3 `GET /api/operations/guests/:guestId`

Guest profile + current booking (PRD §16, §23). Preferences and predictions load separately (§7.5, §7.6).

**Response 200**

```json
{
  "data": {
    "profile": {
      "id": "g-101",
      "name": "Rahul Sharma",
      "email": "rahul.sharma@example.com",
      "phone": "+91 98765 43210",
      "foodPreference": "Vegetarian",
      "preferredRoom": "DELUXE",
      "averageStay": 3,
      "averageSpend": 12500,
      "specialRequirements": "Late check-in",
      "previousVisits": 3,
      "previousCancellations": 2,
      "createdAt": "2024-02-11T09:00:00Z"
    },
    "currentBooking": {
      "id": "bk-1452",
      "guestId": "g-101",
      "roomId": "r-214",
      "roomNumber": "214",
      "roomType": "DELUXE",
      "bookingDate": "2026-07-18",
      "arrivalDate": "2026-09-28",
      "departureDate": "2026-10-01",
      "nights": 3,
      "adults": 2,
      "children": 0,
      "babies": 0,
      "adr": 8500,
      "depositType": "No Deposit",
      "bookingChannel": "Online TA",
      "customerType": "Transient",
      "specialRequests": 1,
      "status": "CONFIRMED"
    },
    "activities": [
      { "id": "a-1", "activity": "Spa", "frequency": 4, "lastUsed": "2026-03-14" },
      { "id": "a-2", "activity": "Pool", "frequency": 3, "lastUsed": "2026-03-13" },
      { "id": "a-3", "activity": "Yoga", "frequency": 2, "lastUsed": "2025-12-02" }
    ]
  }
}
```

`currentBooking` = next upcoming or in-house booking, or `null`.

**Errors:** `404 NOT_FOUND`

---

### 7.4 `GET /api/operations/guests/:guestId/bookings`

Booking history (PRD §23 "History").

**Query:** `status` (`BookingStatus`), `page`, `pageSize`.

**Response 200** `{ "data": Booking[], "meta": PageMeta }` — sorted by `arrivalDate` desc.

---

### 7.5 `GET /api/operations/guests/:guestId/preferences`

Stored preferences (explicit + history-derived + predicted).

**Query:** `source` (`PreferenceSource`, optional).

**Response 200**

```json
{
  "data": [
    { "id": "p-1", "type": "ROOM",     "value": "Deluxe",     "confidence": null, "source": "EXPLICIT",  "updatedAt": "2026-03-10T00:00:00Z" },
    { "id": "p-2", "type": "FOOD",     "value": "Vegetarian", "confidence": 0.95, "source": "HISTORY",   "updatedAt": "2026-03-15T00:00:00Z" },
    { "id": "p-3", "type": "ACTIVITY", "value": "Spa",        "confidence": 0.87, "source": "PREDICTED", "updatedAt": "2026-09-26T06:00:00Z" }
  ]
}
```

---

### 7.6 `GET /api/operations/guests/:guestId/predictions`

Live ML output for this guest: cancellation for the current booking + preference predictions (PRD §17, §20).

**Response 200**

```json
{
  "data": {
    "guestId": "g-101",
    "cancellation": {
      "bookingId": "bk-1452",
      "cancellationProbability": 0.84,
      "riskLevel": "HIGH",
      "factors": [
        "Long booking lead time (72 days)",
        "Previous cancellation history (2)",
        "Booking channel: Online TA",
        "Deposit type: No Deposit"
      ],
      "modelVersion": "cancel-xgb-v1",
      "predictionStatus": "AVAILABLE"
    },
    "preferences": [
      { "type": "ROOM", "value": "Deluxe", "confidence": 0.91 },
      { "type": "ACTIVITY", "value": "Spa", "confidence": 0.87 },
      { "type": "FOOD", "value": "Vegetarian", "confidence": 0.95 }
    ],
    "summary": "Rahul Sharma's booking has an estimated 84% cancellation probability. If the booking remains active, his predicted preferences are a Deluxe room, vegetarian meals and spa activities.",
    "predictionStatus": "AVAILABLE",
    "generatedAt": "2026-09-26T10:15:00Z"
  }
}
```

- `cancellation` is `null` if the guest has no upcoming booking.
- `summary` is an optional LLM phrasing of the numbers above; it must use "estimated … probability" wording, never "will cancel" (PRD §21). It is `null` if the LLM is unavailable.
- **Backend decision C-08** ([decisions.md](../backend/docs/decisions.md)): ML v1 predicts only room type and meal plan. `preferences` therefore contains at most `ROOM` (after room-code mapping, C-07) and `FOOD` (meal plan: "Bed & Breakfast", "Half Board", "Full Board"). No `ACTIVITY` prediction is returned until the ML service provides one; activity preferences remain available from §7.5 (`HISTORY`/`EXPLICIT`) and §7.3 `activities`.
- `factors` = the PRD §20 factor set with the booking's actual values, e.g. `"Lead time: 72 days"`, `"Previous cancellations: 2"` (decision U-18).

---

### 7.7 `GET /api/operations/cancellation-risk`

Booking-level cancellation list (PRD §49).

**Query**

| Param | Type | Default |
|---|---|---|
| `risk` | `RiskLevel` | — (all) |
| `minProbability` | float 0–1 | — |
| `arrivalFrom` | date | today |
| `arrivalTo` | date | today + 30d |
| `page`, `pageSize` | int | `1`, `20` |

**Response 200**

```json
{
  "data": [
    {
      "bookingId": "bk-1452",
      "guestId": "g-101",
      "guestName": "Rahul Sharma",
      "roomType": "DELUXE",
      "arrivalDate": "2026-09-28",
      "leadTimeDays": 72,
      "bookingChannel": "Online TA",
      "depositType": "No Deposit",
      "adr": 8500,
      "cancellationProbability": 0.84,
      "riskLevel": "HIGH",
      "factors": ["Long booking lead time", "Previous cancellation history"]
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 17, "totalPages": 1, "predictionStatus": "AVAILABLE" }
}
```

Sorted by `cancellationProbability` desc.

---

### 7.8 `GET /api/operations/staffing` — P1

**Query:** `date` (default today).

```json
{
  "data": {
    "date": "2026-09-29",
    "predictedOccupancy": 94.0,
    "departments": [
      { "department": "HOUSEKEEPING", "required": 15, "available": 12, "shortage": 3 },
      { "department": "FRONT_DESK", "required": 6, "available": 6, "shortage": 0 }
    ]
  }
}
```

### 7.9 `GET /api/operations/sentiment` — P1

Same shape as §6.9, plus `recentNegativeReviews: [{ id, guestName, rating, excerpt, topics, createdAt }]` (max 10).

### 7.10 `GET /api/operations/service-requests` — P1

**Query:** `status` (`ServiceRequestStatus`), `priority`, `page`, `pageSize`.
**Response:** `{ "data": ServiceRequest[], "meta": PageMeta }`

### 7.11 `PATCH /api/operations/service-requests/:requestId` — P1

**Body:** `{ "status"?: ServiceRequestStatus, "priority"?: Priority }` (at least one).
**Response:** `{ "data": ServiceRequest }`

---

## 8. Guest API

All routes require `role = GUEST`. The guest is always taken from the JWT — **no guestId in path/body/query**.
Backend file: `backend/src/routes/guest.routes.js` → `controllers/guest.controller.js`.

A guest never receives: other guests' data, cancellation probabilities, revenue, staff data, or internal recommendations.

### 8.1 `GET /api/guest/profile`

**Response 200**

```json
{
  "data": {
    "id": "g-101",
    "name": "Rahul Sharma",
    "email": "rahul.sharma@example.com",
    "phone": "+91 98765 43210",
    "foodPreference": "Vegetarian",
    "preferredRoom": "DELUXE",
    "specialRequirements": "Late check-in",
    "previousVisits": 3
  }
}
```

Note: the guest view omits `averageSpend` and `previousCancellations`.

### 8.2 `GET /api/guest/preferences`

**Response 200** — same item shape as §7.5 but **only** `type`, `value`, `source` (no confidence numbers shown to guests):

```json
{
  "data": [
    { "type": "FOOD", "value": "Vegetarian", "source": "HISTORY" },
    { "type": "ACTIVITY", "value": "Spa", "source": "PREDICTED" },
    { "type": "ROOM", "value": "Deluxe", "source": "EXPLICIT" }
  ]
}
```

### 8.3 `GET /api/guest/bookings`

**Query:** `scope` = `upcoming | past | all` (default `upcoming`).

**Response 200** `{ "data": GuestBooking[] }` where `GuestBooking` is `Booking` **without** `adr`, `depositType`, `bookingChannel`, `customerType`.

### 8.4 `GET /api/guest/resort-info`

Verified resort knowledge (the same source the chatbot uses).

**Query:** `category` (`ResortInfoCategory`, optional), `search` (string, optional).

**Response 200**

```json
{
  "data": [
    { "id": "ri-1", "category": "SPA", "title": "Evening Spa Session", "content": "Available daily 5:00 PM – 9:00 PM at the Lotus Spa, Level 1.", "updatedAt": "2026-09-01T00:00:00Z" },
    { "id": "ri-2", "category": "POOL", "title": "Pool Timings", "content": "Main pool open 7:00 AM – 8:00 PM. Poolside relaxation area open till 10:00 PM.", "updatedAt": "2026-09-01T00:00:00Z" }
  ]
}
```

### 8.5 `POST /api/guest/chat`

AI Concierge (PRD §25–30). Flow: JWT → guest profile + preferences + activities → retrieve `resort_information` → LLM → validated reply.

**Body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `message` | string, 1–1000 chars | ✓ | |
| `conversationId` | string (UUID) | — | Omit to start a new conversation |

```json
{ "message": "What would you recommend for me this evening?" }
```

**Response 200**

```json
{
  "data": {
    "conversationId": "c-5f2a...",
    "messageId": "m-001",
    "reply": "Based on your preferences, I'd recommend the evening spa session (5:00 PM – 9:00 PM at the Lotus Spa). You may also enjoy the poolside relaxation area, open until 10:00 PM.",
    "grounded": true,
    "sources": [
      { "id": "ri-1", "category": "SPA", "title": "Evening Spa Session" },
      { "id": "ri-2", "category": "POOL", "title": "Pool Timings" }
    ],
    "usedPreferences": [
      { "type": "ACTIVITY", "value": "Spa" },
      { "type": "ACTIVITY", "value": "Pool" }
    ],
    "createdAt": "2026-09-26T10:15:00Z"
  }
}
```

**Fallback (no verified info)** — still `200`, `grounded: false`, `sources: []`:

```json
{
  "data": {
    "conversationId": "c-5f2a...",
    "messageId": "m-002",
    "reply": "I don't have verified information about that right now. Please contact the front desk for help.",
    "grounded": false,
    "sources": [],
    "usedPreferences": [],
    "createdAt": "2026-09-26T10:16:00Z"
  }
}
```

**Errors:** `400 VALIDATION_ERROR`, `429 RATE_LIMITED` (limit: 20 messages/min per guest), `503 AI_SERVICE_UNAVAILABLE`

The reply must never invent prices, timings, facilities, availability or policies (PRD §29).

### 8.6 `GET /api/guest/chat/history` — P1

**Query:** `conversationId` (required), `page`, `pageSize` (default 50).
**Response:** `{ "data": ChatMessage[], "meta": PageMeta }` — oldest first.

### 8.7 `GET /api/guest/service-requests` — P1

**Response:** `{ "data": ServiceRequest[] }` (own requests only, no `guestName`).

### 8.8 `POST /api/guest/service-requests` — P1

**Body:** `{ "requestType": string, "description": string (1–1000) }` — priority is set by the backend, not the guest.
**Response 201:** `{ "data": ServiceRequest }`

---

## 9. Internal ML Service API

Python / FastAPI. **Only the Node backend calls these.** The frontend never calls the ML service directly.

- Base URL: `ML_SERVICE_URL` (e.g. `http://localhost:8000/api/v1/ml`, see §9.0)
- Casing: **snake_case**
- Every prediction response includes `model_version`
- No envelope: responses are the plain object. Errors use FastAPI's default `{ "detail": ... }`; Node converts them to `ML_SERVICE_UNAVAILABLE` / `INTERNAL_ERROR`.
- Node timeout: 5s per call. On timeout Node treats the prediction as unavailable (§1.10).
- Model features and training details belong in [ml-contracts.md](./ml-contracts.md) (owned by the ML team). The request/response shapes below must not change without updating this file.

### 9.0 Implementation status (ML service v1.0.0)

The shapes in §9.1–9.6 are the **target** contract. The ML service as implemented (`ml-service/app/`, commit `796ce66`) differs. The backend adapter (`backend/src/services/mlService.js`) integrates with the **implemented** service. The public `/api/*` contract is unaffected. Full field mapping: [ml-contracts.md](./ml-contracts.md). Decisions: [backend/docs/decisions.md](../backend/docs/decisions.md).

| Target (this section) | Implemented v1 | Backend handling | Decision / change request |
|---|---|---|---|
| Base `ML_SERVICE_URL`, `GET /health` with model versions | All routes under `/api/v1/ml`; `/health` → `{status, service, models_loaded}` | `ML_SERVICE_URL` includes `/api/v1/ml`; healthy = `ok` + `models_loaded`; versions read from `GET /data/summary` | C-02 · CR-01, CR-02 |
| `POST /predict/bookings` | — (not implemented) | Bookings forecast taken from `GET /predict/occupancy` (`predicted_confirmed_bookings`) | C-03 · CR-03 |
| `POST /predict/occupancy` | `GET /predict/occupancy?days=1..90`, dates start after the training data's last date, no bounds | Occupancy = `predicted_occupancy_rate`; forecasts not starting tomorrow are treated as unavailable | C-04, C-05 · **CR-04 (blocking)** |
| `POST /predict/cancellation` (batch) | Single booking per call, different fields, global feature importances | One call per booking (bounded concurrency) + `predictions` cache; backend recomputes `riskLevel`; readable factors per U-18 | C-06, C-18 · CR-05 |
| `POST /predict/preferences` | `POST /predict/guest-preferences` → meal plan + room code | Mapped to `FOOD` / `ROOM`; no `ACTIVITY` | C-07, C-08 · CR-06 |
| `POST /predict/sentiment` (P1) | — | Not used in P0 | — |

### 9.1 `GET /health`

```json
{ "status": "ok", "models": { "booking": "booking-xgb-v1", "cancellation": "cancel-xgb-v1", "preference": "pref-v1" } }
```

### 9.2 `POST /predict/bookings`

**Request**

```json
{
  "start_date": "2026-09-27",
  "days": 7,
  "room_type": null,
  "current_bookings": 175,
  "historical_bookings": [ { "date": "2026-09-20", "bookings": 160 } ],
  "events": [ { "event_name": "Diwali", "event_date": "2026-11-08", "event_type": "FESTIVAL", "expected_demand": "HIGH" } ]
}
```

**Response**

```json
{
  "predictions": [
    { "date": "2026-09-27", "predicted_bookings": 182 },
    { "date": "2026-09-28", "predicted_bookings": 190 }
  ],
  "confidence": 0.89,
  "model_version": "booking-xgb-v1"
}
```

### 9.3 `POST /predict/occupancy`

**Request**

```json
{
  "total_rooms": 220,
  "predictions": [ { "date": "2026-09-27", "predicted_bookings": 182 } ]
}
```

**Response**

```json
{
  "predictions": [
    { "date": "2026-09-27", "predicted_occupancy": 82.7, "lower_bound": 80.1, "upper_bound": 85.2 }
  ],
  "model_version": "booking-xgb-v1"
}
```

### 9.4 `POST /predict/cancellation`

Accepts a batch (Node sends one or many).

**Request**

```json
{
  "bookings": [
    {
      "booking_id": "bk-1452",
      "lead_time": 72,
      "arrival_date": "2026-09-28",
      "room_type": "DELUXE",
      "adr": 8500,
      "adults": 2,
      "children": 0,
      "deposit_type": "No Deposit",
      "booking_channel": "Online TA",
      "customer_type": "Transient",
      "previous_cancellations": 2,
      "previous_bookings": 1,
      "special_requests": 1
    }
  ]
}
```

**Response**

```json
{
  "predictions": [
    {
      "booking_id": "bk-1452",
      "cancellation_probability": 0.84,
      "risk_level": "HIGH",
      "factors": ["lead_time", "previous_cancellations", "booking_channel", "deposit_type"]
    }
  ],
  "model_version": "cancel-xgb-v1"
}
```

`factors` are feature keys ordered by contribution; Node converts them to readable labels. `risk_level` must use the thresholds in §2.

> ML v1 returns `top_risk_factors` as **global** feature importances rather than per-booking contributions. Node therefore builds the public `factors` from the PRD §20 factor set and the booking's own values (decision U-18), and ignores ML `risk_level` in favour of §2 thresholds (C-18).

### 9.5 `POST /predict/preferences`

**Request**

```json
{
  "guest_id": "g-101",
  "previous_bookings": [ { "room_type": "DELUXE", "arrival_date": "2026-03-12", "nights": 3 } ],
  "activities": [ { "activity": "Spa", "frequency": 4 } ],
  "food_history": ["Vegetarian", "Vegetarian", "Vegetarian"]
}
```

**Response**

```json
{
  "guest_id": "g-101",
  "predicted_preferences": [
    { "type": "ROOM", "value": "Deluxe", "confidence": 0.91 },
    { "type": "ACTIVITY", "value": "Spa", "confidence": 0.87 },
    { "type": "FOOD", "value": "Vegetarian", "confidence": 0.95 }
  ],
  "model_version": "pref-v1"
}
```

### 9.6 `POST /predict/sentiment` — P1

**Request:** `{ "reviews": [ { "review_id": "rv-1", "review_text": "AC was not working..." } ] }`
**Response:** `{ "results": [ { "review_id": "rv-1", "sentiment": "NEGATIVE", "sentiment_score": 0.91, "topics": ["AC"] } ], "model_version": "sent-v1" }`

---

## 10. Superseded Names

Older docs use different names. **Do not implement these.** Use the canonical name.

| Seen in | Old name | Canonical |
|---|---|---|
| architecture.md §19 | `POST /api/concierge/chat` | `POST /api/guest/chat` |
| architecture.md §19 | `GET /api/concierge/context` | Not exposed. Context is built server-side inside `/api/guest/chat` |
| architecture.md §19 | `GET /api/predictions/bookings` | `GET /api/manager/booking-forecast` |
| architecture.md §19 | `GET /api/predictions/occupancy` | `GET /api/manager/occupancy-forecast` |
| architecture.md §19 | `GET /api/predictions/cancellations/:bookingId` | `GET /api/operations/cancellation-risk` / `GET /api/operations/guests/:guestId/predictions` |
| architecture.md §19 | `POST /api/predictions/run` | Not exposed. Predictions run on demand / via a backend job |
| architecture.md §19 | `GET /api/guests`, `GET /api/guests/:id`, `GET /api/guests/:id/preferences` | `GET /api/operations/guests`, `.../guests/:guestId`, `.../guests/:guestId/preferences` |
| architecture.md §19 | `GET /api/bookings`, `GET /api/bookings/:id` | `GET /api/operations/guests/:guestId/bookings` (ops) · `GET /api/guest/bookings` (guest) |
| architecture.md §19 | `POST /api/bookings` | Out of scope (PRD §60: no full booking engine) |
| architecture.md §19 | `GET /api/recommendations` | `GET /api/manager/recommendations` |
| architecture.md §19 | `POST /api/recommendations/:id/view\|accept\|dismiss` | `PATCH /api/manager/recommendations/:recommendationId` `{ "status": ... }` |
| decision-engine.md §22 | `PATCH /api/manager/recommendations/:id/view\|accept\|dismiss` | `PATCH /api/manager/recommendations/:recommendationId` `{ "status": ... }` |
| architecture.md §19 | `GET /api/operations/staff`, `GET /api/operations/workload` | `GET /api/operations/staffing` |
| prd.md §51 | `POST /predict/booking` | `POST /predict/bookings` |
| prd.md §55 | chat body `{ "guestId", "message" }` | `{ "message", "conversationId"? }` — guestId comes from the JWT |
| decision-engine.md §7 | `suggested_action`, `source` (public API) | `suggestedAction`, `sourceData` |
| architecture.md §10 | `risk_level` (public API) | `riskLevel` |

---

## 11. Contract Rules — Avoiding Merge Conflicts

### 11.1 Process

1. **Change the contract first.** Any new or changed endpoint is a PR that edits `docs/api.md` **before** (or together with) code.
2. **Additive only.** Adding endpoints, optional fields, or enum values is fine. Renaming or removing a path, field or enum value needs agreement from both the frontend and backend owners.
3. **Reserved names.** P1 paths in §4 are reserved. Don't reuse them for something else.
4. **Enums are appended, never reordered or renamed.**

### 11.2 File ownership (one owner per file)

**Backend** (`backend/src/`)

| File | Owns |
|---|---|
| `routes/index.js` | Mounts routers. Touched only when adding a new role router |
| `routes/auth.routes.js` + `controllers/auth.controller.js` | §5 |
| `routes/manager.routes.js` + `controllers/manager.controller.js` | §6 |
| `routes/operations.routes.js` + `controllers/operations.controller.js` | §7 |
| `routes/guest.routes.js` + `controllers/guest.controller.js` | §8 |
| `middleware/auth.js`, `middleware/roleCheck.js`, `middleware/errorHandler.js` | §1.5–1.9 |
| `services/mlService.js` | §9 client + snake_case ↔ camelCase mapping |
| `services/aiService.js` | LLM / chat |
| `decision-engine/` | Recommendations, insights |

Each role router applies its role guard once:

```js
// routes/index.js
router.use("/auth", authRoutes);
router.use("/manager", auth, roleCheck("RESORT_MANAGER"), managerRoutes);
router.use("/operations", auth, roleCheck("OPERATIONS_MANAGER"), operationsRoutes);
router.use("/guest", auth, roleCheck("GUEST"), guestRoutes);
```

**Frontend** (`frontend/src/`)

| File | Owns |
|---|---|
| `lib/api.ts` | Base fetch client only (token, envelope unwrap, errors) |
| `lib/auth-api.ts` | §5 |
| `lib/manager-api.ts` | §6 |
| `lib/operations-api.ts` | §7 |
| `lib/guest-api.ts` | §8 |
| `types/api.ts` | §3 models (copy from this file) |
| `lib/constants.ts` | §2 enums + thresholds (append only) |

**ML service** (`ml-service/app/`)

| File | Owns |
|---|---|
| `api/routes/*.py` | §9 endpoints, one file per model |
| `schemas/*.py` | Pydantic models matching §9 |

### 11.3 Endpoint → file checklist

When you add an endpoint, update in the same PR:

- [ ] `docs/api.md` (§4 index + detailed section)
- [ ] backend route + controller
- [ ] `frontend/src/types/api.ts` if a new model
- [ ] frontend role API module
- [ ] `docs/design.md` if a screen uses it

---

## 12. Environment Variables

| Variable | Used by | Example |
|---|---|---|
| `PORT` | backend | `5000` |
| `DATABASE_URL` | backend, ml-service (training only) | `postgresql://...` |
| `JWT_SECRET` | backend | long random string |
| `JWT_EXPIRES_IN` | backend | `1d` |
| `ML_SERVICE_URL` | backend | `http://localhost:8000/api/v1/ml` (includes the ML route prefix, §9.0) |
| `RESORT_TIMEZONE` | backend | `Asia/Kolkata` (used for "today" windows; assumption A-24, decisions.md) |
| `LLM_API_KEY` | backend | provider key |
| `LLM_MODEL` | backend | provider model id |
| `CORS_ORIGIN` | backend | `http://localhost:3000` |
| `NEXT_PUBLIC_API_BASE_URL` | frontend | `http://localhost:5000/api` |
| `NEXT_PUBLIC_USE_MOCKS` | frontend | `true` while backend isn't ready |

Secrets are never committed. Each service keeps a `.env.example` with keys only.
