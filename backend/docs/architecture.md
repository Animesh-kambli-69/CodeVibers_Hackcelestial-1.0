# Smart Resort 360 — Backend Architecture

> **Status:** Final for P0 implementation · 2026-09-26
> **Inputs:** `docs/api.md` (HTTP contract), `docs/architecture.md` (system), `docs/decision-engine.md`, `docs/database.md`, `docs/prd.md`, `docs/design.md`, [decisions.md](./decisions.md) (authoritative for conflicts), [requirements-map.md](./requirements-map.md).
> **Scope:** structure, boundaries and dependency rules for `backend/`. This is not a code listing.
> New architecture-level choices that no project document makes (mostly library choices) are marked **AD-xx** and collected in §27. They can be swapped without changing any boundary.

---

## 0. Non-negotiable principles and where they are enforced

| # | Principle | Source | Enforced by |
|---|---|---|---|
| P1 | **ML predicts** | PRD §39, §65 | Only `services/mlService.js` talks to the ML service; no model code in Node (§14) |
| P2 | **Business rules decide** | DE §3, §35 | `decision-engine/` is a pure, deterministic module; the only producer of recommendations (§16) |
| P3 | **LLM explains / converses** | PRD §12, §39 | Only `services/aiService.js` talks to the LLM. The Decision Engine cannot import it. LLM output is never persisted as a recommendation (§15) |
| P4 | **Backend owns authorization** | PRD §57, api.md §1.6 | Role guard mounted once per role router; frontend guard is UX only (§7) |
| P5 | **Guest identity comes only from the JWT** | api.md §1.5, §8 | Guest router rejects any `guestId` input (U-14); guest services receive `guestId` only from `req.auth` (§7.3) |
| P6 | **Frontend never calls ML** | api.md §9 | ML URL exists only in backend env; no pass-through endpoint (§14, §20) |
| P7 | **Frontend never calls the LLM** | ARCH §17, api.md §12 | LLM key exists only in backend env; the chat endpoint returns validated text, never raw provider output (§15) |
| P8 | **No automatic high-impact actions** | DE §5, §35.7; api.md §6.7 | Booking/room/guest repositories expose **no write methods** in P0. The recommendation lifecycle writes only the `recommendations` table (§11, §16.5) |
| P9 | **A failed prediction is never shown as valid** | ARCH §24; api.md §1.10 | `predictionService` is the single place that sets `predictionStatus`; no numeric fallbacks (§14.4) |
| P10 | **Concierge never invents facts** | PRD §29; DE §17 | Retrieval-gated LLM call plus output guard in `conciergeService` (§15.3, U-17) |

---

## 1. Runtime and framework

| Item | Choice | Source |
|---|---|---|
| Runtime | Node.js, active LTS ≥ 22 (native `fetch`, `AbortSignal.timeout`) | ARCH §5, TECH §2 (AD-01 fixes the version) |
| Language | JavaScript, **CommonJS** | decision C-25 |
| HTTP framework | Express | ARCH §5, TECH §2 |
| API style | REST + JSON, role-grouped under `/api` | api.md §1 |
| Database | PostgreSQL (hosted on Supabase) via `pg` (node-postgres) | TECH §4, decision C-12, AD-02 |
| Process model | One stateless HTTP process. No workers, no queues, no scheduler | TECH §8, decision C-13 |

---

## 2. Application entry point

Two files, split so tests can build the app without opening a port:

| File | Responsibility |
|---|---|
| `src/server.js` | Process entry. Loads config (fails fast on invalid env), creates the DB pool, calls `createApp(deps)`, starts listening on `PORT`, handles `SIGTERM`/`SIGINT` (stop accepting, drain, close pool), logs fatal startup errors |
| `src/app.js` | **Composition root.** `createApp(deps)` builds the Express app: registers middleware in the fixed order (§5), mounts `routes/index.js`, then the 404 handler and `errorHandler`. `deps` holds the DB pool, `mlService`, `aiService`, clock and logger. Tests inject fakes here (§25) |

The ARCH §5 listing names `server.js`. `app.js` is added for testability (AD-03).

---

## 3. Configuration management

