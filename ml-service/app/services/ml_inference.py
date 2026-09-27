


"""
Smart Resort 360 — ML Model Service (inference layer)
Loads trained .pkl models and provides prediction functions for FastAPI routes.
"""
import os
import numpy as np
import pandas as pd
import joblib
from typing import Dict, List, Optional

MODEL_BASE = os.path.join(os.getcwd(), "app", "models")

CANCELLATION_FEATURES = [
    "LeadTime", "Adults", "Children", "Babies", "TotalGuests",
    "StaysInWeekendNights", "StaysInWeekNights", "TotalStays",
    "PreviousCancellations", "PreviousBookingsNotCanceled",
    "BookingChanges", "RequiredCarParkingSpaces", "TotalOfSpecialRequests",
    "ADR", "IsRepeatedGuest", "RoomTypeChanged",
    "Meal_enc", "Country_enc", "MarketSegment_enc",
    "DistributionChannel_enc", "DepositType_enc", "CustomerType_enc",
    "ReservedRoomType_enc", "ArrivalDateMonth_enc",
]

OCCUPANCY_FEATURES = [
    "DayOfWeek", "WeekNumber", "Month", "Year",
    "IsWeekend", "IsHoliday",
    "Lag7_TotalBookings", "Lag14_TotalBookings", "Lag30_TotalBookings",
    "Roll7_AvgADR", "Roll7_AvgLeadTime",
]

GUEST_PREF_FEATURES = [
    "Adults", "Children", "Babies", "IsFamily",
    "TotalStays", "StaysInWeekendNights", "StaysInWeekNights",
    "ADR", "TotalOfSpecialRequests", "RequiredCarParkingSpaces",
    "Country_enc", "MarketSegment_enc", "CustomerType_enc",
]

MEAL_LABELS = {0: "BB", 1: "FB", 2: "HB", 3: "SC/Undefined"}
ROOM_LABELS = {0: "A", 1: "B", 2: "C", 3: "D", 4: "E", 5: "F", 6: "G", 7: "H", 8: "L", 9: "P"}

PEAK_MONTHS = [7, 8, 12, 1]


