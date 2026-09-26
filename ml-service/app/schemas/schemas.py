"""
Smart Resort 360 — Pydantic Schemas for FastAPI ML Service
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict


# ─── Cancellation Risk ────────────────────────────────────────────────────────

class CancellationRequest(BaseModel):
    lead_time: int = Field(..., ge=0, description="Days between booking and arrival")
    adults: int = Field(1, ge=0)
    children: int = Field(0, ge=0)
    babies: int = Field(0, ge=0)
    stays_in_weekend_nights: int = Field(0, ge=0)
    stays_in_week_nights: int = Field(1, ge=0)
    previous_cancellations: int = Field(0, ge=0)
    previous_bookings_not_canceled: int = Field(0, ge=0)
    booking_changes: int = Field(0, ge=0)
    required_car_parking_spaces: int = Field(0, ge=0)
    total_of_special_requests: int = Field(0, ge=0)
    adr: float = Field(..., ge=0)
    is_repeated_guest: int = Field(0, ge=0, le=1)
    room_type_changed: int = Field(0, ge=0, le=1)
    meal: str = Field("BB", description="BB, HB, FB, SC, Undefined")
    country: str = Field("PRT")
    market_segment: str = Field("Online TA")
    distribution_channel: str = Field("TA/TO")
    deposit_type: str = Field("No Deposit")
    customer_type: str = Field("Transient")
    reserved_room_type: str = Field("A")
    arrival_date_month: str = Field("July")


class CancellationResponse(BaseModel):
    cancellation_probability: float
    risk_level: str  # LOW | MEDIUM | HIGH
    risk_score_pct: float
    top_risk_factors: List[Dict]


# ─── Occupancy Forecast ───────────────────────────────────────────────────────

class OccupancyRequest(BaseModel):
    date: str = Field(..., description="Target date YYYY-MM-DD")


class OccupancyDayPrediction(BaseModel):
    date: str
    predicted_confirmed_bookings: float
    predicted_occupancy_rate: float
    demand_level: str  # LOW | MEDIUM | HIGH
    day_of_week: str


class OccupancyForecastResponse(BaseModel):
    forecast_days: int
    predictions: List[OccupancyDayPrediction]
    summary: Dict


# ─── Guest Preference ─────────────────────────────────────────────────────────

class GuestPreferenceRequest(BaseModel):
    adults: int = Field(2, ge=1)
    children: int = Field(0, ge=0)
    babies: int = Field(0, ge=0)
    total_stays: int = Field(2, ge=0)
    stays_in_weekend_nights: int = Field(1, ge=0)
    stays_in_week_nights: int = Field(1, ge=0)
    adr: float = Field(100.0, ge=0)
    total_of_special_requests: int = Field(0, ge=0)
    required_car_parking_spaces: int = Field(0, ge=0)
    country: str = Field("PRT")
    market_segment: str = Field("Online TA")
    customer_type: str = Field("Transient")


class GuestPreferenceResponse(BaseModel):
    predicted_meal_plan: str
    predicted_room_type: str
    meal_confidence: float
    room_confidence: float
    is_family: bool
    personalization_tags: List[str]