| File | Holds | Rule |
|---|---|---|
| `src/config/env.js` | Reads and validates env vars once at startup: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ML_SERVICE_URL`, `LLM_API_KEY`, `LLM_MODEL`, `CORS_ORIGIN`, `RESORT_TIMEZONE`, `NODE_ENV`, `LOG_LEVEL` | api.md §12 names (+ `RESORT_TIMEZONE` per U-24). Missing required var → process exits with a clear message. Returns a frozen object. Nothing else reads `process.env` |
| `src/config/database.js` | Creates the `pg` Pool from `env` (SSL on in production for Supabase) | Only `app.js`/`server.js` and repositories receive the pool |
| `src/config/app.js` | Operational tunables: ML timeouts (5 s calls, 2 s health), cancellation concurrency (A-06a), concierge top-k (A-17), chat and login rate limits (api.md §8.5, U-19), body size limit, pagination defaults (api.md §1.8), LLM phrasing flag (U-04, default off) | Constants, not env, unless they differ per environment |
| `src/config/mlMapping.js` | ML boundary tables: room-code map (C-07, **empty until decided**), meal-plan labels (C-08), `ML_ADR_INR_PER_UNIT` (C-19/A-19), PRD §20 factor labels (U-18) | Only `mlService` imports it |
| `src/decision-engine/config/thresholds.js` | `RULE_CONFIG` (DE §10) + `recommendationRefreshMinutes` (A-13a) + demand bands (U-03) | Single source for every business threshold. Imported by the Decision Engine and by the few services that expose thresholds (`highOccupancyThreshold`, risk classification) |

`.env` files are never committed. `backend/.env.example` lists keys only (api.md §12).

---

## 4. HTTP / server layer

- `/api` is the single mount point (api.md §1.1). No version prefix.
- JSON only. Request bodies are capped (AD-04: 16 kB; the largest body, chat, is ≤ 1000 characters).
- Success envelope `{ data, meta? }` and error envelope `{ error: { code, message, details? } }` (api.md §1.7) are produced only by `utils/respond.js` and `middleware/errorHandler.js`.
- `trust proxy` is enabled in production so rate limits and logs see the client IP behind Render/Railway (ARCH §25).

---

## 5. Middleware layer

Global order (registered in `app.js`):

| # | Middleware | File | Purpose |
|---|---|---|---|
| 1 | Request ID | `middleware/requestId.js` | Accepts or creates `X-Request-Id`; attaches it to `req` and the response |
| 2 | HTTP logger | `middleware/requestLogger.js` | One structured log line per request (§18) |
| 3 | Security headers | `helmet` (AD-05) | ARCH §23 |
| 4 | CORS | `cors` restricted to `CORS_ORIGIN` | api.md §12 |
| 5 | JSON body parser | Express `json({ limit })` | §4 |
| 6 | Router | `routes/index.js` | §8 |
| 7 | 404 | `middleware/notFound.js` | Unmatched route → `404 NOT_FOUND` |
| 8 | Error handler | `middleware/errorHandler.js` | §17 (always last) |

Per-route middleware, applied in this order inside routers:

`authenticate` → `requireRole(role)` → `rejectGuestIdInput` (guest router only) → `rateLimit` (where required) → `validate(schema)` → controller.

---

## 6. Authentication middleware

| Item | Design | Source |
|---|---|---|
| File | `middleware/auth.js` (`authenticate`) | api.md §11.2 |
| Token | `Authorization: Bearer <JWT>`, HS256, signed with `JWT_SECRET`, expiry `JWT_EXPIRES_IN` (api.md example `1d`; `expiresIn: 86400`) | api.md §1.5, §5.2 |
| Payload | `{ userId, role, guestId, exp }`. `guestId` is non-null only for `GUEST` | api.md §1.5 |
| Result | Sets `req.auth = { userId, role, guestId }` (frozen). Nothing else on `req` carries identity | P5 |
| Failures | Missing, malformed, bad signature or expired token → `401 UNAUTHORIZED` (no detail about which) | api.md §1.9 |
| Statefulness | Stateless. Logout is client-side (api.md §5.3). No denylist in P0 | api.md §5.3 |
| Libraries | `jsonwebtoken` (AD-06); password hashing `bcryptjs`, cost 10 (U-21, AD-07) in `utils/password.js` | — |
| Login flow | `authService.login`: user by email → bcrypt compare → for `GUEST`, resolve linked `guests.id` (missing → `500`, U-14) → sign token. Unknown email and wrong password return the **same** `401 INVALID_CREDENTIALS` | api.md §5.2 |

---

## 7. Authorization / RBAC

### 7.1 Role guard

`middleware/roleCheck.js` → `requireRole(role)`. A wrong role → `403 FORBIDDEN`. Mounted **once per router** in `routes/index.js` (api.md §11.2), so no individual route can forget it.

| Prefix | Middleware chain | Role |
|---|---|---|
| `/api/health` | none | public |
| `/api/auth/login` | `rateLimit(login)` | public |
| `/api/auth/register` (P1) | `rateLimit(login)` | public (C-16) |
| `/api/auth/logout`, `/api/auth/me` | `authenticate` | any authenticated |
| `/api/manager/*` | `authenticate`, `requireRole('RESORT_MANAGER')` | RESORT_MANAGER |
| `/api/operations/*` | `authenticate`, `requireRole('OPERATIONS_MANAGER')` | OPERATIONS_MANAGER |
| `/api/guest/*` | `authenticate`, `requireRole('GUEST')`, `rejectGuestIdInput` | GUEST |

There are exactly three roles; no role inherits another (PRD §5, §71). A manager cannot call operations routes and vice versa.

### 7.2 Data-level rules

| Rule | Mechanism |
|---|---|
| Manager sees aggregates only; no guest identifiers in cancellation summary or recommendations | `cancellationService.summary` returns counts only; recommendation `sourceData` is built from aggregate values only (C-14) |
| Guest never receives cancellation probability, revenue, staff data, internal recommendations or other guests' data (api.md §8) | Guest controllers use **guest view mappers** (§12.2). These are allow-lists; the guest router imports no manager/operations service that returns such data |
| Guest sees a reduced profile, preferences and bookings (api.md §8.1–8.3) | Separate `toGuest*` view mappers |

### 7.3 Guest identity isolation

1. `authenticate` puts `guestId` from the verified token into `req.auth`.
2. `rejectGuestIdInput` returns `400 VALIDATION_ERROR` (`issue: "not_allowed"`) if `guestId` appears in path, query or body on any `/api/guest/*` route (U-14).
3. Guest controllers pass `req.auth.guestId` as an explicit argument. Services and repositories used for guest data require `guestId` and always include it in the `WHERE` clause.
4. Conversation ownership: `chatRepository` looks conversations up by `(id, guest_id)`. A miss is `404` whether or not the conversation exists (U-16).

---

## 8. Route structure

Role-based, exactly as api.md §11.2. **No resource-based routers** (`bookingRoutes`, `predictionRoutes` … from ARCH §5/§19 are superseded, C-23/C-24).

| File | Mounts | Endpoints (P0) | P1 (not mounted until approved) |
|---|---|---|---|
| `routes/index.js` | all routers + role guards | — | — |
| `routes/health.routes.js` | `/health` | `GET /health` | — |
| `routes/auth.routes.js` | `/auth` | `POST /login`, `POST /logout`, `GET /me` | `POST /register` |
| `routes/manager.routes.js` | `/manager` | `GET /dashboard`, `/booking-forecast`, `/occupancy-forecast`, `/cancellation-summary`, `/room-demand`, `/recommendations`; `PATCH /recommendations/:recommendationId` | `/pricing-recommendations`, `/sentiment` |
| `routes/operations.routes.js` | `/operations` | `GET /dashboard`, `/guests`, `/guests/:guestId`, `/guests/:guestId/bookings`, `/guests/:guestId/preferences`, `/guests/:guestId/predictions`, `/cancellation-risk` | `/staffing`, `/sentiment`, `/service-requests`, `PATCH /service-requests/:requestId` |
| `routes/guest.routes.js` | `/guest` | `GET /profile`, `/preferences`, `/bookings`, `/resort-info`; `POST /chat` | `GET /chat/history`, `GET`/`POST /service-requests` |

Route files contain only wiring: path, per-route middleware, validator and controller function. P1 paths stay unregistered, so they return `404` until they are built. Their names are reserved (api.md §11.1).

---

## 9. Controller responsibilities

One controller file per router (api.md §11.2): `health.controller.js`, `auth.controller.js`, `manager.controller.js`, `operations.controller.js`, `guest.controller.js`.

| A controller **does** | A controller **does not** |
|---|---|
| Read already-validated `req.params/query/body` and `req.auth` | Touch the DB, ML or LLM |
| Call one or more services with explicit arguments | Contain business rules, thresholds or formulas |
| Pick the role-appropriate view mapper (§12.2) | Build SQL, sort orders or ML payloads |
| Send the response via `utils/respond.js` (`ok`, `created`, `paginated`) | Catch errors except to pass them to `next` (async wrapper) |

Controllers are thin, so the same service (for example cancellation scoring) can serve manager (aggregate) and operations (detail) with different views.

---

## 10. Service responsibilities

Services are organised **by domain**, not by role. They take plain arguments and return plain objects in camelCase, and they have no knowledge of Express.

| Service | Responsibility | Depends on |
|---|---|---|
| `authService` | Login, token signing, `me` | `userRepository`, `guestRepository`, `utils/password`, `utils/jwt` |
| `healthService` | DB `SELECT 1`, ML health (2 s), LLM configured (U-20) | pool, `mlService`, `aiService` |
| `predictionService` | **Prediction gateway:** cache-first read-through (C-11), sets `predictionStatus`, forecast date check (C-04), risk classification with `RULE_CONFIG` (C-18), bounded-concurrency cancellation scoring (C-06) | `mlService`, `predictionRepository`, `decision-engine` (classifier only), `utils/dates` |
| `forecastService` | Booking and occupancy forecast responses: history, `currentBookings`, `peak`, `totalRooms`, threshold (C-05, C-28) | `predictionService`, `bookingRepository`, `roomRepository` |
| `cancellationService` | Manager summary (aggregate) and operations risk list (detail), readable factors (U-18) | `predictionService`, `bookingRepository` |
| `roomDemandService` | Per-room-type demand (U-03) | `roomRepository`, `bookingRepository` |
| `kpiService` | Manager KPIs (U-01…U-03) and operations dashboard counts (U-06) | `bookingRepository`, `roomRepository`, `forecastService`, `cancellationService`, `recommendationRepository` |
| `recommendationService` | Run trigger and freshness (C-13), **build resort state**, invoke the Decision Engine, persist with `dedup_key`, list/filter, lifecycle transitions (api.md §6.7) | `decision-engine`, `recommendationRepository`, `forecastService`, `cancellationService`, `roomDemandService` |
| `insightService` | Deterministic insight lines from KPIs + triggered rules (U-04); optional LLM rephrasing behind a flag | `aiService` (optional) |
| `guestIntelligenceService` | Operations guest list (U-07), profile (U-08), history, stored preferences, predictions + optional LLM summary (api.md §7.6) | `guestRepository`, `bookingRepository`, `preferenceRepository`, `activityRepository`, `predictionService`, `aiService` |
| `guestSelfService` | Guest's own profile, preferences, bookings (always scoped by `guestId`) | `guestRepository`, `preferenceRepository`, `bookingRepository` |
| `resortInfoService` | List/filter/search verified resort info (C-17) | `resortInfoRepository` |
| `conciergeService` | Chat orchestration (§15.3) | `guestSelfService`, `activityRepository`, `resortInfoRepository`, `chatRepository`, `aiService` |
| `mlService` *(integration)* | HTTP client for the ML service (§14) | `config/env`, `config/mlMapping`, `utils/http`. **No repositories** |
| `aiService` *(integration)* | Provider-agnostic LLM client (§15) | `config/env`, `utils/http`. **No repositories** |

`mlService.js` and `aiService.js` stay in `services/`, where api.md §11.2 puts them. They are **integration services**: they may not import repositories or other services.

---

## 11. Repository responsibilities

One repository per table group, in `src/repositories/`. Repositories:

- run **parameterized SQL** through the injected pool (ARCH §23);
- map rows snake_case → camelCase exactly once, using `models/` mappers (api.md §1.3);
- accept filters as typed values; sort columns come from a **whitelist**, never from raw input;
- return domain objects or `null`, and never throw HTTP errors (services decide what "not found" means);
- expose `withTransaction(fn)` via `repositories/db.js` for multi-statement writes.

| Repository | Table(s) | Write methods allowed in P0 |
|---|---|---|
| `userRepository` | `users` | none (register is P1) |
| `guestRepository` | `guests` | **none** |
| `roomRepository` | `rooms` | **none** |
| `bookingRepository` | `bookings` | **none**. There is no booking engine (PRD §60) |
| `preferenceRepository` | `guest_preferences` | none (U-09) |
| `activityRepository` | `guest_activities` | none |
| `resortInfoRepository` | `resort_information` | none |
| `recommendationRepository` | `recommendations` | insert (by `dedup_key`, ignore on conflict), update `status`/`note`/`updated_at` **only** |
| `predictionRepository` | `predictions` | insert, read latest by `(prediction_type, entity_id)` |
| `chatRepository` | `chat_conversations`, `chat_messages` | create conversation, append messages |
| *(P1)* `reviewRepository`, `serviceRequestRepository`, `staffRepository`, `operationsRepository` | — | defined when P1 is approved |
| *(deferred)* `eventRepository` | `events` | not built until CR-03: ML v1 does not consume events (C-03) |

**Rule P8:** the only mutable business tables in P0 are `recommendations`, `predictions` and chat. Accepting a recommendation physically cannot change prices, bookings or staffing, because no code path can write those tables.

---

## 12. Model / entity responsibilities

`src/models/` holds **data shape knowledge only**. It has no I/O and no dependencies.

### 12.1 Entity modules (`models/<entity>.js`)

- Enum constants copied from api.md §2 (the single backend source for `Role`, `RiskLevel`, `BookingStatus`, `RoomType`, …), exported frozen.
- `fromRow(row)`: DB row → camelCase domain object (used only by repositories).
- Derived fields that are pure functions of one entity (for example `nights` from dates).

### 12.2 View mappers (`models/views/`)

Explicit **allow-list** mappers per audience. They add fields; they never delete them.

| Mapper | Used by | Excludes (api.md) |
|---|---|---|
| `toGuestProfileSelf` | guest | `averageSpend`, `previousCancellations` (§8.1) |
| `toGuestPreferenceSelf` | guest | `id`, `confidence`, `updatedAt` (§8.2) |
| `toGuestBookingSelf` | guest | `adr`, `depositType`, `bookingChannel`, `customerType` (§8.3) |
| `toGuestSummary`, `toGuestProfile`, `toBooking`, `toCancellationRow` | operations | internal ML columns such as `country` and `distribution_channel` (C-06, C-20) |
| `toRecommendation`, `toKpis`, … | manager | guest identifiers |

The allow-list approach means a new DB column can never leak to a guest by accident.

---

## 13. Validator structure

| Item | Design |
|---|---|
| Library | `zod` (AD-08): coerces query strings, gives typed errors |
| Files | `validators/common.js` (UUID, `YYYY-MM-DD` date, pagination, enum helpers from `models/`), plus one file per router: `auth.validators.js`, `manager.validators.js`, `operations.validators.js`, `guest.validators.js` |
| Middleware | `middleware/validate.js` → `validate({ params, query, body })`. It replaces `req.*` with the parsed values; on failure, `400 VALIDATION_ERROR` with `details: [{ field, issue }]` (api.md §1.7) |
| Rules source | api.md parameter tables: ranges (`days` 1–30 / 1–60), enums, lengths (`message` 1–1000, `note` ≤ 500, `search` ≤ 100 per U-15), `arrivalFrom ≤ arrivalTo`, `sortBy` whitelist |
| Unknown fields | Rejected on bodies, stripped on queries; `guestId` on guest routes is handled by `rejectGuestIdInput` (§7.3) |
| Business validation | Not in validators (for example recommendation transition legality → `recommendationService` → `409`) |

---

## 14. ML integration boundary

### 14.1 Placement

```text
controllers ─► domain services ─► predictionService ─► mlService ─HTTP─► FastAPI ML (external)
                                        │
                                        └──► predictionRepository (cache)
```

- `mlService.js` is the **only** file that knows ML URLs, field names, snake_case or the room-code map. It is the implementation of the api.md §9 client and follows the implemented contract in `docs/ml-contracts.md` (C-02…C-08).
- **No ML logic in Node:** no model loading, no feature engineering beyond input field mapping (dates → lead time, weekend nights), no probability computation.
- The ML service is reachable only from the backend. There is no public route that proxies it (P6). Its network exposure is C-29 (open).

### 14.2 `mlService` contract (functions, not code)

| Function | Calls | Returns (camelCase) |
|---|---|---|
| `health()` | `GET /health` (2 s) | `{ ok, modelsLoaded }` |
| `modelVersions()` | `GET /data/summary` (cached) | `{ cancellation, occupancy, preferences }` as `"<model>@<version>"` (A-02) |
| `forecastOccupancy(days)` | `GET /predict/occupancy?days=` | `[{ date, predictedBookings, predictedOccupancy }]` |
| `scoreCancellation(booking)` | `POST /predict/cancellation` | `{ probability, globalFactorOrder, omittedFeatures }` |
| `predictPreferences(guestContext)` | `POST /predict/guest-preferences` | `[{ type, value, confidence }]` (ROOM/FOOD only, C-08) |

### 14.3 Error translation

Timeout (5 s), connection error, non-2xx or schema mismatch → `MlUnavailableError`. `mlService` never returns partial or default numbers.

### 14.4 Prediction status (single owner: `predictionService`)

| Situation | `predictionStatus` | Values |
|---|---|---|
| Cache row < 24 h | `AVAILABLE` | cached |
| Fresh ML result | `AVAILABLE` | fresh (written to cache) |
| ML fails, cache ≥ 24 h exists | `STALE` | cached |
| ML fails, no cache | `UNAVAILABLE` | `null` |
| Forecast's first date ≠ tomorrow in `RESORT_TIMEZONE` | `UNAVAILABLE` | `null` (C-04) |

Endpoints that return **only** predictions turn `UNAVAILABLE` into `503 ML_SERVICE_UNAVAILABLE`; mixed endpoints return `200` with nulls (api.md §1.10).

---

## 15. LLM integration boundary

### 15.1 Placement

`services/aiService.js` is the only LLM client. The provider is **OPEN (C-15)**, so the interface is provider-neutral:

| Function | Used by | Failure behaviour |
|---|---|---|
| `generateGroundedReply({ question, guestContext, sources })` | `conciergeService` | throws `AiUnavailableError` → `503 AI_SERVICE_UNAVAILABLE` |
| `rephrase({ text, constraints })` | `insightService` (flag, off by default), `guestIntelligenceService` (`summary`) | returns `null`; the caller keeps the deterministic text or sets `summary: null` |
| `isConfigured()` | `healthService` | — |

### 15.2 What the LLM may and may not do

| May | May not |
|---|---|
| Phrase a reply from supplied resort-info snippets + allowed guest fields | Be called by the Decision Engine |
| Rephrase a deterministic insight/summary without changing numbers | Create, rank, prioritise or alter a recommendation |
| — | Receive other guests' data, cancellation probabilities, spend, staff data, internal recommendations or credentials |
| — | Have its raw output returned without validation |

### 15.3 Concierge pipeline (`conciergeService`)

```text
req.auth.guestId
  → load own profile, preferences, activities, current booking (guest-scoped)
  → verify conversationId ownership / create conversation
  → retrieve resort_information (Postgres full-text + category, top-k)      [C-17]
  → none retrieved? → fixed fallback text, grounded:false, no LLM call      [U-17]
  → build prompt: system rules (PRD §29) + delimited sources + allow-listed guest fields
                  + guest message as untrusted, delimited input              [prompt-injection guard]
  → aiService.generateGroundedReply (timeout)
  → output guard: times/prices/numbers not present in sources/context → fallback  [U-17]
  → compute usedPreferences ⊆ guest's stored preferences
  → persist guest message + assistant reply in one transaction              [C-09]
  → ChatReply
```

On LLM failure nothing is persisted and the client gets `503` (the design keeps the message in the input box).

---

## 16. Decision Engine boundary

### 16.1 Placement and purity

`src/decision-engine/` follows DE §23:

```text
decision-engine/
├── index.js                 generateRecommendations(state, config) → Recommendation drafts
├── config/thresholds.js     RULE_CONFIG
├── rules/                   occupancyRule, cancellationRule, pricingRule*, staffingRule*, sentimentRule*, maintenanceRule*
├── services/                validateState, evaluateRules, prioritize, deduplicate
└── classify.js              classifyRisk(p), demandLevel(occ)  (pure helpers reused by predictionService/kpis)
```

`*` = requires P1/stretch data; present only as rules that return nothing when their inputs are absent (DE §33).

**The Decision Engine is a pure function.** It does no I/O, no DB, no ML, no LLM, no clock (the date is passed in state) and no Express. The same state always yields the same drafts (DE §35.1).

### 16.2 Pipeline ownership (DE §11)

| Step | Owner |
|---|---|
| 1. Build resort state | `recommendationService` (from forecast, cancellation and room-demand services) |
| 2. Validate inputs (ranges, nulls) | `decision-engine/services/validateState` |
| 3. Load rule config | `decision-engine/config/thresholds` |
| 4–6. Evaluate, generate, prioritise | `decision-engine` |
| 7. Deduplicate within run (DE §19, C-14) | `decision-engine/services/deduplicate` |
| 8. Persist, dedup across runs via `dedup_key` (C-13) | `recommendationService` → `recommendationRepository` |
| 9. Return | `recommendationService` |
| 10. Optional LLM explanation | presentation only, never persisted as the recommendation |

### 16.3 P0 rules

R1 high occupancy · R2/R3 cancellation risk (aggregate, C-14) · R4 high demand + low availability · R9 high occupancy + high-risk count. R5–R8 and maintenance are inert without data.

### 16.4 Trigger (C-13)

`recommendationService.ensureFresh()` is called by `GET /manager/dashboard` and `GET /manager/recommendations`. It runs when the last run is older than `recommendationRefreshMinutes`. An in-process in-flight promise serialises concurrent runs. Restarts and multiple instances are safe because inserts are idempotent on `dedup_key`.

### 16.5 Lifecycle

`recommendationService.updateStatus(id, status, note)` enforces `NEW → VIEWED | ACCEPTED | DISMISSED` and `VIEWED → ACCEPTED | DISMISSED`; final states are immutable (`409 CONFLICT`). It writes **only** the recommendation row (P8).

---

## 17. Error handling boundary

| Layer | Throws | Never |
|---|---|---|
| Validators | `ValidationError` (details) | — |
| Repositories | raw DB errors only | HTTP errors |
| `mlService` / `aiService` | `MlUnavailableError` / `AiUnavailableError` | provider/raw errors upward |
| Services | `NotFoundError`, `ConflictError`, `ForbiddenError`, `InvalidCredentialsError`, the integration errors above | Express `res` |
| Middleware / controllers | pass to `next(err)` | format error bodies themselves |

`utils/errors.js` defines `AppError(code, httpStatus, message, details?)` and the subclasses above, one per api.md §1.9 code.

`middleware/errorHandler.js` is the **only** place error envelopes are built:

- `AppError` → its status + code.
- JSON parse error → `400 VALIDATION_ERROR`.
- Anything else, including DB errors → `500 INTERNAL_ERROR` with a generic message. The stack is logged with `requestId`, never returned.
- Rate limiter → `429 RATE_LIMITED`.

---

## 18. Logging / observability boundary

| Item | Design |
|---|---|
| Logger | `pino` JSON to stdout (AD-09) via `utils/logger.js`; the host's log viewer is the sink (no new infrastructure, TECH §8) |
| Per request | `requestId`, method, route pattern, status, duration, `role` (never the token) |
| Integrations | One log per ML/LLM call: target, duration, outcome (`ok`/`timeout`/`error`), `predictionStatus` |
| Decision Engine | One log per run: rules fired, drafts, inserted, skipped duplicates |
| Redaction | `authorization`, `password`, `token`, `LLM_API_KEY`; chat content is logged as length only; guest emails/phones are not logged |
| Health | `GET /api/health` reports `database`/`ml`/`llm` (api.md §5.1) |
| Out of scope | Metrics backends, tracing, APM (not documented) |

---

## 19. Database access strategy

| Item | Design | Source |
|---|---|---|
| Driver | `pg` Pool, `DATABASE_URL` | api.md §12, AD-02 |
| ORM | None: plain parameterized SQL in repositories | ARCH §23, TECH §8 |
| Supabase | PostgreSQL hosting only. **Not** Supabase Auth, **not** the Supabase JS client | C-12 |
| Casing | snake_case columns, mapped once in repositories | api.md §1.3 |
| Transactions | `withTransaction` for chat persistence, recommendation batch insert and register (P1) | — |
| Idempotency | `recommendations.dedup_key` unique + `ON CONFLICT DO NOTHING` | C-13 |
| Schema | Versioned SQL migrations in `backend/db/migrations/`, applied by `npm run db:migrate`; schema per `docs/database.md` + decisions.md §4 | AD-10 (see concern AC-01) |
| Seed | `backend/db/seeds/` via `npm run db:seed`; never writes prediction values (U-22) | U-22 |
| Time | `TIMESTAMPTZ` stored in UTC; date windows computed in `RESORT_TIMEZONE` by `utils/dates.js` | api.md §1.4, U-24 |

---

## 20. External service communication

| Target | Protocol | Timeout | Retries | Credentials | Caller |
|---|---|---|---|---|---|
| PostgreSQL / Supabase | TCP (pg), SSL in production | pool defaults | none | `DATABASE_URL` | repositories |
| ML service | HTTP JSON, snake_case | 5 s per call (api.md §9), 2 s health | **none** (bounded latency; fall back to cache) | none today (C-29) | `mlService` only |
| LLM provider | HTTPS, provider API | ⚠ UNDEFINED (AD-11 proposes 15 s) | none | `LLM_API_KEY`, `LLM_MODEL` | `aiService` only |

All outbound HTTP goes through `utils/http.js` (native `fetch` + `AbortSignal.timeout`, logs duration). No other module calls `fetch`.

---

## 21. Request lifecycle

```text
HTTP request
  → requestId → requestLogger → helmet → cors → json parser
  → routes/index.js  (/api/<role> prefix)
      → authenticate            401 on failure
      → requireRole(role)       403 on failure
      → rejectGuestIdInput      (guest only) 400
      → rateLimit               (login, chat) 429
      → validate(schema)        400
      → controller              reads req.auth + parsed input
          → service(s)          business logic, thresholds, orchestration
              → repositories    parameterized SQL → camelCase
              → predictionService → mlService (HTTP)   (cache, status)
              → decision-engine (pure)
              → aiService (HTTP)                       (chat / optional phrasing)
          ← plain result
      ← view mapper (role allow-list)
  → utils/respond → { data, meta? }
  (any throw) → errorHandler → { error: { code, message, details? } }
```

## 22. Response lifecycle

1. The service returns camelCase domain data, with `predictionStatus` where predictions are involved.
2. The controller applies the role-specific view mapper (§12.2).
3. `respond.ok | created | paginated` wraps the result as `{ data }` / `{ data, meta }`. Pagination meta follows api.md §1.8.
4. `requestLogger` records status and duration.
5. Errors skip steps 2–3 and are formatted only by `errorHandler`.

The frontend never sees snake_case keys (api.md §1.3), ML field names, provider responses or stack traces.

---

## 23. Dependency direction

### 23.1 Layer rule

```text
routes ─► middleware, validators, controllers
controllers ─► services, models/views, utils/respond
services ─► repositories, other domain services, predictionService,
            mlService*, aiService*, decision-engine, config, models, utils
predictionService ─► mlService, predictionRepository, decision-engine/classify
repositories ─► repositories/db (pool), models (fromRow)
decision-engine ─► its own config only
mlService / aiService ─► config, utils/http, utils/logger
models ─► nothing
config ─► nothing (env.js reads process.env)
utils ─► config (logger level) only
```

`*` Domain services reach `mlService` **only through `predictionService`**. `aiService` is called only by `conciergeService`, `insightService` and `guestIntelligenceService`.

### 23.2 Allowed / forbidden matrix (✓ allowed · ✗ forbidden)

| From ↓ / To → | routes | middleware | controllers | services | predictionService | mlService | aiService | decision-engine | repositories | models | config | Express req/res |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| routes | — | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| controllers | ✗ | ✗ | — | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |
| domain services | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ (3 listed) | ✓ | ✓ | ✓ | ✓ | ✗ |
| predictionService | ✗ | ✗ | ✗ | ✗ | — | ✓ | ✗ | ✓ (classify) | ✓ (predictions) | ✓ | ✓ | ✗ |
| mlService / aiService | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| decision-engine | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **✗** | — | ✗ | ✓ (enums) | own config | ✗ |
| repositories | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (db) | ✓ | ✓ | ✗ |
| middleware | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |

Key prohibitions:

- **decision-engine ✗ aiService**: P3.
- **repositories ✗ services**: no upward calls.
- **controllers ✗ repositories**: no business logic bypass.
- **guest controller ✗ manager/operations services** that return internal data (P5, §7.2).
- **No module except `mlService` knows ML field names; no module except `aiService` knows the provider.**

Enforcement: code review checklist + `eslint-plugin-import` `no-restricted-paths` zones (AD-12) + tests in §25.

---

## 24. Folder structure

```text
backend/
├── package.json
├── .env.example                  keys only (api.md §12)
├── db/
│   ├── migrations/               NNN_<name>.sql (AD-10)
│   └── seeds/                    demo scenario (U-22)
├── docs/                         requirements-map.md · decisions.md · architecture.md · task.md (next)
├── src/
│   ├── server.js                 process entry
│   ├── app.js                    createApp(deps) — composition root
│   ├── config/                   env.js · database.js · app.js · mlMapping.js
│   ├── routes/                   index.js · health · auth · manager · operations · guest (.routes.js)
│   ├── controllers/              health · auth · manager · operations · guest (.controller.js)
│   ├── middleware/               requestId · requestLogger · auth · roleCheck · rejectGuestIdInput
│   │                             rateLimit · validate · notFound · errorHandler
│   ├── validators/               common · auth · manager · operations · guest (.validators.js)
│   ├── services/                 authService · healthService · predictionService · forecastService
│   │                             cancellationService · roomDemandService · kpiService
│   │                             recommendationService · insightService · guestIntelligenceService
│   │                             guestSelfService · resortInfoService · conciergeService
│   │                             mlService (integration) · aiService (integration)
│   ├── decision-engine/          index.js · classify.js · config/ · rules/ · services/
│   ├── repositories/             db.js · user · guest · room · booking · preference · activity
│   │                             resortInfo · recommendation · prediction · chat (Repository.js)
│   ├── models/                   <entity>.js (enums, fromRow) · views/ (role allow-lists)
│   └── utils/                    errors · respond · asyncHandler · logger · http · jwt · password
│                                 dates · pagination
└── tests/
    ├── unit/                     decision-engine · validators · models/views · utils · mlService mapping
    ├── service/                  services with fake repos / fake ML / fake AI
    ├── integration/              repositories against test Postgres
    ├── api/                      supertest against createApp(), stubbed ML/LLM
    ├── contract/                 mlService vs recorded ML v1 responses (ml-contracts.md)
    └── fixtures/                 seed-like data, ML/LLM stubs
```

Existing scaffold folders are reused as they are. `backend/db/` is new (AC-01).

---

## 25. Testing boundaries

| Level | Target | Real | Faked | Examples (from requirements-map §3) |
|---|---|---|---|---|
| Unit | `decision-engine`, `classify`, validators, view mappers, `mlService` payload mapping, `utils/dates`, output guard | everything in-process | nothing external | rule boundaries 90/90.01, 0.40/0.70, 0.10, count 10/11; determinism; guest view omits forbidden keys |
| Service | domain services | service code | repositories, `mlService`, `aiService`, clock | `predictionService` AVAILABLE/STALE/UNAVAILABLE; dedup across runs; transition matrix; concierge fallback without LLM call |
| Repository (integration) | SQL | a Postgres test database (migrations applied) | — | filters, whitelisted sort, guest scoping in `WHERE`, `ON CONFLICT` on `dedup_key` |
| API | full HTTP stack via `createApp(deps)` + `supertest` (AD-13) | routes → repositories on test DB | `mlService`/`aiService` injected stubs | 401/403 per router, cross-guest attempts, `guestId` injection → 400, envelope shapes, 429, ML down → nulls/503, LLM down → 503 / `summary: null` |
| Contract | `mlService` ↔ ML v1 | recorded ML responses; optional live run against the real ML service | — | detects ML contract drift (C-02…C-08) |

Test runner: Jest (AD-13). Tests never call the real LLM. The live-ML contract run is opt-in.

---

## 26. P0 verification checklist

Every P0 feature from [requirements-map.md §3](./requirements-map.md) mapped to the architecture.

| Req | Feature | Route (router) | Service(s) | Repositories | External | Supported | Notes / blockers |
|---|---|---|---|---|---|---|---|
| F-00 | Auth & RBAC | auth.routes + per-router guards | authService | user, guest | — | ✅ | §6, §7 |
| F-01 | Health | health.routes | healthService | pool | ML, LLM config | ✅ | U-20 |
| F-02 | ML integration | — | predictionService, mlService | prediction | ML | ✅ | Contract per ml-contracts.md |
| F-03 | Decision Engine | — | recommendationService + decision-engine | recommendation | — | ✅ | R1/R4/R9 inert until **CR-04** (C-04) |
| F-04 | LLM integration | — | aiService | — | LLM | ✅ structurally | Provider **C-15** open |
| F-05 | Manager dashboard | manager | kpiService, insightService, recommendationService | booking, room, recommendation | ML | ✅ | Predicted values null until CR-04 |
| F-06 | Booking forecast | manager | forecastService | booking, room | ML | ✅ | 503 until CR-04; `roomType` → 400 (C-27) |
| F-07 | Occupancy forecast | manager | forecastService | room | ML | ✅ | as F-06; C-05 |
| F-08 | Cancellation summary | manager | cancellationService | booking | ML | ✅ | Aggregate only (§7.2) |
| F-09 | Room demand | manager | roomDemandService | room, booking | — | ✅ | C-07 irrelevant (DB enum) |
| F-10 | Recommendations + lifecycle | manager | recommendationService | recommendation | — | ✅ | P8 by construction (§11) |
| F-13 | Operations dashboard | operations | kpiService, cancellationService | booking, guest, preference | ML | ✅ | U-06 |
| F-14 | Guest list | operations | guestIntelligenceService | guest, booking, preference, prediction | ML (cached) | ✅ | U-07; whitelist sort |
| F-15 | Guest profile / history / preferences | operations | guestIntelligenceService | guest, booking, activity, preference | — | ✅ | U-08 |
| F-16 | Guest predictions | operations | guestIntelligenceService, predictionService, aiService | booking, guest, activity | ML, LLM | ✅ | ROOM prediction dropped until **C-07**; FOOD only (C-08); summary null without LLM |
| F-17 | Cancellation risk list | operations | cancellationService | booking, guest | ML | ✅ | U-18 factors |
| F-20 | Guest self data | guest | guestSelfService | guest, preference, booking | — | ✅ | allow-list views (§12.2), §7.3 |
| F-21 | Resort info | guest | resortInfoService | resortInfo | — | ✅ | C-17 |
| F-22 | AI Concierge | guest | conciergeService, aiService | chat, resortInfo, activity (+ guestSelfService) | LLM | ✅ structurally | Live replies need **C-15**; C-09 tables |

Principle checks:

| Check | Where satisfied | ✓ |
|---|---|---|
| Role-based routers only (api.md §11.2) | §8 | ✓ |
| ML predicts; no ML in Node | §14.1 | ✓ |
| Business rules decide; deterministic, pure engine | §16.1 | ✓ |
| LLM explains/converses only; the engine cannot reach it | §15.2, §23.2 | ✓ |
| Backend owns authorization | §7 | ✓ |
| Guest identity only from JWT | §7.3 | ✓ |
| Frontend never calls ML / LLM | §14.1, §15, §20 | ✓ |
| No automatic high-impact actions | §11 (no write methods), §16.5 | ✓ |
| Failed prediction never shown as valid | §14.4 | ✓ |
| Casing mapped once per boundary | §11, §14.1 | ✓ |
| P1 not leaking into P0 | §8 (unmounted), §11 (P1 repos not built) | ✓ |

---

## 27. Architecture decisions introduced here (need team acknowledgement)

No project document picks these. They are the minimum needed to build, and each is replaceable inside one layer.

| ID | Decision | Alternative |
|---|---|---|
| AD-01 | Node.js active LTS ≥ 22 | Node 20 |
| AD-02 | `pg` (node-postgres), no ORM | Supabase JS client (rejected: C-12, and it adds a second data path) |
| AD-03 | `app.js` / `server.js` split with `createApp(deps)` injection | single `server.js` |
| AD-04 | JSON body limit 16 kB | Express default 100 kB |
| AD-05 | `helmet`, `cors`, `express-rate-limit` (memory store) | — |
| AD-06 | `jsonwebtoken` HS256 | — |
| AD-07 | `bcryptjs` (pure JS, avoids native builds on Windows dev machines) | `bcrypt` |
| AD-08 | `zod` validators | `joi`, `express-validator` |
| AD-09 | `pino` logging | `winston` |
| AD-10 | SQL migrations in `backend/db/migrations` + small runner script | root `database/schema.sql` (ARCH §26) — see AC-01 |
| AD-11 | LLM call timeout 15 s ⚠ | depends on provider (C-15) |
| AD-12 | `eslint` + `eslint-plugin-import` `no-restricted-paths` to enforce §23 | review only |
| AD-13 | Jest + supertest | Vitest / node:test |

---

## 28. Unresolved architecture concerns

| ID | Concern | Impact | Needed from |
|---|---|---|---|
| AC-01 | ARCH §26 suggests a root `database/` folder (`schema.sql`, `seed.sql`), and `scripts/seed/` exists. This design keeps migrations and seeds in `backend/db/` because the backend is the only schema owner. ML training also reads `DATABASE_URL` (api.md §12), but read-only | Folder location only | Team: confirm or move |
| AC-02 | Rate-limit counters and the Decision Engine "last run" live in process memory: correct for **one instance** only. Data stays correct across instances (dedup is DB-enforced), but limits become per-instance | Deployment topology | Confirm single backend instance (ARCH §25) |
| AC-03 | api.md has no error code for "database unavailable"; it surfaces as `500 INTERNAL_ERROR` and `health.database: "down"` | Frontend shows a generic error | api.md owner (optional new code) |
| AC-04 | LLM provider (C-15) and timeout (AD-11) undecided | Concierge integration tests | Team lead |
| AC-05 | Repository/API tests need a PostgreSQL test database. No infrastructure is documented (local Postgres or a separate Supabase project). No Docker requirement is introduced | Test setup in Phase 1 | Team |
| AC-06 | Stateless JWT: role changes or deleted users take effect only at token expiry (≤ 1 day); logout has no server effect (accepted by api.md §5.3) | Security posture | Accepted unless a denylist is required |
| AC-07 | Decisions still open elsewhere that the architecture isolates but cannot remove: **C-01** (docs on branch), **C-04/CR-04** (forecast dates), **C-07** (room map), **C-19/A-19** (ADR factor), **C-29** (ML exposure) | Feature completeness, not structure | See decisions.md §8 |
| AC-08 | `design.md` §2 allows a JWT in an httpOnly cookie set by a Next route handler. The backend reads **only** the `Authorization` header, so a cookie flow must forward it as a Bearer token. CORS stays without credentials | Frontend auth wiring | Frontend owner |
| AC-09 | The prediction cache has no invalidation hook, because bookings are read-only. Reseeding needs `npm run db:seed` to clear `predictions` | Demo resets | Covered in seed script |
