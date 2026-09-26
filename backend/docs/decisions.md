# Smart Resort 360 — Backend Decision Log (Phase 0)

> **Purpose:** turn every conflict (`C-xx`) and undefined item (`U-xx`) from [requirements-map.md](./requirements-map.md) into an explicit, traceable decision, or leave it visibly **OPEN**.
> **Scope:** documentation only. No code, schema or dependency was created.
> **Date:** 2026-09-26 · **Branch:** `backend`

---

## 0. Status legend

| Status | Meaning |
|---|---|
| **RESOLVED** | Already settled by an existing, later, explicit project document. Recorded here only for traceability. |
| **DECIDED** | Settled in this log. The decision uses only existing documents or existing code as evidence, and adds no product behaviour. |
| **DECIDED ⚠** | Settled for implementation, but it rests on an **assumption** (`A-xx`) that a named owner must confirm. Implementation may proceed and must keep the assumption in one config place so it is cheap to change. |
| **INTERIM** | The backend-side handling is decided, but the proper fix belongs to another owner (ML team). An external change request (`CR-xx`) stays open. |
| **OPEN** | Needs a decision from the team or an owner outside backend. Not decided here. |
| **DEFERRED** | P1 / stretch. Must not be decided or built during P0. |

"Blocks" = which backend implementation area cannot start until the item is settled.

---

## 1. Summary

| ID | Topic | Status | Blocks |
|---|---|---|---|
| C-01 | Docs split across branches | **DECIDED** (baseline) · merge action **OPEN** | Database, Decision Engine phases |
| C-02 | ML base path, health, model version | **INTERIM** (CR-01, CR-02) | — |
| C-03 | No booking-forecast endpoint in ML | **INTERIM** (CR-03) | — |
| C-04 | ML forecast anchored to dataset dates, not today | backend side **DECIDED** · ML fix **OPEN** (CR-04) | **Forecast features F-05/F-06/F-07 and Decision Engine occupancy rules** |
| C-05 | Who computes occupancy | **DECIDED** | — |
| C-06 | Cancellation contract mismatch | **INTERIM** (CR-05) + schema **DECIDED** | — |
| C-07 | Room-type taxonomy (A–P vs STANDARD/DELUXE/SUITE) | **OPEN** (proposed default A-07) | ML adapter mapping for room type |
| C-08 | Preference model output mismatch | **INTERIM** (CR-06) | — |
| C-09 | Chat persistence tables | **DECIDED** | — |
| C-10 | `recommendations` missing columns | **DECIDED** | — |
| C-11 | `predictions` table needed in P0 | **DECIDED** | — |
| C-12 | Auth provider | **RESOLVED** (api.md §1.5) | — |
| C-13 | When the Decision Engine runs + cross-run dedup | **DECIDED ⚠** | — |
| C-14 | Per-booking vs aggregate cancellation recs | **DECIDED ⚠** | — |
| C-15 | LLM provider / model | env names **RESOLVED** · provider **OPEN** | **AI Concierge, LLM phrasing** |
| C-16 | `/auth/register` missing from public list | **DECIDED** (api.md updated) | — |
| C-17 | Retrieval method for concierge | **DECIDED** | — |
| C-18 | MEDIUM threshold 0.35 vs 0.40 | **RESOLVED** (api.md §2) | — |
| C-19 | Currency INR vs model EUR scale | mechanism **DECIDED** · factor **OPEN** (A-19) | Cancellation/preference adapter (value only) |
| C-20 | `bookingChannel` = market segment; distribution channel missing | **DECIDED** | — |
| C-21 … C-24, C-26 | Scope/naming/layout | **RESOLVED** (api.md) | — |
| C-25 | JavaScript vs TypeScript | **DECIDED** | — |
| C-27 | `roomType` filter on forecasts not supported by ML | **INTERIM** (CR-07) | — |
| **C-28** *(new)* | Meaning of "predicted bookings" | **DECIDED** | — |
| **C-29** *(new)* | ML service exposure / CORS `*` | **OPEN** (deployment phase) | Deployment only |
| U-01 … U-24 | Undefined behaviour | see §5 | — |

---

## 2. Source-of-truth baseline

### D-01 · Document precedence (from C-01)

| Topic | Canonical document | Branch it lives on today |
|---|---|---|
| Product scope, roles, business principles | `docs/prd.md` — **full version** (§1–§71 + secondary features) | `origin/main` |
| System architecture | `docs/architecture.md` — **full version** (§1–§31) | `origin/main` |
| Database schema | `docs/database.md` + schema changes in §4 of this log | `origin/main` |
| Decision Engine rules | `docs/decision-engine.md` + D-13/D-14 of this log | `origin/main` |
| HTTP contract (public + ML target) | `docs/api.md` | `backend` |
| Frontend screens | `docs/design.md` | `backend` |
| Feature priority / stack / workflow | `features.md`, `tech_stack.md`, `development_workflow.md` | `backend` |
| ML contract as implemented | `docs/ml-contracts.md` (draft written in this phase) | `backend` |
| Backend decisions | this file | `backend` |

Precedence when documents disagree:
1. **This log**, for items it marks RESOLVED, DECIDED or INTERIM.
2. `api.md`, for paths, fields, casing, enums and status codes.
3. PRD → decision-engine → database → architecture, for behaviour.

