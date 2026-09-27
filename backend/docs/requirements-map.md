  # Smart Resort 360 — Backend Requirements Map

  > **Status:** Phase 1 (read) + Phase 2 (extract) complete. **No implementation has started.**
  > This file derives backend requirements from the project-level docs. It does not add product behaviour.
  > Where the docs are silent, the gap is logged as **UNDEFINED** with a minimal **ASSUMPTION** marked `⚠ confirm`.
  > Where the docs disagree, the conflict is logged in [§5 Documentation Conflicts / Decisions Required](#5-documentation-conflicts--decisions-required).

  ---

  ## 0. How to read this file

  | Tag | Meaning |
  |---|---|
  | `[API §x]` | `docs/api.md` (backend branch) — declares itself the single source of truth for HTTP contracts |
  | `[DESIGN §x]` | `docs/design.md` (backend branch) |
  | `[PRD §x]` | `docs/prd.md` **full version on `origin/main`** (1333 lines) |
  | `[PRD-short]` | `docs/prd.md` on `backend` branch (235-line overview) |
  | `[ARCH §x]` | `docs/architecture.md` **full version on `origin/main`** (1606 lines) |
  | `[ARCH-short]` | `docs/architecture.md` on `backend` branch (263-line overview) |
  | `[DB §x]` | `docs/database.md` on `origin/main` (stub on `backend`) |
  | `[DE §x]` | `docs/decision-engine.md` on `origin/main` (stub on `backend`) |
  | `[FEAT]`, `[TECH]`, `[WF]` | `features.md`, `tech_stack.md`, `development_workflow.md` (backend branch only) |
  | `[ML-impl]` | Code on `origin/main` under `ml-service/app/` (commit `796ce66`) |
  | `C-nn` | Conflict / decision ID in §5 |
  | `U-nn` | Undefined item in §6 |

  **Precedence rule used in this file** (from `[API]` header and `[API §10]`): for endpoint paths, field names, casing and enums, `api.md` wins over prd/architecture/decision-engine. For product scope and business rules, PRD → decision-engine → architecture, unless `api.md` records a later explicit decision.

  ---

  ## 1. Phase 1 — Source inventory

  ### 1.1 Documents read

  | Doc | `backend` branch | `origin/main` | Used as |
  |---|---|---|---|
  | prd.md | 235 lines (overview) | 1333 lines (role-based PRD, §1–§71 + secondary features) | main = primary |
  | architecture.md | 263 lines (overview) | 1606 lines (§1–§31) | main = primary |
  | database.md | stub (3 lines) | 545 lines | main only |
  | decision-engine.md | stub | 1223 lines | main only |
  | api.md | 1593 lines | stub | backend only |
  | design.md | 799 lines | absent | backend only |
  | ml-contracts.md | stub | stub | **empty on both** |
  | demo.md | stub | stub | **empty on both** (demo scenario taken from PRD §63, DESIGN §14) |
  | features.md, tech_stack.md, development_workflow.md | present | absent | supporting |
  | phases.md, requirements.md, ADRs | absent | absent | — |

  `api.md` cites section numbers (`PRD §57`, `ARCH §24`, `DE §21`) that exist **only** in the `origin/main` versions. It was therefore written against the main-branch docs, and those are treated as the requirements baseline. See **C-01**.

  ### 1.2 Product understanding (summary)

  - **Purpose:** AI decision-support layer over resort data. Not a PMS. Data → Prediction → Decision Engine → Recommendation → Human decision `[PRD §1, §65; ARCH §1]`.
  - **Roles (exactly three):** `RESORT_MANAGER`, `OPERATIONS_MANAGER`, `GUEST` `[PRD §5; API §2]`.
  - **MVP loops:** manager intelligence loop, operations guest-intelligence loop, guest concierge loop `[PRD §62, §68]`.
  - **Hard principles the backend must enforce:**
    1. ML predicts; business rules decide; the LLM only explains/converses `[PRD §39, §65; DE §3]`.
    2. No automatic high-impact actions (prices, bookings, staff) `[DE §5, §35.7; API §6.7]`.
    3. Probabilities are never phrased as certainty `[PRD §21]`.
    4. A failed prediction is never shown as a valid one `[ARCH §24; API §1.10]`.
    5. The concierge never invents prices/timings/facilities/availability/policies/activities `[PRD §29; DE §17]`.
    6. Guests never see other guests' data, revenue, staff data, cancellation probabilities or internal recommendations `[PRD §57; DB §10; API §8]`.
  - **Out of scope:** full PMS, payments, payroll, ERP, booking engine, automated pricing, IoT, multi-property `[PRD §60; PRD-short §8]`.

  ### 1.3 What already exists in the repo

  | Area | State |
  |---|---|
  | `backend/src/*` | Empty scaffold (`config, controllers, decision-engine/rules, middleware, models, repositories, routes, services, utils, validators`), `backend/tests/` |
  | ML service | **Implemented on `origin/main`**, not on this branch: FastAPI, 3 trained models, routes under `/api/v1/ml/*` `[ML-impl]` |
  | Frontend | Placeholders only |
  | DB schema / seed | None (`scripts/seed/` empty) |

  ---

  ## 2. Backend responsibilities (derived)

  From `[PRD §34; ARCH §5; ARCH-short §4; API §11.2]`, the Node/Express backend owns:

  | # | Responsibility | Source |
  |---|---|---|
  | R1 | Authentication (login, token issue/verify) | PRD §34, API §5 |
  | R2 | Role-based authorization; guest identity from JWT only | PRD §57, API §1.5–1.6 |
  | R3 | REST API in the role-grouped shape of `api.md` | API §4 |
  | R4 | Database access through a repository layer; snake_case ↔ camelCase mapping in one place | API §1.3 |
  | R5 | ML service client + snake_case mapping + timeout + degraded-prediction handling | API §1.10, §9 |
  | R6 | Deriving `riskLevel` from probability with the canonical thresholds (not trusting the ML label) | API §2 |
  | R7 | Occupancy calculation from forecast + room inventory | ARCH §9, API §6.3 |
  | R8 | Decision Engine: rules, priority, dedup, persistence, lifecycle | DE §4, §11, §19–21 |
  | R9 | Insight generation for the dashboard (template-based; LLM may only rephrase) | API §6.1, PRD §12 |
  | R10 | LLM client for concierge and optional phrasing (guest-prediction summary) | API §7.6, §8.5 |
  | R11 | Concierge orchestration: guest context + resort-info retrieval + grounding + response validation | PRD §28–29, §34; DE §16–17 |
  | R12 | Request validation, error envelope, status codes | API §1.7–1.9, PRD §58 |
  | R13 | Rate limiting (chat, login) | API §1.9, §8.5; ARCH §23 |
  | R14 | Health endpoint that reports DB / ML / LLM status | API §5.1 |
  | R15 | Secrets via env only; `.env.example` with keys | API §12, PRD §58 |

  The backend must **not**: contain ML model code `[ARCH-short §9]`, let the LLM make decisions `[ARCH-short §9; PRD §12]`, expose the ML service to the frontend `[API §9]`, implement booking creation `[API §10]`.

  ---

  ## 3. Phase 2 — Feature → backend requirement map

  Each block follows: **Feature → responsibility → DB entities → endpoints → authorization → validation → errors → external integrations → tests.**
  Priority is from `[API §4]` (P0 = hackathon MVP).

  ### 3.0 Cross-cutting foundations

  #### F-00 Authentication & RBAC — P0

  | Dimension | Requirement |
  |---|---|
  | Product requirement | Login for all three roles; role-based access; guest can never reach another guest's data `[PRD §57, §70]` |
  | Backend responsibility | Verify credentials against `users.password_hash`; issue JWT `{userId, role, guestId, exp}`; `auth` middleware; `roleCheck(role)` per router; `/me`; stateless logout |
  | DB entities | `users`, `guests` (to resolve `guestId` for `GUEST`) |
  | Endpoints | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` (P0); `POST /api/auth/register` (P1) |
  | Authorization | login public; logout/me any authenticated; register public (see **C-16**) |
  | Validation | `email` valid email; `password` string min 6 `[API §5.2]` |
  | Errors | `400 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `429 RATE_LIMITED`, `409 CONFLICT` (register) |
  | External | none (see **C-12** on Supabase Auth) |
  | Tests | valid login per role; wrong password; unknown email (same error, no enumeration); malformed body; expired/invalid token → 401; wrong role on each router → 403; guest token `guestId` present, staff token `guestId` null; register always creates `GUEST` even if `role` is sent |

  #### F-01 Health — P0

  | Dimension | Requirement |
  |---|---|
  | Responsibility | Report `database`, `ml`, `llm` as `ok | down` + timestamp `[API §5.1]` |
  | DB entities | none (connectivity check) |
  | Endpoint | `GET /api/health` (public) |
  | Errors | Always 200 with per-service status (U-20) |
  | External | ML `/health`; LLM (see U-20) |
  | Tests | all-up; ML down → `ml: "down"` and still 200; DB down |

  #### F-02 ML integration layer (internal) — P0

  | Dimension | Requirement |
  |---|---|
  | Responsibility | Single `services/mlService.js`: HTTP client, 5 s timeout, snake_case ↔ camelCase, convert FastAPI `{detail}` errors, mark predictions `UNAVAILABLE`, optional `STALE` cache via `predictions` table `[API §1.10, §9]` |
  | DB entities | `predictions` (cache; DB §9 lists it as "later" — **C-11**) |
  | External | ML service (contract **heavily in conflict** — **C-02 … C-08**) |
  | Tests | contract tests against a stubbed ML server; timeout → UNAVAILABLE; 5xx → UNAVAILABLE; cached <24 h → AVAILABLE from cache or fresh; >24 h → STALE; never a numeric fallback value |

  #### F-03 Decision Engine — P0

  | Dimension | Requirement |
  |---|---|
  | Responsibility | Build resort state → validate → load `RULE_CONFIG` → evaluate rules → priority → dedup → persist → return `[DE §11]`. Deterministic, explainable, data-backed, configurable, no hidden actions `[DE §35]` |
  | Rules in P0 scope | R1 high occupancy (`predicted > 90`), R2/R3 cancellation risk (aggregated — **C-14**), R4 high demand + low availability (`≤ 0.10`), R9 high occupancy + high-risk count (`> 10`) `[DE §10, §12]` |
  | Rules gated on P1/stretch data | R5 staff shortage, R6 sentiment, R7 sentiment+maintenance, R8 occupancy+staff, maintenance — **must skip silently when inputs are missing** `[DE §33]` |
  | DB entities | `recommendations` (+ fields needed for dedup — **C-10**), reads `bookings`, `rooms` |
  | Endpoints | none of its own; feeds `/api/manager/dashboard` and `/api/manager/recommendations` |
  | Validation | Input ranges: occupancy 0–100, probability 0–1, counts ≥ 0 `[DE §34]` |
  | Errors | Missing input → no recommendation for that rule (not an error) `[DE §33]` |
  | External | LLM optional for phrasing only; never generates a recommendation `[PRD §12]` |
  | Tests | table-driven per rule (boundary: 90 vs 90.01, 0.70, 0.40, 0.10, count 10 vs 11); same input → same output; dedup of R1+R9; null prediction → no occupancy rec; re-run does not duplicate an open recommendation |
  | Trigger | **UNDEFINED** — **C-13** |

  #### F-04 LLM integration layer (internal) — P0

  | Dimension | Requirement |
  |---|---|
  | Responsibility | Single `services/aiService.js`: provider client, timeout, prompt assembly, output validation; used by concierge (F-16) and optional phrasing (F-12 summary, F-02 insights) |
  | External | LLM provider — **UNDEFINED** (**C-15**) |
  | Errors | provider down → `503 AI_SERVICE_UNAVAILABLE` for chat; `summary: null` for guest predictions `[API §7.6, §8.5]` |
  | Tests | provider stubbed; timeout path; prompt contains only retrieved resort info + allowed guest fields |

  ---

  ### 3.1 Resort Manager features

  #### F-05 Executive / Manager Dashboard — P0

  | Dimension | Requirement |
  |---|---|
  | Product requirement | KPIs (current occ, predicted occ, upcoming bookings, booking demand, high cancellation risk, AI recs) + AI insights + top recommendations `[PRD §7, §13]` |
  | Responsibility | Aggregate KPIs; call forecast (next day) + cancellation batch; run/read Decision Engine; produce ≤ 4 insights from templates; return top 3 `NEW|VIEWED` recs sorted by priority then `createdAt` desc `[API §6.1]` |
  | DB entities | `bookings`, `rooms`, `recommendations` (+ `predictions` cache) |
  | Endpoint | `GET /api/manager/dashboard` |
  | Authorization | `RESORT_MANAGER` |
  | Validation | none (no params) |
  | Errors | ML down → 200 with prediction fields `null` + `predictionStatus: UNAVAILABLE` `[API §1.10]` |
  | External | ML (occupancy, cancellation), LLM optional (insight rephrasing only) |
  | Tests | full payload shape; ML down → nulls not zeros; `activeRecommendations` counts NEW+VIEWED; top-3 sort order |
  | Undefined | `currentOccupancy`, `upcomingBookings` window, `bookingDemand` + `bookingDemandChangePct` formulas, insight templates — **U-01…U-04** |

  #### F-06 Booking Forecast — P0

  | Dimension | Requirement |
  |---|---|
  | Product requirement | Predict future booking demand, show actual vs forecast `[PRD §8]` |
  | Responsibility | Load last 7 days actuals (`history`), call ML forecast, map to `points[]`, return `currentBookings`, `totalRooms`, `confidence`, `modelVersion` `[API §6.2]` |
  | DB entities | `bookings`, `rooms`, `events` |
  | Endpoint | `GET /api/manager/booking-forecast?days=1..30&roomType=` |
  | Authorization | `RESORT_MANAGER` |
  | Validation | `days` int 1–30 default 7; `roomType ∈ RoomType` |
  | Errors | `400 VALIDATION_ERROR`; ML down → `503 ML_SERVICE_UNAVAILABLE` (prediction-only endpoint) |
  | External | ML — implemented service has no `/predict/bookings`, no `roomType`, forecasts from dataset end date — **C-03, C-04, C-07** |
  | Tests | shape; `days` bounds (0, 31, "abc"); ML down → 503; dates start tomorrow |
  | Undefined | definition of an "actual booking" per day for `history` — **U-05** |

  #### F-07 Occupancy Forecast — P0

  | Dimension | Requirement |
  |---|---|
  | Product requirement | Convert booking prediction into occupancy forecast; graph; presented as forecast `[PRD §9; ARCH §9]` |
  | Responsibility | `occupancy = predictedOccupiedRooms / totalRooms × 100`; compute `peak`; expose `highOccupancyThreshold` from `RULE_CONFIG` `[API §6.3]` |
  | DB entities | `rooms`, `bookings` |
  | Endpoint | `GET /api/manager/occupancy-forecast?days=&roomType=` |
  | Authorization | `RESORT_MANAGER` |
  | Validation | as F-06 |
  | Errors | `400`, `503 ML_SERVICE_UNAVAILABLE` |
  | External | ML — **C-05** (who computes occupancy), **C-04** (bounds not provided) |
  | Tests | occupancy clamp 0–100; `peak` is max; threshold equals config value |

  #### F-08 Cancellation Summary (manager) — P0

  | Dimension | Requirement |
  |---|---|
  | Product requirement | Aggregate low/medium/high counts for upcoming bookings; no per-guest detail `[PRD §10, §32]` |
  | Responsibility | Select upcoming `CONFIRMED` bookings in window; batch-score; bucket with **backend** thresholds (HIGH ≥ 0.70, MEDIUM ≥ 0.40); `expectedCancellations = round(Σp)`; `byChannel` breakdown `[API §6.4]` |
  | DB entities | `bookings`, `guests` (for previous-cancellation features), `predictions` cache |
  | Endpoint | `GET /api/manager/cancellation-summary?days=1..60` (default 30) |
  | Authorization | `RESORT_MANAGER`; response must contain **no guest identifiers** |
  | Validation | `days` 1–60 |
  | Errors | ML down → 200, `total` kept, buckets `null`, `UNAVAILABLE` |
  | External | ML cancellation — single-booking only in impl (**C-06**); performance risk for 220 calls (**C-06**) |
  | Tests | threshold boundaries 0.3999/0.40/0.6999/0.70; no `guestId`/`name` keys anywhere in payload; ML-down shape |

  #### F-09 Room Demand — P0

  | Dimension | Requirement |
  |---|---|
  | Product requirement | "Demand by Room Type" chart `[PRD §13]` |
  | Responsibility | Per `RoomType`: total, booked, available, occupancy, `demandLevel`, `demandChangePct` `[API §6.5]` |
  | DB entities | `rooms`, `bookings` |
  | Endpoint | `GET /api/manager/room-demand?days=1..30` |
  | Authorization | `RESORT_MANAGER` |
  | Errors | `400` |
  | External | none (DB only) |
  | Undefined | `demandLevel` / `demandChangePct` formula — **U-03**; room-type taxonomy — **C-07** |
  | Tests | sums: booked + available = total; every `RoomType` present even with 0 bookings |

  #### F-10 Recommendations & lifecycle — P0

  | Dimension | Requirement |
  |---|---|
  | Product requirement | Overall AI recommendations; human decides; ACCEPTED ≠ executed `[PRD §11–12; DE §21]` |
  | Responsibility | List with filters + pagination; PATCH status with transition guard `NEW→VIEWED|ACCEPTED|DISMISSED`, `VIEWED→ACCEPTED|DISMISSED`, finals immutable; store optional `note` `[API §6.6–6.7]` |
  | DB entities | `recommendations` (needs `note`, `updated_at` — **C-10**) |
  | Endpoints | `GET /api/manager/recommendations`, `PATCH /api/manager/recommendations/:recommendationId` |
  | Authorization | `RESORT_MANAGER` |
  | Validation | `status` list of `RecommendationStatus` (comma-separated), `priority`, `category` enums; `page ≥ 1`, `pageSize 1–100`; path param UUID; body `status ∈ {VIEWED, ACCEPTED, DISMISSED}`, `note ≤ 500` |
  | Errors | `400`, `404 NOT_FOUND`, `409 CONFLICT` (illegal transition) |
  | External | none |
  | Tests | every legal and illegal transition; NEW default filter; sort order; non-UUID id → 400; PATCH has **no side effects** on bookings/prices/staff |

  #### F-11 Pricing Recommendations — P1

  | Dimension | Requirement |
  |---|---|
  | Responsibility | Per room type: current vs suggested ADR, reason; never changes prices `[API §6.8; DE §14]` |
  | Endpoint | `GET /api/manager/pricing-recommendations?days=` |
  | Undefined | suggested-price formula (DE §14 gives only an example ₹8,000 → ₹9,200) — **U-10** |

  #### F-12 Guest Sentiment (manager + operations) — P1

  | Dimension | Requirement |
  |---|---|
  | Responsibility | Aggregate `reviews` by period; topic trends; ops variant adds last 10 negative reviews `[API §6.9, §7.9]` |
  | DB entities | `reviews` |
  | Endpoints | `GET /api/manager/sentiment`, `GET /api/operations/sentiment` |
  | External | ML `/predict/sentiment` — **not implemented** in `[ML-impl]` |
  | Undefined | `trend` UP/DOWN/FLAT threshold, when reviews get scored — **U-11** |

  ---

  ### 3.2 Operations Manager features

  #### F-13 Operations Dashboard — P0

  | Dimension | Requirement |
  |---|---|
  | Responsibility | Arrivals/departures today, in-house, 7-day arrivals, risk distribution (30 d), special requirements today, ≤ 10 today's arrivals HIGH-risk first `[API §7.1]` |
  | DB entities | `bookings`, `guests`, `guest_preferences`, `predictions` |
  | Endpoint | `GET /api/operations/dashboard` |
  | Authorization | `OPERATIONS_MANAGER` |
  | Errors | ML down → risk values `null`, `UNAVAILABLE` |
  | Undefined | "special requirements today" source (`guests.special_requirements` non-empty vs `bookings.special_requests > 0`) — **U-06** |

  #### F-14 Guest List — P0

  | Dimension | Requirement |
  |---|---|
  | Product requirement | Guest / Room / Arrival / Preference / Cancellation Risk table `[PRD §22]` |
  | Responsibility | Filter by search (name/email, case-insensitive), arrival range, risk, room type, status; sort by `arrivalDate | name | cancellationProbability`; paginate `[API §7.2]` |
  | DB entities | `guests`, `bookings`, `guest_preferences`, `predictions` |
  | Endpoint | `GET /api/operations/guests` |
  | Authorization | `OPERATIONS_MANAGER` |
  | Validation | dates `YYYY-MM-DD`, `arrivalFrom ≤ arrivalTo`, enums, `sortBy`/`sortOrder` whitelist (no raw SQL interpolation), `search` length cap (U-15) |
  | Errors | `400` |
  | Tests | each filter; sort by probability with nulls; SQL-injection strings in `search`/`sortBy`; pagination meta |
  | Undefined | `topPreference` selection rule; guest with multiple bookings in range → one row or many — **U-07** |

  #### F-15 Guest Profile, History, Stored Preferences — P0

  | Dimension | Requirement |
  |---|---|
  | Product requirement | Basic info, current booking, preferences, history, stats `[PRD §16, §23]` |
  | Responsibility | Profile + `currentBooking` (next upcoming or in-house, else `null`) + activities; booking history paginated desc; stored preferences filtered by `source` `[API §7.3–7.5]` |
  | DB entities | `guests`, `bookings`, `rooms`, `guest_activities`, `guest_preferences` |
  | Endpoints | `GET /api/operations/guests/:guestId`, `.../bookings`, `.../preferences` |
  | Authorization | `OPERATIONS_MANAGER` |
  | Validation | `guestId` UUID; `status`, `source` enums |
  | Errors | `400`, `404 NOT_FOUND` |
  | Undefined | `previousVisits`, `previousCancellations` derivation — **U-08**; `confidence` must be `null` for `EXPLICIT` |
  | Tests | 404 unknown guest; `currentBooking` null when none; in-house beats future |

  #### F-16 Guest Predictions (cancellation + preferences + summary) — P0

  | Dimension | Requirement |
  |---|---|
  | Product requirement | Cancellation probability + factors; predicted preferences; phrased as estimate `[PRD §17, §19–21]` |
  | Responsibility | Score current booking; map factors to readable labels; call preference model; optionally LLM-phrase a `summary` using "estimated … probability" wording; `summary: null` if LLM down `[API §7.6]` |
  | DB entities | `bookings`, `guests`, `guest_activities`, `guest_preferences` (write back `PREDICTED` rows? — **U-09**), `predictions` |
  | Endpoint | `GET /api/operations/guests/:guestId/predictions` |
  | Authorization | `OPERATIONS_MANAGER` |
  | Errors | `404`; ML down → nulls + `UNAVAILABLE`; LLM down → `summary: null` (not an error) |
  | External | ML cancellation + preferences (**C-06, C-08**), LLM |
  | Tests | `cancellation: null` without upcoming booking; summary never contains "will cancel"; LLM failure does not fail the request |

  #### F-17 Cancellation Risk List — P0

  | Dimension | Requirement |
  |---|---|
  | Responsibility | Booking-level list with guest name, lead time, channel, deposit, ADR, probability, level, factors; filters; sorted by probability desc `[API §7.7]` |
  | DB entities | `bookings`, `guests`, `predictions` |
  | Endpoint | `GET /api/operations/cancellation-risk` |
  | Authorization | `OPERATIONS_MANAGER` |
  | Validation | `risk` enum; `minProbability` 0–1; dates; pagination |
  | Errors | `400`; ML down → rows with null probability + `meta.predictionStatus: UNAVAILABLE` (not 503 — endpoint mixes DB data) |
  | Tests | sort; filters; `leadTimeDays = arrivalDate − bookingDate` |

  #### F-18 Staffing — P1 · F-19 Service Requests (ops) — P1

  | Feature | Endpoint | Notes |
  |---|---|---|
  | Staffing | `GET /api/operations/staffing?date=` | Rule-based, no ML `[DE §15]`. Required-staff formula **UNDEFINED** — **U-12** |
  | Service requests | `GET/PATCH /api/operations/service-requests[/:requestId]` | PATCH body needs ≥ 1 of `status`, `priority`. Status transition rules **UNDEFINED** — **U-13** |

  ---

  ### 3.3 Guest features

  All guest routes: `role = GUEST`, guest identity **only** from JWT `guestId`; no `guestId` accepted from path, query or body `[API §1.5, §8]`.

  #### F-20 Guest self-service data — P0

  | Dimension | Requirement |
  |---|---|
  | Responsibility | Own profile (omit `averageSpend`, `previousCancellations`); own preferences (only `type, value, source`); own bookings by scope, **without** `adr, depositType, bookingChannel, customerType` `[API §8.1–8.3]` |
  | DB entities | `guests`, `guest_preferences`, `bookings`, `rooms` |
  | Endpoints | `GET /api/guest/profile`, `/preferences`, `/bookings?scope=upcoming|past|all` |
  | Validation | `scope` enum; any `guestId` param is ignored/rejected (U-14) |
  | Errors | `400`, `401`, `403`; `GUEST` token with no linked guest row → **U-14** |
  | Tests | **field allow-list tests** (response keys exactly match contract — forbidden fields absent); guest A cannot read guest B by any parameter; staff token → 403 |

  #### F-21 Resort Information — P0

  | Dimension | Requirement |
  |---|---|
  | Responsibility | Verified knowledge list, filter by `category`, text `search` `[API §8.4; PRD §27, §47]` |
  | DB entities | `resort_information` |
  | Endpoint | `GET /api/guest/resort-info` |
  | Validation | `category ∈ ResortInfoCategory`; `search` length cap |
  | Tests | category filter; search case-insensitive |

  #### F-22 AI Concierge (chat) — P0

  | Dimension | Requirement |
  |---|---|
  | Product requirement | Natural questions; personalized from guest context; RAG / controlled context; hallucination prevention; say "unavailable" when unknown `[PRD §25–30; DE §16–17]` |
  | Responsibility | JWT → load profile, preferences, activities, current booking → retrieve relevant `resort_information` → if nothing relevant: deterministic fallback, `grounded: false`, **no LLM call needed** → else LLM with retrieved snippets only → validate output → return `reply, grounded, sources, usedPreferences, conversationId, messageId` `[API §8.5]` |
  | DB entities | `guests`, `guest_preferences`, `guest_activities`, `bookings`, `resort_information`; conversation storage **not in DB spec** — **C-09** |
  | Endpoint | `POST /api/guest/chat` (P0); `GET /api/guest/chat/history` (P1) |
  | Authorization | `GUEST`; `conversationId` must belong to the caller |
  | Validation | `message` 1–1000 chars (trimmed); `conversationId` optional UUID |
  | Errors | `400`, `404` (unknown/foreign `conversationId` — **U-16**), `429 RATE_LIMITED` (20 msg/min/guest), `503 AI_SERVICE_UNAVAILABLE` |
  | External | LLM (**C-15**); retrieval method (**C-17**) |
  | Security | prompt must never include other guests' data, cancellation probability, spend, staff data or internal recommendations; treat guest message as untrusted (prompt-injection) |
  | Tests | grounded reply cites real `resort_information` ids; unknown topic ("helipad") → exact fallback text + `grounded: false`; `usedPreferences` ⊆ guest's stored preferences; rate limit at 21st msg; LLM down → 503; prompt snapshot contains no forbidden fields |
  | Undefined | grounding rule; fallback when LLM answer cites nothing — **U-17** |

  #### F-23 Guest Service Requests — P1

  | Endpoint | Notes |
  |---|---|
  | `GET /api/guest/service-requests`, `POST /api/guest/service-requests` | Own only; `requestType` + `description 1–1000`; **priority set by backend** — rule **UNDEFINED** (**U-13**); `requestType` value list **UNDEFINED** |

  ### 3.4 Stretch

  | Feature | Backend impact |
  |---|---|
  | Predictive maintenance `[FEAT §4; DE §18]` | No endpoint reserved in `api.md`. Rule stub only (`highMaintenanceRisk: 0.80`), skipped when no data. **Do not build.** |

  ---

  ## 4. Derived backend data requirements (summary)

  Detailed schema will go in `backend/docs/database.md`. Findings needed for later phases:

  | Entity | Status vs `[DB]` | Needed by | Gap |
  |---|---|---|---|
  | `users` | defined | F-00 | Unique index on `email` implied, not listed |
  | `guests` | defined | F-14…F-22 | `previous_visits`/`previous_cancellations` not stored — derive (U-08) |
  | `rooms` | defined | F-06…F-09 | `room_type` vocabulary conflict (C-07) |
  | `bookings` | defined | nearly all | Missing ML inputs: `market_segment`, `distribution_channel`, `meal`, `country`, weekend/week nights, `booking_changes`, `required_car_parking_spaces`, `is_repeated_guest`, `reserved_room_type` vs assigned (C-06) |
  | `guest_preferences` | defined | F-15, F-16, F-20, F-22 | Write-back policy for `PREDICTED` (U-09) |
  | `guest_activities` | defined | F-15, F-16, F-22 | — |
  | `resort_information` | defined | F-21, F-22 | — |
  | `recommendations` | defined | F-03, F-05, F-10 | Missing `note`, `updated_at`, dedup key (C-10) |
  | `predictions` | "add later" | F-02 STALE cache | Needed earlier than DB §9 says; lacks `factors`, `probability` naming (C-11) |
  | `events` | defined | F-06 | ML impl does not consume events (C-03) |
  | `reviews` | defined | F-12 (P1) | — |
  | `service_requests` | defined | F-19, F-23 (P1) | — |
  | `staff`, `operations` | "add later" | F-18 (P1) | — |
  | chat conversations/messages | **absent** | F-22 | C-09 |

  ---

  ## 5. Documentation Conflicts / Decisions Required

  Status: **RESOLVED** = a later explicit project decision settles it (source cited). **OPEN** = needs a team decision; the recommendation is only a proposal.

  ### 5.1 Blocking (must be decided before backend implementation)

  | ID | Conflict | Sources | Status | Recommendation |
  |---|---|---|---|---|
  | **C-01** | **Docs are split across branches.** `backend` has api.md/design.md + short prd/architecture; `origin/main` has full prd/architecture/database/decision-engine + ML code. Neither branch has a consistent set. | git history | **OPEN** | Merge `origin/main` into `backend` (or vice-versa). Keep main's full `prd.md`/`architecture.md`; keep backend's `api.md`/`design.md`. Decide whether the short overviews become `overview.md` or are dropped. |
  | **C-02** | **ML base path & health.** api.md: `ML_SERVICE_URL` + `/health`, `/predict/*`. ML-impl: all routes under `/api/v1/ml/*`; health returns `{status, service, models_loaded}` without model versions. | API §9.1 vs `ml-service/app/main.py`, `ml_routes.py` | **OPEN** | Either ML adds root aliases or api.md §9 is updated. Backend isolates this in `mlService.js` either way. |
  | **C-03** | **Booking forecast endpoint missing.** api.md `POST /predict/bookings` (with history + events inputs). ML-impl has no such route; `GET /predict/occupancy?days=1..90` returns `predicted_confirmed_bookings` + `predicted_occupancy_rate` with no inputs and ignores `events`. | API §9.2–9.3 vs ML-impl | **OPEN** | Treat `GET /predict/occupancy` as the single forecast source for both F-06 and F-07; update api.md §9. Events input becomes future scope. |
  | **C-04** | **Forecast is anchored to the dataset, not today.** ML-impl forecasts `last_date + i` from the H1 CSV (2015–2017 data), and has no confidence, no bounds, no `model_version`. Occupancy model R² is negative (`metadata.json`). | ML-impl `predict_occupancy_forecast` | **OPEN** | Decide: (a) ML re-anchors to a supplied `start_date`, or (b) backend re-dates the series to start tomorrow and labels it. Omit optional `lowerBound/upperBound`; `confidence: null`; `modelVersion` from ML metadata `version`. Flag model quality for the demo. |
  | **C-05** | **Who computes occupancy.** ARCH §9 and API §6.3: Node computes `rooms/total`. API §9.3: ML `/predict/occupancy` returns occupancy. ML-impl: separate occupancy-rate model. | ARCH §9, API §6.3 vs §9.3, ML-impl | **OPEN** | Use ML `predicted_occupancy_rate` directly (it is what exists) and record that as a decision, or compute from bookings/`totalRooms`. The two can disagree numerically; pick one. |
  | **C-06** | **Cancellation contract.** api.md: batch `{bookings:[{booking_id, lead_time, room_type, booking_channel, previous_bookings, …}]}` → `factors` feature keys. ML-impl: **single** booking; different fields (`market_segment`, `distribution_channel`, `reserved_room_type` letter code, `arrival_date_month`, `country`, `meal`, `stays_*`, …); response `risk_score_pct`, `top_risk_factors: [{feature, importance, value}]` = **global** importances (identical order for every booking); no `booking_id`, no `model_version`. | API §9.4 vs `schemas.py`, `ml_inference.py` | **OPEN** | Ask ML for a batch endpoint (manager summary scores ~220 bookings; 220 sequential calls × up to 5 s is not viable). Extend `bookings` schema with the ML input columns. Backend derives **readable per-booking factors** from booking values (e.g. lead time, previous cancellations, deposit, channel) instead of global importances — needs sign-off (see U-18). |
  | **C-07** | **Room-type taxonomy.** api.md/DB: `STANDARD | DELUXE | SUITE`. ML/H1 data: letter codes `A–H, L, P`. No mapping exists. | API §2 vs ML-impl `ROOM_LABELS` | **OPEN** | Define a fixed mapping table (e.g. A→STANDARD, D→DELUXE, …) in `ml-contracts.md`; backend maps at the ML boundary only. |
  | **C-08** | **Preference model output.** api.md/PRD: `[{type: ROOM|ACTIVITY|FOOD, value: "Deluxe"|"Spa"|"Vegetarian", confidence}]`. ML-impl `/predict/guest-preferences`: `predicted_meal_plan` (BB/HB/FB/SC), `predicted_room_type` (letter), two confidences, `is_family`, `personalization_tags`. No activity or food-type prediction; input is booking aggregates, not history lists. | API §9.5, PRD §17/§53 vs ML-impl | **OPEN** | Decide whether demo preferences (Spa, Vegetarian) come from ML or from `guest_preferences`/`guest_activities` history. Minimal: map ROOM from model (via C-07), treat meal plan as FOOD-plan, derive ACTIVITY from `guest_activities` frequency (`source: HISTORY`). |
  | **C-09** | **Chat persistence.** api.md returns `conversationId`/`messageId` and reserves `GET /api/guest/chat/history`; database.md has no conversation/message tables. | API §8.5–8.6 vs DB §4 | **OPEN** | Add `chat_conversations` and `chat_messages` (additive). Alternative for P0: in-memory store (lost on restart). |
  | **C-12** | **Auth provider.** DB §2 / ARCH §6 mention Supabase Auth; PRD §42 and api.md define own `users.password_hash` + custom JWT payload with `guestId`. | DB §2, ARCH §6 vs API §1.5, PRD §42 | **RESOLVED by API §1.5** (later, explicit contract) | Custom JWT; Supabase used as Postgres only. Recorded here so nobody wires Supabase Auth. |
  | **C-13** | **When the Decision Engine runs** and how duplicates across runs are avoided. api.md §10: "Predictions run on demand / via a backend job". DE §19 covers dedup within one run only. | API §10, DE §11, §19 | **OPEN** | Minimal: run on demand when the dashboard/recommendations are requested and the last run is older than N minutes; upsert on a dedup key (`category + rule id + subject`) while an open (`NEW|VIEWED`) rec exists. |
  | **C-15** | **LLM provider & model.** Tech stack says "an LLM"; ARCH §23 uses `OPENAI_API_KEY`; api.md uses provider-neutral `LLM_API_KEY`, `LLM_MODEL`. | TECH §5, ARCH §23, API §12 | Env names **RESOLVED by API §12**; provider **OPEN** | Team to choose provider; keep `aiService.js` provider-agnostic. |

  ### 5.2 Non-blocking

  | ID | Conflict | Sources | Status | Resolution / recommendation |
  |---|---|---|---|---|
  | C-10 | `recommendations` lacks `note` (PATCH accepts it), `updated_at`, dedup key | API §6.7 vs DB §4.12 | OPEN | Additive columns. |
  | C-11 | `predictions` table is "add later" but api.md `STALE` status and caching depend on it; table lacks `factors`, per-type payload | API §1.10 vs DB §4.14, §9 | OPEN | Promote to MVP; add `payload JSONB`. Or drop `STALE` from P0 behaviour. |
  | C-14 | DE Rule 2 is per-booking ("Review high-risk booking") but recommendations are manager-only and api.md examples are aggregate | DE §12 R2 vs API §6.6, PRD §10 | OPEN | Manager gets one aggregate cancellation rec (count + threshold); per-booking detail stays in ops endpoints. |
  | C-16 | api.md §1.6 lists only `/health` and `/auth/login` as public, but §5.5 makes `/auth/register` public | API §1.6 vs §5.5 | OPEN (trivial) | Add register to §1.6 public list. |
  | C-17 | Retrieval: PRD §28 "RAG or controlled knowledge context"; TECH §5 "embeddings/RAG may be used" | PRD §28, TECH §5 | OPEN | P0: keyword/category retrieval in Postgres over `resort_information` (no new infra, per TECH §8 "avoid additional technologies"). Embeddings later. |
  | C-18 | Cancellation MEDIUM threshold: ML-impl 0.35; DE §10 / api.md 0.40 | ML-impl, `metadata.json` vs DE §10, API §2 | **RESOLVED by API §2** ("backend computes `riskLevel`") | Backend ignores ML `risk_level`; recomputes from probability. ML team should align to avoid confusion. |
  | C-19 | Currency: api.md money in INR; H1 `ADR` is EUR-scale (ML `premium_guest` tag uses `adr > 150`) | API §1.4 vs ML-impl | OPEN | Store INR in DB; convert to model scale at ML boundary with a fixed documented factor, or store raw dataset values and label them. |
  | C-20 | `bookingChannel` values in api.md (`Direct`, `Online TA`, `Offline TA/TO`, `Corporate`) are H1 **market segments**; ML also needs **distribution channel** (`TA/TO`, `Direct`, `Corporate`, `GDS`) | API §3 vs ML-impl | OPEN | Keep `booking_channel` = market segment; add `distribution_channel` column. |
  | C-21 | Scope of sentiment/pricing/staffing: PRD §60 removes them as core; features.md lists them as "Should have"; PRD appendix re-adds sentiment & pricing as secondary | PRD §60, FEAT §3 | **RESOLVED by API §4** (P1, names reserved) | Build only after P0. |
  | C-22 | Preference prediction MVP status: PRD §59/§70 P0; ARCH §28 "optional after MVP" | PRD §59 vs ARCH §28 | **RESOLVED by API §4** (P0) | — |
  | C-23 | Endpoint names in ARCH §19, PRD §51/§55, DE §22 | — | **RESOLVED by API §10** | Use api.md names only. |
  | C-24 | Backend file layout: ARCH §5 resource controllers (`bookingController.js`, …) vs api.md §11.2 role routers (`manager.routes.js`, …) | ARCH §5 vs API §11.2 | **RESOLVED by API §11.2** | Role routers; `repositories/` + `validators/` from existing scaffold. |
  | C-25 | JS vs TS: `backend/.gitignore` header says "Node.js / TypeScript"; api.md and ARCH reference `.js` files | `backend/.gitignore` vs API §11.2 | OPEN | JavaScript (matches every doc reference); confirm. |
  | C-26 | Manager KPIs: features.md (backend branch) lists revenue, ADR, check-ins/outs, alerts; PRD §13 and api.md KPI set exclude revenue/ADR | FEAT §2.1 vs PRD §13, API §6.1 | **RESOLVED by API §6.1** | No revenue/ADR KPI in P0. |
  | C-27 | `/occupancy-forecast` and `/booking-forecast` accept `roomType`; ML-impl forecasts whole-resort only | API §6.2–6.3 vs ML-impl | OPEN | Return `400`/ignore until supported, or remove the param from api.md. |

  ---

  ## 6. Undefined items and minimal assumptions (⚠ confirm)

  | ID | Undefined | Minimal assumption |
  |---|---|---|
  | U-01 | `currentOccupancy` definition | Bookings with `status ∈ {CONFIRMED, CHECKED_IN}` whose stay covers today ÷ `count(rooms)` × 100 ⚠ |
  | U-02 | `upcomingBookings` window | Same 30-day window as cancellation summary (demo numbers: 220 = 165+38+17) ⚠ |
  | U-03 | `bookingDemand`, `bookingDemandChangePct`, room `demandLevel`, `demandChangePct` | Change % = next-N-day forecast vs previous-N-day actuals; level from occupancy bands in `RULE_CONFIG` (not hard-coded) ⚠ |
  | U-04 | Insight text generation | Deterministic templates keyed to triggered rules / KPI values; LLM rephrase optional and off by default ⚠ |
  | U-05 | "Actual bookings" per day for `history` | Count of bookings on-the-books (not cancelled) whose stay covers that date ⚠ |
  | U-06 | "Special requirements today" | Today's arrivals with non-empty `guests.special_requirements` or `bookings.special_requests > 0` ⚠ |
  | U-07 | Guest list row granularity & `topPreference` | One row per guest (their next booking in range); top preference = highest-confidence non-ROOM preference, `EXPLICIT` first ⚠ |
  | U-08 | `previousVisits`, `previousCancellations` | Derived from guest's own `bookings` (`CHECKED_OUT` count, `CANCELLED` count) ⚠ |
  | U-09 | Persist predicted preferences? | Do not write back in P0; return live ⚠ |
  | U-10 | Pricing suggestion formula (P1) | Defer ⚠ |
  | U-11 | Sentiment trend thresholds & scoring schedule (P1) | Defer ⚠ |
  | U-12 | Staff requirement formula (P1) | Defer ⚠ |
  | U-13 | Service request priority rule & status transitions (P1) | Defer ⚠ |
  | U-14 | `GUEST` user without a `guests` row; `guestId` supplied by client | Login refuses to issue a guest token without a linked row; guest routes reject any `guestId` input with `400` ⚠ |
  | U-15 | Length caps for `search` and other free-text query params | 100 chars ⚠ |
  | U-16 | Unknown / other guest's `conversationId` | `404 NOT_FOUND` (do not reveal existence) ⚠ |
  | U-17 | Definition of `grounded` | `true` only when ≥ 1 `resort_information` row was retrieved **and** passed to the LLM; `sources` = those rows ⚠ |
  | U-18 | Readable cancellation factors | Backend rule-based labels from booking values (see C-06) ⚠ |
  | U-19 | Login rate limit value | 10 attempts / 15 min / IP ⚠ |
  | U-20 | Health check for LLM | Config-present check only (no paid call per health ping) ⚠ |
  | U-21 | Password hashing algorithm | bcrypt ⚠ |
  | U-22 | Seed / demo data source | Seed must reproduce PRD §63 scenario (Rahul Sharma, 84%, 95% peak, 17 high-risk, 220 rooms); H1 import optional ⚠ |
  | U-23 | Testing, observability, deployment requirements | Only WF §9 (test list) and TECH §7 / ARCH §25 (hosting) exist; will be derived minimally in later docs ⚠ |

  ---

  ## 7. Next backend documents (not yet written)

  To be produced **after** the blocking conflicts in §5.1 are decided, each derived from this map:

  | # | File (`backend/docs/`) | Covers prompt step |
  |---|---|---|
  | 1 | `architecture.md` — layers, folder map, request lifecycle | 4 |
  | 2 | `database.md` — DDL, indexes, additive columns from §4, seed contract | 5 |
  | 3 | `api-implementation.md` — endpoint → controller → service → repository, query rules (not a copy of api.md) | 6 |
  | 4 | `auth.md` — JWT, RBAC matrix, guest isolation | 7 |
  | 5 | `errors.md` — error codes, degraded predictions | 8 |
  | 6 | `validation.md` — per-endpoint schemas | 9 |
  | 7 | `ml-integration.md` — adapter mapping for the ML contract as finally agreed | 10 |
  | 8 | `testing.md`, `security.md`, `observability.md`, `deployment.md` | 11–14 |

  Implementation (step 16) starts only after these are consistent with each other and with `docs/api.md`.