class MLModelService:
    _instance = None

    def __init__(self):
        self._cancellation_model = None
        self._occ_bookings_model = None
        self._occ_rate_model = None
        self._guest_pref_model = None
        self._encoders: Dict[str, any] = {}
        self._pref_encoders: Dict[str, any] = {}
        self._daily_df: Optional[pd.DataFrame] = None
        self._loaded = False

    def load_models(self):
        """Load all trained model artifacts. Called at FastAPI startup."""
        cancel_dir = os.path.join(MODEL_BASE, "cancellation")
        occ_dir = os.path.join(MODEL_BASE, "occupancy")
        pref_dir = os.path.join(MODEL_BASE, "guest_preferences")

        # Cancellation model
        self._cancellation_model = joblib.load(os.path.join(cancel_dir, "cancellation_model.pkl"))

        # Cancellation label encoders
        enc_dir = os.path.join(cancel_dir, "encoders")
        enc_cols = ["Meal", "Country", "MarketSegment", "DistributionChannel",
                    "DepositType", "CustomerType", "ReservedRoomType", "ArrivalDateMonth"]
        for col in enc_cols:
            enc_path = os.path.join(enc_dir, f"{col}_encoder.pkl")
            if os.path.exists(enc_path):
                self._encoders[col] = joblib.load(enc_path)

        # Occupancy models
        self._occ_bookings_model = joblib.load(os.path.join(occ_dir, "occupancy_bookings_model.pkl"))
        self._occ_rate_model = joblib.load(os.path.join(occ_dir, "occupancy_rate_model.pkl"))

        # Load historical daily data for lag/rolling computation
        data_path = os.path.join(os.getcwd(), "data", "processed", "daily_occupancy_forecast_data.csv")
        if os.path.exists(data_path):
            self._daily_df = pd.read_csv(data_path, parse_dates=["ArrivalDate"])
            self._daily_df = self._daily_df.sort_values("ArrivalDate").reset_index(drop=True)

        # Guest preference model
        self._guest_pref_model = joblib.load(os.path.join(pref_dir, "guest_preference_model.pkl"))
        pref_enc_dir = os.path.join(pref_dir, "encoders")
        for col in ["Country", "MarketSegment", "CustomerType"]:
            enc_path = os.path.join(pref_enc_dir, f"{col}_encoder.pkl")
            if os.path.exists(enc_path):
                self._pref_encoders[col] = joblib.load(enc_path)

        self._loaded = True
        print("✅ All ML models loaded successfully.")

    def _safe_encode(self, encoders: dict, col: str, value: str) -> int:
        """Encode a categorical value. Falls back to 0 for unseen labels."""
        le = encoders.get(col)
        if le is None:
            return 0
        try:
            return int(le.transform([value.strip()])[0])
        except ValueError:
            return 0

    # ─── Cancellation Risk ────────────────────────────────────────────────────

    def predict_cancellation(self, req) -> dict:
        total_guests = req.adults + req.children + req.babies
        total_stays = req.stays_in_weekend_nights + req.stays_in_week_nights

        row = {
            "LeadTime": req.lead_time,
            "Adults": req.adults,
            "Children": req.children,
            "Babies": req.babies,
            "TotalGuests": total_guests,
            "StaysInWeekendNights": req.stays_in_weekend_nights,
            "StaysInWeekNights": req.stays_in_week_nights,
            "TotalStays": total_stays,
            "PreviousCancellations": req.previous_cancellations,
            "PreviousBookingsNotCanceled": req.previous_bookings_not_canceled,
            "BookingChanges": req.booking_changes,
            "RequiredCarParkingSpaces": req.required_car_parking_spaces,
            "TotalOfSpecialRequests": req.total_of_special_requests,
            "ADR": req.adr,
            "IsRepeatedGuest": req.is_repeated_guest,
            "RoomTypeChanged": req.room_type_changed,
            "Meal_enc": self._safe_encode(self._encoders, "Meal", req.meal),
            "Country_enc": self._safe_encode(self._encoders, "Country", req.country),
            "MarketSegment_enc": self._safe_encode(self._encoders, "MarketSegment", req.market_segment),
            "DistributionChannel_enc": self._safe_encode(self._encoders, "DistributionChannel", req.distribution_channel),
            "DepositType_enc": self._safe_encode(self._encoders, "DepositType", req.deposit_type),
            "CustomerType_enc": self._safe_encode(self._encoders, "CustomerType", req.customer_type),
            "ReservedRoomType_enc": self._safe_encode(self._encoders, "ReservedRoomType", req.reserved_room_type),
            "ArrivalDateMonth_enc": self._safe_encode(self._encoders, "ArrivalDateMonth", req.arrival_date_month),
        }

        X = pd.DataFrame([row])[CANCELLATION_FEATURES]
        prob = float(self._cancellation_model.predict_proba(X)[0, 1])

        if prob >= 0.70:
            risk = "HIGH"
        elif prob >= 0.35:
            risk = "MEDIUM"
        else:
            risk = "LOW"

        # Build top risk factors from feature importances
        importances = self._cancellation_model.feature_importances_
        feat_vals = list(zip(CANCELLATION_FEATURES, importances, X.values[0]))
        feat_vals.sort(key=lambda x: x[1], reverse=True)
        top_factors = [
            {"feature": f, "importance": round(float(i), 4), "value": round(float(v), 2)}
            for f, i, v in feat_vals[:5]
        ]

        return {
            "cancellation_probability": round(prob, 4),
            "risk_level": risk,
            "risk_score_pct": round(prob * 100, 2),
            "top_risk_factors": top_factors,
        }

    # ─── Occupancy Forecast ───────────────────────────────────────────────────

    def predict_occupancy_forecast(self, days: int = 30, start_date: str = None) -> dict:
        if self._daily_df is None:
            raise RuntimeError("Daily data not loaded.")

        # CR-04 (docs/ml-contracts.md): without start_date, forecasts anchor to
        # the day after the training data ends (2016-04-12 for this dataset),
        # which is useless to a caller wanting "starting tomorrow" in the real
        # present. When start_date is given, calendar features (day-of-week,
        # month, holiday flag, etc.) are computed against the REAL requested
        # dates, while the lag/rolling booking-volume features still seed from
        # the historical tail below — the daily aggregate table only has
        # continuous history through 2016, so "typical recent booking pattern"
        # is approximated from that history rather than fabricated.
        last_row = self._daily_df.iloc[-1]
        if start_date:
            # The loop below always predicts starting at last_date + 1 day, so
            # base_date = start_date itself (not start_date - 1) — matching the
            # route's documented "forecast starts the day AFTER this date".
            base_date = pd.Timestamp(start_date)
        else:
            base_date = pd.Timestamp(last_row["ArrivalDate"])
        last_date = base_date
        avg_bookings = self._daily_df["ConfirmedBookings"].tail(30).mean()
        avg_adr = self._daily_df["AvgADR"].tail(30).mean()
        avg_lead_time = self._daily_df["AvgLeadTime"].tail(30).mean()

        # Lag buffers from real historical tail
        lag_buffer = list(self._daily_df["TotalBookings"].tail(30).values)

        predictions = []
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        for i in range(1, days + 1):
            target_date = last_date + pd.Timedelta(days=i)
            dow = target_date.dayofweek
            week_num = target_date.isocalendar()[1]
            month = target_date.month
            year = target_date.year
            is_weekend = int(dow >= 5)
            is_holiday = int(month in PEAK_MONTHS)

            lag7 = lag_buffer[-7] if len(lag_buffer) >= 7 else avg_bookings
            lag14 = lag_buffer[-14] if len(lag_buffer) >= 14 else avg_bookings
            lag30 = lag_buffer[-30] if len(lag_buffer) >= 30 else avg_bookings
            roll7_adr = avg_adr
            roll7_lead = avg_lead_time

            row = {
                "DayOfWeek": dow, "WeekNumber": week_num, "Month": month, "Year": year,
                "IsWeekend": is_weekend, "IsHoliday": is_holiday,
                "Lag7_TotalBookings": lag7, "Lag14_TotalBookings": lag14, "Lag30_TotalBookings": lag30,
                "Roll7_AvgADR": roll7_adr, "Roll7_AvgLeadTime": roll7_lead,
            }
            X = pd.DataFrame([row])[OCCUPANCY_FEATURES]
            pred_conf = max(0, float(self._occ_bookings_model.predict(X)[0]))
            pred_occ = max(0, min(100, float(self._occ_rate_model.predict(X)[0])))

            if pred_occ >= 80:
                demand = "HIGH"
            elif pred_occ >= 50:
                demand = "MEDIUM"
            else:
                demand = "LOW"

            predictions.append({
                "date": target_date.strftime("%Y-%m-%d"),
                "predicted_confirmed_bookings": round(pred_conf, 1),
                "predicted_occupancy_rate": round(pred_occ, 2),
                "demand_level": demand,
                "day_of_week": day_names[dow],
            })

            lag_buffer.append(pred_conf)

        avg_occ = np.mean([p["predicted_occupancy_rate"] for p in predictions])
        peak = max(predictions, key=lambda x: x["predicted_occupancy_rate"])
        total_guests = sum(p["predicted_confirmed_bookings"] for p in predictions)

        return {
            "forecast_days": days,
            "predictions": predictions,
            "summary": {
                "avg_predicted_occupancy_pct": round(avg_occ, 2),
                "peak_date": peak["date"],
                "peak_occupancy_pct": peak["predicted_occupancy_rate"],
                "total_expected_confirmed_bookings": round(total_guests, 0),
            },
        }

    # ─── Guest Preference ─────────────────────────────────────────────────────

    def predict_guest_preferences(self, req) -> dict:
        is_family = int((req.children > 0) or (req.babies > 0))

        row = {
            "Adults": req.adults,
            "Children": req.children,
            "Babies": req.babies,
            "IsFamily": is_family,
            "TotalStays": req.total_stays,
            "StaysInWeekendNights": req.stays_in_weekend_nights,
            "StaysInWeekNights": req.stays_in_week_nights,
            "ADR": req.adr,
            "TotalOfSpecialRequests": req.total_of_special_requests,
            "RequiredCarParkingSpaces": req.required_car_parking_spaces,
            "Country_enc": self._safe_encode(self._pref_encoders, "Country", req.country),
            "MarketSegment_enc": self._safe_encode(self._pref_encoders, "MarketSegment", req.market_segment),
            "CustomerType_enc": self._safe_encode(self._pref_encoders, "CustomerType", req.customer_type),
        }

        X = pd.DataFrame([row])[GUEST_PREF_FEATURES]
        preds = self._guest_pref_model.predict(X)[0]
        probas = self._guest_pref_model.predict_proba(X)

        meal_pred = int(preds[0])
        room_pred = int(preds[1])

        meal_label = MEAL_LABELS.get(meal_pred, "BB")
        room_label = ROOM_LABELS.get(room_pred, "A")

        meal_conf = float(max(probas[0][0])) if probas[0].shape[1] > meal_pred else 0.7
        room_conf = float(max(probas[1][0])) if probas[1].shape[1] > room_pred else 0.7

        tags = []
        if is_family:
            tags.append("family_room_prep")
        if req.total_of_special_requests > 1:
            tags.append("high_special_requests")
        if req.required_car_parking_spaces > 0:
            tags.append("parking_required")
        if req.stays_in_weekend_nights > 0:
            tags.append("weekend_stay")
        if req.adr > 150:
            tags.append("premium_guest")

        return {
            "predicted_meal_plan": meal_label,
            "predicted_room_type": room_label,
            "meal_confidence": round(meal_conf, 4),
            "room_confidence": round(room_conf, 4),
            "is_family": bool(is_family),
            "personalization_tags": tags,
        }


# Singleton
ml_service = MLModelService()