The short `prd.md` / `architecture.md` on the `backend` branch are **superseded** by the full `origin/main` versions. Their content is a subset of the full documents plus `features.md`, so nothing unique is lost.

---

## 3. Conflict decisions

### C-01 — Documentation split across branches · BLOCKING

| Field | Content |
|---|---|
| Conflicting statements | `backend`: `database.md`, `decision-engine.md` and `ml-contracts.md` are 3-line stubs, and `prd.md`/`architecture.md` are overviews. `origin/main`: full `prd`/`architecture`/`database`/`decision-engine`, plus ML code, but `api.md` is a stub and `design.md` is absent. `api.md` cites section numbers that exist only on `origin/main`. |
| Sources | `git log --all`; `api.md` header and §10 |
| Decision | **DECIDED:** the baseline is D-01. **OPEN (action):** bring the `origin/main` documents onto `backend`, either by merging `origin/main` into `backend` or by checking out the four files. Keep `backend`'s `api.md`/`design.md` and `origin/main`'s full `prd`/`architecture`/`database`/`decision-engine`. |
| Reason | api.md was written against the `origin/main` versions (its section references only resolve there). Choosing the overviews would drop the schema and rules the API depends on. |
| Impact | Until the files are on this branch, the database and Decision Engine docs can't be edited here without guaranteed merge conflicts. Their required edits are queued in §7. A full merge also brings `ml-service/` code and about 84 MB of `.pkl` model files onto `backend`. |
| Docs to update | `prd.md` and `architecture.md` (replace with main versions), `database.md` and `decision-engine.md` (bring over, then apply §7) |
| Blocks implementation | **Yes**, for the Database and Decision Engine phases. **No** for backend foundation. |
| Owner | Repo owner: choose a merge or a file checkout |

### C-02 — ML base path, health shape, model version

| Field | Content |
|---|---|
| Conflicting statements | api.md §9: base `ML_SERVICE_URL`, `GET /health` returns `{status, models:{booking, cancellation, preference}}`, and every response carries `model_version`. ML-impl: all routes are under `/api/v1/ml`, `/health` returns `{status, service, models_loaded}`, and no prediction response carries a version. Versions exist only in `metadata.json` (`"version": "1.0.0"`), served by `GET /api/v1/ml/data/summary`. |
| Sources | api.md §9, §9.1, §12; `ml-service/app/main.py`, `api/routes/ml_routes.py`, `models/*/metadata.json` |
| Decision | **INTERIM.** (1) `ML_SERVICE_URL` includes the prefix, e.g. `http://localhost:8000/api/v1/ml`. No new env var. (2) The adapter treats ML as healthy only when `status == "ok"` **and** `models_loaded == true`. (3) The adapter reads `/data/summary` once (on the first successful health check, then cached) and exposes `modelVersion` as `"<model>@<version>"`, e.g. `"cancellation@1.0.0"` (**A-02**). If summary is unavailable, `modelVersion` is `null` (the contract type already allows `string \| null`). |
| Reason | This uses what the ML service actually exposes. It invents no endpoint and needs no ML change to start. |
| Impact | The public API is unchanged. The format of `modelVersion` differs from the api.md examples (`booking-xgb-v1`), which were only examples. |
| Change requests | **CR-01:** add `model_version` to each prediction response. **CR-02:** add per-model versions to `/health`. |
| Docs to update | api.md §9 (status note) and §12 (URL example): **done**. `ml-contracts.md`: **done** (draft). |
| Blocks implementation | No |

### C-03 — No `POST /predict/bookings` in the ML service

| Field | Content |
|---|---|
| Conflicting statements | api.md §9.2 defines `POST /predict/bookings` (inputs: history, events). ML-impl has only `GET /predict/occupancy?days=1..90`, which returns `predicted_confirmed_bookings` and `predicted_occupancy_rate` per day, takes no inputs and ignores `events`. DE §13 and ARCH §15 require events as explicit model inputs. |
| Sources | api.md §9.2–9.3; DE §13; ARCH §8, §15; ML-impl `predict_occupancy` |
| Decision | **INTERIM.** `GET /predict/occupancy` is the single forecast source for both `/api/manager/booking-forecast` (`predictedBookings` ← `predicted_confirmed_bookings`) and `/api/manager/occupancy-forecast`. `confidence` is returned as `null`, because the ML service provides none. The event-input requirement is **kept, not removed**. It is recorded as unmet by ML v1. |
| Reason | This avoids a fake endpoint and uses the implemented model. The events requirement stays visible. |
| Impact | `BookingForecast.confidence` becomes `number \| null` in api.md §6.2. The frontend footer hides confidence when it is null. |
| Change requests | **CR-03:** booking forecast that accepts an events calendar (DE §13 features). |
| Docs to update | api.md §6.2: **done**. design.md §6.2: **done**. |
| Blocks implementation | No |

### C-04 — ML forecast dates are anchored to the dataset, not today · BLOCKING (forecast features)

