"""
Smart Resort 360 - Data Cleaning & Preprocessing Pipeline
Cleans and prepares raw H1.csv (Resort Hotel) and H2.csv (City Hotel) datasets
according to the Product Requirements Document (PRD).
"""

import pandas as pd
import numpy as np
import os

MONTH_MAP = {
    "January": 1, "February": 2, "March": 3, "April": 4,
    "May": 5, "June": 6, "July": 7, "August": 8,
    "September": 9, "October": 10, "November": 11, "December": 12
}

RESORT_NAME = "Smart Resort 360"

def load_raw_datasets(raw_dir="data/raw"):
    """Loads only H1.csv (Resort Hotel) — Smart Resort 360 operates a single resort."""
    h1_path = os.path.join(raw_dir, "H1.csv")
    
    print(f"[1/6] Loading Resort Hotel dataset: {h1_path}...")
    df = pd.read_csv(h1_path, skipinitialspace=True, na_values=["NULL", "NULL ", " NULL"])
    df["hotel"] = RESORT_NAME
    
    print(f"      Resort Hotel Dataset Shape: {df.shape[0]:,} rows, {df.shape[1]} columns")
    return df

def clean_strings_and_nulls(df):
    """Strips whitespace and imputes missing values cleanly."""
    print("[2/6] Cleaning string columns and imputing missing values...")
    
    # Clean whitespace in string columns
    for col in df.columns:
        if df[col].dtype == "object" or str(df[col].dtype) == "string":
            df[col] = df[col].astype(str).str.strip()
            df[col] = df[col].replace({'nan': np.nan, 'None': np.nan, 'NULL': np.nan, 'Undefined': 'SC/Undefined'})
            
    # Impute missing values based on PRD requirements
    # 1. Children: 4 missing values -> 0
    df["Children"] = df["Children"].fillna(0).astype(int)
    
    # 2. Agent: Missing means direct booking -> 0
    df["Agent"] = df["Agent"].fillna(0).astype(int)
    
    # 3. Company: Missing means individual booking (no corporate company) -> 0
    df["Company"] = df["Company"].fillna(0).astype(int)
    
    # 4. Country: Missing -> Unknown
    df["Country"] = df["Country"].fillna("Unknown")
    
    return df

def filter_invalid_records(df):
    """Filters impossible records such as 0 guests or invalid negative/outlier pricing."""
    print("[3/6] Filtering invalid records (0 guests, price outliers)...")
    initial_count = len(df)
    
    # Filter 1: Must have at least 1 guest (Adults + Children + Babies > 0)
    df["TotalGuests"] = df["Adults"] + df["Children"] + df["Babies"]
    df = df[df["TotalGuests"] > 0].copy()
    
    # Filter 2: Remove invalid negative ADR or extreme outlier (> 5000)
    df = df[(df["ADR"] >= 0) & (df["ADR"] <= 5000)].copy()
    
    removed = initial_count - len(df)
    print(f"      Filtered {removed:,} invalid records. Remaining: {len(df):,} rows")
    return df

def engineer_features(df):
    """Engineers key features required for ML models (Cancellation, Booking Demand, Guest Preferences)."""
    print("[4/6] Engineering ML features...")
    
    # Total Stay Duration
    df["TotalStays"] = df["StaysInWeekendNights"] + df["StaysInWeekNights"]
    
    # Room Type Changed Flag (Reserved vs Assigned)
    df["RoomTypeChanged"] = (df["ReservedRoomType"] != df["AssignedRoomType"]).astype(int)
    
    # Family Flag
    df["IsFamily"] = ((df["Children"] > 0) | (df["Babies"] > 0)).astype(int)
    
    # Arrival Date datetime construction
    df["ArrivalMonthNum"] = df["ArrivalDateMonth"].map(MONTH_MAP)
    df["ArrivalDate"] = pd.to_datetime(
        df["ArrivalDateYear"].astype(str) + '-' +
        df["ArrivalMonthNum"].astype(str).str.zfill(2) + '-' +
        df["ArrivalDateDayOfMonth"].astype(str).str.zfill(2),
        errors='coerce'
    )
    
    # Reservation Status Date datetime conversion
    df["ReservationStatusDate"] = pd.to_datetime(df["ReservationStatusDate"], errors='coerce')
    
    return df

def generate_subsets_and_save(df, processed_dir="data/processed"):
    """Saves full cleaned dataset and specific subsets for each PRD ML Model."""
    print(f"[5/6] Exporting processed datasets to {processed_dir}...")
    os.makedirs(processed_dir, exist_ok=True)
    
    # 1. Full Cleaned Dataset
    cleaned_path = os.path.join(processed_dir, "hotel_bookings_cleaned.csv")
    df.to_csv(cleaned_path, index=False)
    print(f"      Saved cleaned dataset: {cleaned_path} ({len(df):,} rows)")
    
    # 2. Time-Series Aggregated Daily Occupancy & Booking Forecast Data (For Model 1)
    # Single resort — group by ArrivalDate only
    daily_demand = df.groupby(["ArrivalDate"]).agg(
        TotalBookings=("IsCanceled", "count"),
        CanceledCount=("IsCanceled", "sum"),
        ConfirmedBookings=("IsCanceled", lambda x: (x == 0).sum()),
        AvgLeadTime=("LeadTime", "mean"),
        AvgADR=("ADR", "mean"),
        TotalGuests=("TotalGuests", "sum")
    ).reset_index()
    
    daily_demand["OccupancyRate"] = (daily_demand["ConfirmedBookings"] / daily_demand["TotalBookings"] * 100).round(2)
    daily_path = os.path.join(processed_dir, "daily_occupancy_forecast_data.csv")
    daily_demand.to_csv(daily_path, index=False)
    print(f"      Saved daily occupancy forecast dataset: {daily_path} ({len(daily_demand):,} rows)")
    
    # 3. Guest Preferences Data (For Model 3 - Operations Manager Intelligence)
    guest_pref = df[[
        "hotel", "Adults", "Children", "Babies", "IsFamily", "Meal",
        "Country", "MarketSegment", "ReservedRoomType", "AssignedRoomType",
        "ADR", "TotalStays", "StaysInWeekendNights", "StaysInWeekNights",
        "RequiredCarParkingSpaces", "TotalOfSpecialRequests", "CustomerType"
    ]].copy()
    guest_pref_path = os.path.join(processed_dir, "guest_preferences_data.csv")
    guest_pref.to_csv(guest_pref_path, index=False)
    print(f"      Saved guest preferences dataset: {guest_pref_path} ({len(guest_pref):,} rows)")

def run_pipeline():
    """Main execution method for data cleaning pipeline."""
    print("=" * 60)
    print("  Smart Resort 360 - Data Cleaning & Preprocessing")
    print("=" * 60)
    
    df = load_raw_datasets()
    df = clean_strings_and_nulls(df)
    df = filter_invalid_records(df)
    df = engineer_features(df)
    generate_subsets_and_save(df)
    
    print("=" * 60)
    print("  Data Cleaning & Preprocessing Completed Successfully!")
    print("=" * 60)
    return df

if __name__ == "__main__":
    run_pipeline()
