"""
Smart Resort 360 — Shared Feature Engineering
Used by all three ML model training scripts.
No synthetic data — operates purely on H1.csv processed output.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import joblib
import os

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

GUEST_PREF_TARGETS = ["Meal_enc", "ReservedRoomType_enc"]


def encode_column(df: pd.DataFrame, col: str, encoder_dir: str, fit: bool = True) -> pd.DataFrame:
    """Fits or loads a LabelEncoder for a column and adds <col>_enc."""
    enc_path = os.path.join(encoder_dir, f"{col}_encoder.pkl")
    if fit:
        le = LabelEncoder()
        df[f"{col}_enc"] = le.fit_transform(df[col].astype(str).str.strip())
        joblib.dump(le, enc_path)
    else:
        le = joblib.load(enc_path)
        df[f"{col}_enc"] = le.transform(df[col].astype(str).str.strip())
    return df


CATEGORICAL_COLS = [
    "Meal", "Country", "MarketSegment", "DistributionChannel",
    "DepositType", "CustomerType", "ReservedRoomType", "ArrivalDateMonth",
]


def build_encoded_features(df: pd.DataFrame, encoder_dir: str, fit: bool = True) -> pd.DataFrame:
    """Encode all categorical columns and return the enriched dataframe."""
    os.makedirs(encoder_dir, exist_ok=True)
    for col in CATEGORICAL_COLS:
        if col in df.columns:
            df = encode_column(df, col, encoder_dir, fit=fit)
    return df


def build_occupancy_features(daily_df: pd.DataFrame, encoder_dir: str = None) -> pd.DataFrame:
    """
    Engineer time-series features from the daily_occupancy_forecast_data.csv.
    All data is real — no synthetic rows added.
    """
    df = daily_df.copy()
    df["ArrivalDate"] = pd.to_datetime(df["ArrivalDate"])
    df = df.sort_values("ArrivalDate").reset_index(drop=True)

    # Calendar features
    df["DayOfWeek"] = df["ArrivalDate"].dt.dayofweek
    df["WeekNumber"] = df["ArrivalDate"].dt.isocalendar().week.astype(int)
    df["Month"] = df["ArrivalDate"].dt.month
    df["Year"] = df["ArrivalDate"].dt.year
    df["IsWeekend"] = (df["DayOfWeek"] >= 5).astype(int)

    # Minimal holiday approximation based on months (no external API needed)
    peak_months = [7, 8, 12, 1]  # July, Aug, Dec, Jan — known resort peaks in H1 data
    df["IsHoliday"] = df["Month"].isin(peak_months).astype(int)

    # Lag features (real historical values only, NaN for early rows)
    df["Lag7_TotalBookings"] = df["TotalBookings"].shift(7)
    df["Lag14_TotalBookings"] = df["TotalBookings"].shift(14)
    df["Lag30_TotalBookings"] = df["TotalBookings"].shift(30)

    # Rolling window features
    df["Roll7_AvgADR"] = df["AvgADR"].rolling(window=7, min_periods=1).mean()
    df["Roll7_AvgLeadTime"] = df["AvgLeadTime"].rolling(window=7, min_periods=1).mean()

    # Drop rows without lag data (first 30 rows)
    df = df.dropna(subset=["Lag30_TotalBookings"]).reset_index(drop=True)

    return df