| Field | Content |
|---|---|
| Conflicting statements | api.md §6.2–6.3 and PRD §8–9: the forecast covers the next N days from today. ML-impl: forecast dates are `last_date_in_training_csv + i`. The H1 dataset covers 2015–2017, so the forecast is for dates in 2017. There are no bounds and no confidence. `metadata.json` reports a negative R² for both occupancy targets (weaker than predicting the mean). |
| Sources | api.md §6.2–6.3; PRD §8–9; ARCH §9 ("present as forecast"), §24 ("a failed prediction must never be shown as valid"); ML-impl `predict_occupancy_forecast`; `occupancy/metadata.json` |
| Decision | **Backend side DECIDED:** (1) The backend will **not** re-date ML output. Shifting 2017 predictions onto 2026 dates would show seasonality and day-of-week features computed for different dates as a real forecast, which violates ARCH §24. (2) If the first ML forecast date is not tomorrow in the resort timezone (U-24), the adapter treats the forecast as **unavailable**: `503 ML_SERVICE_UNAVAILABLE` on prediction-only endpoints, `predictionStatus: "UNAVAILABLE"` on mixed ones. (3) `lowerBound`/`upperBound` are omitted (they are optional in the contract). **ML side OPEN:** CR-04. |
| Reason | This is the only option that stays inside ARCH §24 and PRD §21 without inventing data. |
| Impact | **Until CR-04 is delivered, every forecast endpoint, the predicted-occupancy KPI, and Decision Engine rules R1/R4/R9 return "unavailable".** Forecasting is the core of the manager demo (PRD §62 Journey 1), so this is the single largest delivery risk. Model quality (negative R²) is a separate demo risk that should be raised with the ML owner. |
| Change requests | **CR-04:** `GET /predict/occupancy?start_date=YYYY-MM-DD&days=N` that computes calendar features for the target dates and lags from the latest available data. |
| Docs to update | api.md §6.3, §9: **done**. `ml-contracts.md`: **done**. |
| Blocks implementation | **Yes**, for a *working* F-05/F-06/F-07 and occupancy rules. The adapter, degraded path and endpoints can still be built and tested against a stub. |
| Owner | ML team (CR-04) |

### C-05 — Who computes occupancy

| Field | Content |
|---|---|
| Conflicting statements | ARCH §9 and api.md §6.3: Node computes `predictedOccupiedRooms / totalRooms × 100`. api.md §9.3: ML `/predict/occupancy` returns occupancy. ML-impl: a separate regression model returns `predicted_occupancy_rate` (0–100). No ML output gives *predicted occupied rooms*. `predicted_confirmed_bookings` is arrivals per day (C-28), not rooms occupied. |
| Sources | ARCH §9; api.md §6.3, §9.3; ML-impl |
| Decision | **DECIDED:** `predictedOccupancy` = ML `predicted_occupancy_rate`, clamped to 0–100 by the adapter. Node does **not** compute occupancy from arrivals. Node still computes `peak` and supplies `totalRooms` (from `rooms`) and `highOccupancyThreshold` (from `RULE_CONFIG`). |
| Reason | The ARCH §9 formula needs predicted occupied rooms, which no model produces. Dividing daily arrivals by room count would be a wrong number shown as a forecast. |
| Impact | `currentOccupancy` (DB, U-01) and `predictedOccupancy` (ML, trained on the dataset hotel) come from different sources. The demo seed should keep them plausible (U-22). |
| Docs to update | api.md §6.3: **done**. architecture.md §9: add a pointer to this decision after C-01 (§7). |
| Blocks implementation | No |

### C-06 — Cancellation contract mismatch

| Field | Content |
|---|---|
| Conflicting statements | api.md §9.4: batch request with `booking_id`, `room_type`, `booking_channel`, `previous_bookings`; response `factors` = per-booking feature keys plus `model_version`. ML-impl: **one booking per call**, no `booking_id`, and 22 fields including `market_segment`, `distribution_channel`, `country`, `meal`, `stays_in_weekend_nights`, `stays_in_week_nights`, `booking_changes`, `required_car_parking_spaces`, `is_repeated_guest`, `room_type_changed`, `reserved_room_type` (letter code), `arrival_date_month`. The response has `risk_score_pct` and `top_risk_factors: [{feature, importance, value}]`, where the importances are the **model's global importances** (same order for every booking). Missing fields silently fall back to defaults (for example `country="PRT"`); `Country_enc` is the most important feature. |
| Sources | api.md §9.4; PRD §20, §54; database.md §4.4; ML-impl `schemas.py`, `ml_inference.py`, `cancellation/metadata.json` |
| Decision | **INTERIM + DECIDED:** (1) The adapter calls `POST /predict/cancellation` once per booking with bounded concurrency (**A-06a**: 8 in flight) and a 5 s timeout per call, and joins results to `bookingId` itself. (2) Results are cached in `predictions` (C-11), so aggregate endpoints don't re-score on every request. (3) Field mapping (derived fields): `lead_time` = `arrival_date − booking_date`; `stays_in_weekend_nights`/`stays_in_week_nights` from the arrival–departure range (Saturday or Sunday nights count as weekend nights, the H1 dataset definition, **A-06b**); `arrival_date_month` from `arrival_date`; `previous_bookings_not_canceled` ← `bookings.previous_bookings`; `is_repeated_guest` = `previous_bookings > 0`; `room_type_changed` = assigned room's type ≠ booked `room_type`; `market_segment` ← `booking_channel` (C-20). (4) **Schema decision (§4):** add nullable `bookings` columns for inputs that cannot be derived: `distribution_channel`, `meal`, `country`, `booking_changes`, `required_car_parking_spaces`, `reserved_room_type_code`. When a value is null, the adapter omits the field (the ML default applies) and records the omitted feature names in the `predictions` row for traceability. (5) `riskLevel` is recomputed by the backend (C-18). (6) Readable factors follow U-18. |
| Reason | These are the real model inputs, so the columns are not "fake fields". Defaulting the top feature for every guest would quietly degrade every prediction. |
| Impact | database.md §4.4 gains columns (queued, §7). Seed data must populate them (U-22). The country value stays internal and is never returned by any public endpoint (PRD §58, "avoid exposing unnecessary personal information"). |
| Change requests | **CR-05:** batch endpoint that accepts and echoes `booking_id`, plus per-booking factor contributions. |
| Docs to update | database.md (§7, pending C-01); api.md §9: **done**; `ml-contracts.md`: **done** |
| Blocks implementation | No (the schema part is decided) |

