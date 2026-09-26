# ML Contracts

## Smart Resort 360

> **Status: DRAFT by backend, pending ML owner confirmation.**
> api.md §9 names this file as owned by the ML team. The backend wrote this first version to document (1) the ML service **as implemented** and (2) how the Node adapter maps to it. The ML team should correct anything wrong here and own the file from now on.
> Decisions referenced (`C-xx`, `U-xx`, `A-xx`) are in [backend/docs/decisions.md](../backend/docs/decisions.md). The target contract remains api.md §9.

---

## 1. Service (implemented v1.0.0)

Source: `ml-service/app/` on `origin/main`, commit `796ce66`.

| Item | Value |
|---|---|
| Framework | FastAPI, models loaded once at startup |
| Route prefix | `/api/v1/ml` → backend `ML_SERVICE_URL = http://<host>:8000/api/v1/ml` (C-02) |
| Training data | `H1.csv` (hotel-bookings "Resort Hotel" dataset, 2015–2017) |
| Casing | snake_case; no envelope; errors `{ "detail": ... }` |
| Not loaded | Every predict route returns `503` |

## 2. Endpoints as implemented

### 2.1 `GET /health`

```json
{ "status": "ok", "service": "Smart Resort 360 ML Service", "models_loaded": true }
```

### 2.2 `GET /data/summary`

Returns `metadata.json` for `cancellation`, `occupancy` and `guest_preferences` (model name, `version`, features, metrics). The backend reads `version` from here (C-02, A-02).

### 2.3 `GET /predict/occupancy?days=1..90`

No request body. Response:

```json
{
  "forecast_days": 7,
  "predictions": [
    { "date": "YYYY-MM-DD", "predicted_confirmed_bookings": 48.3, "predicted_occupancy_rate": 71.25, "demand_level": "MEDIUM", "day_of_week": "Monday" }
  ],
  "summary": { "avg_predicted_occupancy_pct": 0, "peak_date": "", "peak_occupancy_pct": 0, "total_expected_confirmed_bookings": 0 }
}
```

- Dates start the day after the **last date in the training data**, not today (C-04).
- `predicted_confirmed_bookings` = non-cancelled arrivals for that date (C-28).
- Models: `XGBRegressor` ×2. Reported R² is negative for both targets (`occupancy/metadata.json`).

### 2.4 `POST /predict/cancellation`

One booking per call. Request fields (defaults apply when omitted):

`lead_time`*, `adr`*, `adults`, `children`, `babies`, `stays_in_weekend_nights`, `stays_in_week_nights`, `previous_cancellations`, `previous_bookings_not_canceled`, `booking_changes`, `required_car_parking_spaces`, `total_of_special_requests`, `is_repeated_guest`, `room_type_changed`, `meal`, `country`, `market_segment`, `distribution_channel`, `deposit_type`, `customer_type`, `reserved_room_type`, `arrival_date_month` (* required)

Response:

```json
{ "cancellation_probability": 0.84, "risk_level": "HIGH", "risk_score_pct": 84.0,
  "top_risk_factors": [ { "feature": "Country_enc", "importance": 0.1532, "value": 12.0 } ] }
```

- `risk_level` uses 0.35 / 0.70. **The backend ignores it** and applies 0.40 / 0.70 (api.md §2, C-18).
- `top_risk_factors` = the model's **global** importances (same order for every booking), not per-booking contributions (C-06, U-18).
- Model: `RandomForestClassifier`, ROC-AUC 0.955.

### 2.5 `POST /predict/guest-preferences`

Request: `adults`, `children`, `babies`, `total_stays`, `stays_in_weekend_nights`, `stays_in_week_nights`, `adr`, `total_of_special_requests`, `required_car_parking_spaces`, `country`, `market_segment`, `customer_type`.

Response:

```json
{ "predicted_meal_plan": "BB", "predicted_room_type": "A", "meal_confidence": 0.84,
  "room_confidence": 0.65, "is_family": false, "personalization_tags": ["weekend_stay"] }
```

## 3. Backend adapter mapping (Node `services/mlService.js`)

### 3.1 Cancellation input ← `bookings` row

| ML field | Source | Note |
|---|---|---|
| `lead_time` | `arrival_date − booking_date` (days) | |
| `adr` | `bookings.adr / ML_ADR_INR_PER_UNIT` | C-19; factor value **OPEN** (A-19) |
| `adults`, `children`, `babies` | same-named columns | |
| `stays_in_weekend_nights`, `stays_in_week_nights` | derived from arrival–departure range | Saturday or Sunday nights = weekend (A-06b) |
| `previous_cancellations` | `bookings.previous_cancellations` | |
| `previous_bookings_not_canceled` | `bookings.previous_bookings` | |
| `total_of_special_requests` | `bookings.special_requests` | |
| `is_repeated_guest` | `previous_bookings > 0` | |
| `room_type_changed` | assigned room's `room_type` ≠ `bookings.room_type` | |
| `market_segment` | `bookings.booking_channel` | C-20 |
| `distribution_channel`, `meal`, `country`, `booking_changes`, `required_car_parking_spaces` | new nullable `bookings` columns | C-06; omitted when null |
| `reserved_room_type` | `bookings.reserved_room_type_code` | C-06/C-07; omitted when null |
| `deposit_type`, `customer_type` | same-named columns | |
| `arrival_date_month` | month name of `arrival_date` | |

### 3.2 Output mapping

| ML | Public (camelCase) |
|---|---|
| `cancellation_probability` | `cancellationProbability` |
| — | `riskLevel` computed by the backend (api.md §2) |
| `top_risk_factors` | used only to **order** the PRD §20 factor labels (U-18) |
| `predicted_confirmed_bookings` | `predictedBookings` |
| `predicted_occupancy_rate` | `predictedOccupancy` (clamped 0–100, C-05) |
| `predicted_room_type` | `{type:"ROOM", value:<RoomType via §4>}`; dropped while C-07 is open |
| `predicted_meal_plan` | `{type:"FOOD", value:"Bed & Breakfast" \| "Half Board" \| "Full Board"}`; `SC/Undefined` dropped (C-08) |
| `demand_level`, `day_of_week`, `summary`, `risk_score_pct`, `is_family`, `personalization_tags` | not exposed |
| `metadata.version` | `modelVersion = "<model>@<version>"` (A-02) |

## 4. Room-type mapping — OPEN (C-07)

The public `RoomType` is `STANDARD | DELUXE | SUITE`. The dataset uses `A B C D E F G H L P`.

**Proposed, not adopted (A-07):** `A, B, C → STANDARD` · `D, E, F → DELUXE` · `G, H, L, P → SUITE`. The ML/data owner must confirm or replace this.

## 5. Change requests to the ML service

| ID | Request | Priority for backend |
|---|---|---|
| CR-01 | Include `model_version` in every prediction response | Low |
| CR-02 | Include per-model versions in `/health` | Low |
| CR-03 | Booking forecast that consumes the events calendar (DE §13, ARCH §15) | Medium |
| **CR-04** | `GET /predict/occupancy?start_date=YYYY-MM-DD&days=N`: calendar features for the requested dates, lags from the latest available data | **Blocking**: all forecasts are unavailable without it |
| CR-05 | Batch cancellation endpoint echoing `booking_id`, with per-booking factor contributions | Medium (performance) |
| CR-06 | Preference model per api.md §9.5, including `ACTIVITY` | Medium (PRD §17) |
| CR-07 | Forecast per room type (api.md §6.2 `roomType`) | Low |