### C-07 — Room-type taxonomy · OPEN

| Field | Content |
|---|---|
| Conflicting statements | api.md §2 and database.md: `RoomType = STANDARD, DELUXE, SUITE` ("extend only by adding"). ML-impl and the H1 dataset use anonymised letter codes `A B C D E F G H L P`, as input (`reserved_room_type`) and output (`predicted_room_type`). No document maps one to the other. |
| Sources | api.md §2; database.md §4.3; ML-impl `ROOM_LABELS` |
| Decision | **OPEN.** A mapping is data knowledge that no document contains. What *is* decided: the mapping lives in **one** config table used only at the ML boundary, and public responses only ever contain `RoomType` values. **Proposed default (A-07, not adopted):** `A, B, C → STANDARD`; `D, E, F → DELUXE`; `G, H, L, P → SUITE`. |
| Reason | Choosing a mapping silently would invent product data. |
| Impact | Until it is decided, the adapter cannot send `reserved_room_type_code` for bookings seeded without a code, and cannot translate the predicted `ROOM` preference. Both degrade gracefully: the field is omitted, or the `ROOM` prediction is dropped. |
| Docs to update | `ml-contracts.md` §4: **done** (proposal marked). |
| Blocks implementation | Room-type translation in the ML adapter only |
| Owner | ML/data owner |

### C-08 — Preference model output mismatch

| Field | Content |
|---|---|
| Conflicting statements | PRD §17/§53 and api.md §7.6/§9.5: predicted preferences `[{type: ROOM\|ACTIVITY\|FOOD, value: "Deluxe"\|"Spa"\|"Vegetarian", confidence}]` from booking, activity and food history. ML-impl `POST /predict/guest-preferences`: inputs are the current booking's shape (party size, nights, ADR, segment, country), and outputs are `predicted_meal_plan` (`BB`/`HB`/`FB`/`SC/Undefined`), `predicted_room_type` (letter code), two confidences, `is_family` and `personalization_tags`. There is no activity or food-type prediction. |
| Sources | PRD §17, §19, §53; api.md §7.6, §9.5; ML-impl |
| Decision | **INTERIM.** The adapter emits: `ROOM` ← `predicted_room_type` mapped through C-07 (dropped while C-07 is open), confidence `room_confidence`; `FOOD` ← meal plan, labelled `Bed & Breakfast` / `Half Board` / `Full Board` (dropped for `SC/Undefined`), confidence `meal_confidence`. **No `ACTIVITY` prediction is emitted**: the model doesn't produce one, and labelling history data as `PREDICTED` would misrepresent its source. Activity preferences remain visible to operations through stored `HISTORY`/`EXPLICIT` preferences (api.md §7.5) and `activities` (§7.3). `is_family`/`personalization_tags` are not in the public contract and are not exposed. |
| Reason | This keeps the api.md shape and the data provenance honest, and adds no fields. |
| Impact | PRD §17's "Likely Activity → Spa" remains **unmet** by ML v1. In the demo, Rahul's Spa/Vegetarian shows as stored preferences, not ML predictions (design.md §7.3 note added). |
| Change requests | **CR-06:** a preference model per api.md §9.5, including activity. |
| Docs to update | api.md §7.6 and §9: **done**. design.md §7.3: **done**. `ml-contracts.md`: **done**. |
| Blocks implementation | No |

### C-09 — Chat persistence

| Field | Content |
|---|---|
| Conflicting statements | api.md §8.5 returns `conversationId` and `messageId`, requires the conversation to belong to the guest, and reserves `GET /api/guest/chat/history` (P1) returning `ChatMessage[]`. database.md has no table for either. |
| Sources | api.md §3 (`ChatMessage`), §8.5–8.6; database.md §4 |
| Decision | **DECIDED:** add `chat_conversations` and `chat_messages` (columns in §4). They are persisted in P0, because the ownership check on `conversationId` needs server-side state. The history *endpoint* stays P1. |
| Reason | These fields are required by an existing contract, not added to make docs consistent. An in-memory store would break ownership checks after a restart. |
| Impact | Two additive tables. The concierge needs no schema change later for P1 history. |
| Docs to update | database.md (§7, pending C-01) |
| Blocks implementation | No |

### C-13 — When the Decision Engine runs; cross-run duplicates

| Field | Content |
|---|---|
| Conflicting statements | api.md §10: "Predictions run on demand / via a backend job"; no `POST /api/predictions/run` is exposed. DE §11: run → store → return; DE §19 dedup covers only rules within a single run. Nothing says when a run happens or what happens when the same condition persists across runs. |
| Sources | api.md §10; DE §11, §19, §21 |
| Decision | **DECIDED ⚠:** (1) **On demand, no scheduler:** `GET /api/manager/dashboard` and `GET /api/manager/recommendations` trigger a run when the last run is older than `RULE_CONFIG.recommendationRefreshMinutes` (**A-13a**: 15). Runs are serialised, so concurrent requests don't double-run. (2) Every generated recommendation carries a deterministic `dedup_key` = `<RULE_ID>:<subject>` (e.g. `R1:2026-09-29`, `R4:DELUXE`, `R2:window-30d`). (3) If a recommendation with the same `dedup_key` exists in **any** status, no new row is inserted (**A-13b**). A dismissed condition therefore isn't re-raised for the same subject, and a new date or room type produces a new key. (4) A run that cannot evaluate a rule because of missing data creates nothing for that rule (DE §33). |
| Reason | TECH §8 says to avoid new infrastructure (so no job runner). DE §35 requires determinism. The frontend already refetches. |
| Impact | Needs `dedup_key` (C-10). The first dashboard load after 15 minutes is slower by one run. |
| Docs to update | decision-engine.md §11/§19 (§7, pending C-01) |
| Blocks implementation | No |

### C-15 — LLM provider · OPEN

| Field | Content |
|---|---|
| Conflicting statements | tech_stack.md §5: "an LLM". architecture.md §23: `OPENAI_API_KEY`. api.md §12: `LLM_API_KEY`, `LLM_MODEL`. |
| Sources | as listed |
| Decision | **Env names RESOLVED** by api.md §12 (later and provider-neutral). **Provider and model OPEN:** a team or budget decision. What is decided: `services/aiService.js` exposes a provider-agnostic interface (`generateReply(context)`, `rephrase(text)`), so the provider choice touches one file. |
| Impact | Concierge replies and the optional LLM phrasing (U-04, api.md §7.6 `summary`) cannot be integration-tested until the provider is chosen. Everything upstream of the LLM call (context loading, retrieval, grounding, fallback, validation, persistence) can be built and tested against a stub. |
| Docs to update | architecture.md §23 → api.md env names (§7, pending C-01) |
| Blocks implementation | **Yes**, for the AI Concierge and LLM phrasing integration only |
| Owner | Team lead |

### Non-blocking conflicts

| ID | Conflicting statements & sources | Decision | Reason | Impact | Docs | Blocks |
|---|---|---|---|---|---|---|
| **C-10** | api.md §6.7 PATCH accepts `note` and needs transition checks; database.md §4.12 has no `note`, `updated_at` or dedup key | **DECIDED:** add `note TEXT NULL`, `updated_at TIMESTAMPTZ`, `dedup_key VARCHAR(120) NOT NULL UNIQUE` | Required by an existing contract (note) and by C-13 | Additive | database.md (§7) | No |
| **C-11** | api.md §1.10 defines `STALE` = served from the `predictions` cache and older than 24 h; database.md §9 lists `predictions` as "add later"; the table has no factors/payload and `entity_id` is required | **DECIDED:** `predictions` becomes **P0**. Add `payload JSONB`, make `entity_id` nullable (resort-level forecasts). Read-through policy: a cached row < 24 h old is served as `AVAILABLE` without calling ML; otherwise call ML; on ML failure, serve a cached row ≥ 24 h as `STALE`; with no row, `UNAVAILABLE` | Implements api.md §1.10 as written. Also mitigates C-06 (220 single calls) | Additive; one more P0 table | database.md (§7) | No |
| **C-14** | DE §12 R2/R3 are per-booking recommendations ("Review high-risk booking"); recommendations are manager-only (api.md §6.6), and PRD §10 says the manager sees summaries, not every guest | **DECIDED ⚠:** R2 → **one aggregate** `CANCELLATION` rec for the window: priority HIGH if the count exceeds `highRiskCancellationCount`, otherwise MEDIUM (**A-14a**). R3 → one aggregate "Monitor medium-risk bookings", priority LOW (**A-14b**). R9 supersedes the R2 aggregate for the same window (same problem, DE §19). R1 and R9 are kept as separate recs, as in the api.md §6.6 example. Per-booking detail stays in the operations endpoints | Preserves every documented rule and respects the role split | Guest names never appear in recommendations | decision-engine.md §12, §19 (§7) | No |
| **C-16** | api.md §1.6 lists only `/api/health` and `/api/auth/login` as public; §5.5 makes `/api/auth/register` public | **DECIDED:** add `/api/auth/register` (P1) to the public row | Internal inconsistency; §5.5 is the detailed spec | None | api.md §1.6: **done** | No |
| **C-17** | PRD §28: "RAG **or** controlled knowledge context"; tech_stack.md §5: embeddings "may be used"; tech_stack.md §8: avoid extra technology | **DECIDED:** P0 retrieval uses PostgreSQL full-text search (`to_tsvector`/`plainto_tsquery`) plus category match over `resort_information`. No vector store. Top `k` rows (**A-17**: 5) are passed to the LLM | Satisfies PRD §28's "controlled knowledge context" with existing infrastructure | Embeddings stay future scope | none | No |
| **C-19** | api.md §1.4: money in INR. ML trained on H1 `ADR` (EUR scale; ML's `premium_guest` tag uses `adr > 150`) | **DECIDED (mechanism):** the DB stores INR. The adapter divides `adr` by a single config constant `ML_ADR_INR_PER_UNIT` before calling ML. **Value OPEN (A-19)**, proposed 90 | Keeps the public API in INR and model inputs in the scale the model was trained on | Without the factor, ADR (5th most important feature) is ~90× out of range | `ml-contracts.md`: **done** | Adapter value only |
| **C-20** | api.md §3 `bookingChannel` values (`Direct`, `Online TA`, `Offline TA/TO`, `Corporate`) are H1 **market segments**; ML also needs **distribution channel** (`TA/TO`, `Direct`, `Corporate`, `GDS`) | **DECIDED:** `bookings.booking_channel` = market segment (public `bookingChannel`, unchanged). New internal column `distribution_channel`, never exposed publicly | No contract change; supplies the real model input | Additive column (C-06) | database.md (§7) | No |
| **C-25** | The `backend/.gitignore` header on `origin/main` says "Node.js / TypeScript"; api.md §11.2, architecture.md §5 and DE §10/§23 use `.js` and `module.exports` | **DECIDED:** JavaScript (CommonJS) on the Node.js LTS runtime | Every document reference is JS | None | none | No |
| **C-27** | api.md §6.2/§6.3 accept an optional `roomType` filter; design.md §6.2 has a room-type selector; ML-impl forecasts the whole resort only | **INTERIM:** the parameter stays in the contract (a requirement isn't removed). While ML can't serve it, a supplied `roomType` returns `400 VALIDATION_ERROR` with `details:[{field:"roomType", issue:"not_supported"}]`. It is **never** silently ignored: a whole-resort forecast labelled "Deluxe" would be a false forecast | ARCH §24 | The frontend disables the selector until supported. **CR-07:** room-type forecasting | api.md §6.2: **done**; design.md §6.2: **done** | No |
| **C-28** *(new)* | PRD §8's example ("Current bookings: 175 → Day 1 182 …" against 220 rooms) reads as bookings on the books. ML `predicted_confirmed_bookings` is the model's `ConfirmedBookings` target: **non-cancelled arrivals per arrival date** | **DECIDED:** `predictedBookings` = predicted confirmed arrivals for that date. `history[].actualBookings` uses the same definition (resolves U-05). `currentBookings` = confirmed arrivals today | Actual and forecast must be on one axis to be comparable | PRD §8's example numbers won't be reproduced literally | api.md §6.2: **done** | No |
| **C-29** *(new)* | api.md §9: "**Only** the Node backend calls these". ML-impl sets CORS `allow_origins` to include `"*"`, and the hosting plan (ARCH §25) puts ML on a public host | **OPEN (deployment phase):** decide on private networking or a shared secret between Node and ML | Security (PRD §58) | None for P0 development | — | Deployment only |

### Already resolved (traceability only)

| ID | Resolved by | Effect on backend |
|---|---|---|
| C-12 | api.md §1.5 | Custom JWT with `users.password_hash`. Supabase = Postgres only. |
| C-18 | api.md §2 | Backend computes `riskLevel` with HIGH ≥ 0.70, MEDIUM ≥ 0.40; ML's `risk_level` (0.35) is ignored |
| C-21 | api.md §4 | Sentiment, pricing, staffing, service requests = P1 |
| C-22 | api.md §4 | Preference prediction = P0 |
| C-23 | api.md §10 | Only api.md endpoint names |
| C-24 | api.md §11.2 | Role routers (`manager.routes.js`, …) |
| C-26 | api.md §6.1 | No revenue/ADR KPI in P0 |

---

## 4. Schema changes decided in this log

Additive only. To be written into `docs/database.md` once C-01 brings it onto this branch (§7).

| Table | Change | Decision |
|---|---|---|
| `bookings` | + `distribution_channel VARCHAR(50) NULL`, `meal VARCHAR(20) NULL`, `country VARCHAR(3) NULL`, `booking_changes INT NULL`, `required_car_parking_spaces INT NULL`, `reserved_room_type_code VARCHAR(2) NULL` | C-06, C-20 |
| `recommendations` | + `note TEXT NULL`, `updated_at TIMESTAMPTZ NOT NULL`, `dedup_key VARCHAR(120) NOT NULL UNIQUE` | C-10, C-13 |
| `predictions` | promote to P0; + `payload JSONB NULL`; `entity_id` → nullable; index `(prediction_type, entity_id, created_at DESC)` | C-11 |
| `chat_conversations` *(new)* | `id UUID PK`, `guest_id UUID NOT NULL → guests.id`, `created_at`, `updated_at` | C-09 |
| `chat_messages` *(new)* | `id UUID PK`, `conversation_id UUID NOT NULL → chat_conversations.id`, `role VARCHAR(10) CHECK IN ('GUEST','ASSISTANT')`, `content TEXT NOT NULL`, `grounded BOOLEAN NULL`, `sources JSONB NULL`, `used_preferences JSONB NULL`, `created_at` | C-09 |
| `users` | unique index on `email` (implied by DB §4.1 "Unique login email") | clarification |

Not added: a guest-facing `previous_visits` column (derived, U-08), and any activity-prediction storage (C-08, U-09).

---

## 5. Undefined items (U-01 … U-24)

Every decision below is an **assumption**. The "Confirm" column names who confirms it. Numeric values live in `RULE_CONFIG` or `config/`, never inline.

| ID | Item | Decision | Status | Confirm |
|---|---|---|---|---|
| U-01 | `currentOccupancy` | Bookings with `status ∈ {CONFIRMED, CHECKED_IN}` and `arrival_date ≤ today < departure_date`, divided by `count(rooms)` × 100 (one room per booking, as in H1) | DECIDED ⚠ | Product |
| U-02 | `upcomingBookings` window | `CONFIRMED` bookings arriving in `[today, today+30d)` (same window as the cancellation summary default) | DECIDED ⚠ | Product |
| U-03 | Demand level and change % | Levels from occupancy bands `HIGH ≥ 80`, `MEDIUM ≥ 50`, else `LOW`. These are the bands already used by ML-impl, moved into `RULE_CONFIG`. `bookingDemand` = level of the next-7-day average predicted occupancy. `bookingDemandChangePct` = (Σ predicted arrivals next 7 d − Σ actual confirmed arrivals previous 7 d) / previous × 100; `null` if previous = 0 or ML is unavailable. Room-type `demandLevel` = band of that type's booked occupancy for the window; `demandChangePct` = booked rooms this window vs the previous equal window (DB only) | DECIDED ⚠ | Product |
| U-04 | Insight generation | Deterministic templates keyed to KPI values and triggered rules; wording follows the api.md §6.1 examples. LLM rephrasing is behind a flag, **off by default**, and may not change numbers | DECIDED ⚠ | Product |
| U-05 | "Actual bookings" for `history` | Resolved by C-28 | DECIDED | — |
| U-06 | "Special requirements today" | Today's arrivals where `guests.special_requirements` is non-empty **or** `bookings.special_requests > 0` | DECIDED ⚠ | Product |
| U-07 | Guest-list row and `topPreference` | One row per guest, using the earliest booking arriving in the range (the `status` filter applies to that booking). `topPreference` = the first non-`ROOM` preference ordered by source (`EXPLICIT` > `HISTORY` > `PREDICTED`), then confidence desc; value only | DECIDED ⚠ | Product |
| U-08 | `previousVisits`, `previousCancellations` | Derived from the guest's own bookings: count of `CHECKED_OUT` and count of `CANCELLED`. The ML input keeps using each booking's own `previous_cancellations` column; the seed must keep the two consistent (U-22) | DECIDED ⚠ | Product |
| U-09 | Persist predicted preferences? | No write-back in P0; predictions are returned live (and cached in `predictions`) | DECIDED | — |
| U-10 | Pricing formula | — | DEFERRED (P1) | — |
| U-11 | Sentiment trend / scoring schedule | — | DEFERRED (P1) | — |
| U-12 | Staffing formula | — | DEFERRED (P1) | — |
| U-13 | Service-request priority and transitions; `requestType` values | — | DEFERRED (P1) | — |
| U-14 | Guest token without a guest row; client-supplied `guestId` | Registration and seed create `users` and `guests` in one transaction. At login, a `GUEST` user with no linked guest gets `500 INTERNAL_ERROR` (logged as a data-integrity error; no token issued). On guest routes, any `guestId` in path, query or body → `400 VALIDATION_ERROR` (`issue: "not_allowed"`) instead of being silently ignored | DECIDED ⚠ | Backend lead |
| U-15 | Free-text length caps | `search` ≤ 100 chars; other free-text caps as in api.md (`message` ≤ 1000, `note` ≤ 500) | DECIDED ⚠ | Backend lead |
| U-16 | Unknown or foreign `conversationId` | `404 NOT_FOUND` for both, so existence isn't revealed | DECIDED ⚠ | Backend lead |
| U-17 | `grounded` definition and output guard | `grounded = true` only if ≥ 1 `resort_information` row was retrieved **and** passed to the LLM; `sources` = exactly those rows. If none are retrieved, the fixed fallback text is returned without calling the LLM. Output guard: if the reply contains a time, price or number not present in the supplied sources, guest profile or booking, it is replaced by the fallback (`grounded: false`). This implements PRD §29 | DECIDED ⚠ | Product + backend |
| U-18 | Readable cancellation factors | `factors` = the PRD §20 factor set only (lead time, previous cancellation history, booking channel, deposit type), with the booking's actual values, e.g. `"Lead time: 72 days"`, `"Previous cancellations: 2"`, `"Booking channel: Online TA"`, `"Deposit type: No Deposit"`. Ordered by the model's global importance; count factors with value 0 omitted. No invented "long/short" thresholds. Country is never listed | DECIDED ⚠ | Product |
| U-19 | Login rate limit | 10 attempts / 15 min / IP. Chat stays at 20/min/guest (api.md §8.5) | DECIDED ⚠ | Backend lead |
| U-20 | LLM health | `llm: "ok"` when provider config is present (no paid call per health check). DB: `SELECT 1`. ML: `GET /health` with a 2 s timeout plus `models_loaded` | DECIDED ⚠ | Backend lead |
| U-21 | Password hashing | bcrypt, cost 10 | DECIDED ⚠ | Backend lead |
| U-22 | Seed / demo data | Synthetic seed shaped like the PRD §63 scenario: 220 rooms split 100/80/40 across STANDARD/DELUXE/SUITE (api.md §6.5), demo users from api.md §5.2 / design.md §5.1, Rahul Sharma with the api.md §7.3 profile, preferences and activities, and ML input columns populated. **The seed never writes prediction values or risk levels.** Displayed probabilities and counts are whatever ML returns, so the PRD numbers (84 %, 17 high-risk, 95 % peak) are targets for shaping the data, not guarantees. H1 import is not P0 | DECIDED ⚠ | Product + ML |
| U-23 | Testing / observability / deployment specifics | Defined in the later backend docs; constraint: no infrastructure beyond tech_stack.md §7 | DEFERRED to Phase 1 planning | — |
| **U-24** *(new)* | Timezone for "today" | All date windows use `RESORT_TIMEZONE` (**A-24**: `Asia/Kolkata`, inferred from INR). Stored timestamps stay UTC (api.md §1.4) | DECIDED ⚠ | Product |

---

## 6. Assumption register (introduced in this log)

| ID | Assumption | Where it lives | Confirm with |
|---|---|---|---|
| A-02 | `modelVersion` format `"<model>@<version>"` | ML adapter | ML team |
| A-06a | Cancellation scoring concurrency = 8 | ML adapter config | Backend lead |
| A-06b | Weekend nights = Saturday or Sunday nights (H1 dataset definition) | ML adapter | ML team |
| A-07 | Proposed room-type map (**not adopted**; C-07 is OPEN) | `ml-contracts.md` §4 | ML/data owner |
| A-13a | Decision Engine refresh interval = 15 min | `RULE_CONFIG` | Product |
| A-13b | A dedup key is never re-inserted in any status | Decision Engine | Product |
| A-14a | Aggregate high-risk rec: HIGH if count > `highRiskCancellationCount`, else MEDIUM | Decision Engine | Product |
| A-14b | Aggregate medium-risk rec: LOW priority | Decision Engine | Product |
| A-17 | Top 5 resort-info rows per chat | Concierge config | Backend lead |
| A-19 | `ML_ADR_INR_PER_UNIT` = 90 (**value OPEN**) | ML adapter config | ML team |
| A-24 | `RESORT_TIMEZONE = Asia/Kolkata` | env | Product |
| U-01 … U-22 | As in §5 | `RULE_CONFIG` / services | as in §5 |

---

## 7. Documentation update log

### Done in this phase

| File | Change | Decision |
|---|---|---|
| `docs/api.md` §1.6 | `/api/auth/register` added to the public row | C-16 |
| `docs/api.md` §6.2 | `confidence` nullable; `predictedBookings` meaning; `roomType` not-supported behaviour | C-03, C-27, C-28 |
| `docs/api.md` §6.3 | Occupancy source = ML rate; bounds omitted in ML v1; forecast-date rule | C-04, C-05, C-27 |
| `docs/api.md` §7.6 | Predicted preferences limited to what ML v1 produces | C-08 |
| `docs/api.md` §9 | §9.0 "Implementation status" added. The existing §9 shapes are kept as the **target** contract; the factor-labelling sentence now points to U-18 | C-02…C-08 |
| `docs/api.md` §12 | `ML_SERVICE_URL` example includes the prefix; `RESORT_TIMEZONE` added | C-02, U-24 |
| `docs/design.md` §6.2, §7.3 | Confidence hidden when null; room-type selector disabled; predicted-preferences note | C-03, C-08, C-27 |
| `docs/ml-contracts.md` | Draft: implemented ML v1 contract, adapter mapping, change requests CR-01…CR-07 | C-02…C-08, C-19 |
| `backend/docs/requirements-map.md` | Header points here for current statuses | — |

### Pending: requires C-01 first

These files are stubs or overviews on this branch. Editing them here would guarantee merge conflicts with `origin/main`.

| File (main version) | Change |
|---|---|
| `docs/prd.md`, `docs/architecture.md` | Replace the `backend` overviews with the `origin/main` versions |
| `docs/database.md` | Apply §4 (columns, new tables, `predictions` → P0 in §9 "Minimum Hackathon Database") |
| `docs/decision-engine.md` §10 | Add `recommendationRefreshMinutes`, demand bands (U-03) to `RULE_CONFIG` |
| `docs/decision-engine.md` §11, §12, §19 | Trigger and dedup key (C-13); aggregate R2/R3 (C-14) |
| `docs/architecture.md` §9, §19, §23 | Pointers to C-05, api.md §10, api.md §12 env names |

---

## 8. Remaining blockers

### For Phase 1 (backend foundation: Express app, config, error envelope, health, test harness)

| Blocker | Why | Owner |
|---|---|---|
| **None hard.** | Foundation depends only on C-25 (decided), api.md §1 (stable), U-20 and U-24 (decided ⚠) | — |

### For later phases

| Blocker | Blocks | Owner |
|---|---|---|
| **C-01**: bring `origin/main` docs onto `backend`, then apply §7 pending edits | Database phase, Decision Engine phase | Repo owner |
| **C-04 / CR-04**: ML forecast must accept a start date | A working forecast, predicted-occupancy KPI, rules R1/R4/R9, manager demo journey | ML team |
| **C-07**: room-type mapping | ROOM prediction and room code in the cancellation input | ML/data owner |
| **C-15**: LLM provider/model | Concierge and LLM phrasing integration | Team lead |
| **A-19**: ADR conversion factor value | Accurate cancellation/preference inputs | ML team |
| Product confirmation of the ⚠ items in §5/§6 | None block coding (all are config), but must be confirmed before the demo | Product |
