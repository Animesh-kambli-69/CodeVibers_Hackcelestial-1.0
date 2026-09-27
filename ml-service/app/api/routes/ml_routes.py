"""
Smart Resort 360 — FastAPI ML Service Routes
"""
from fastapi import APIRouter, HTTPException, Query
from app.schemas.schemas import (
    CancellationRequest, CancellationResponse,
    OccupancyForecastResponse, OccupancyDayPrediction,
    GuestPreferenceRequest, GuestPreferenceResponse,
)
from app.services.ml_inference import ml_service

router = APIRouter()


# ─── Health Check ─────────────────────────────────────────────────────────────

@router.get("/health")
def health():
    return {"status": "ok", "service": "Smart Resort 360 ML Service", "models_loaded": ml_service._loaded}


# ─── Model 2: Cancellation Risk ───────────────────────────────────────────────

@router.post("/predict/cancellation", response_model=CancellationResponse, tags=["Cancellation"])
def predict_cancellation(req: CancellationRequest):
    """
    Predict the cancellation risk for a guest booking.
    Returns probability (0-1), risk level (LOW/MEDIUM/HIGH), and top risk factors.
    """
    if not ml_service._loaded:
        raise HTTPException(status_code=503, detail="Models not loaded yet. Run train_all_models.py first.")
    try:
        result = ml_service.predict_cancellation(req)
        return CancellationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Model 1: Occupancy Forecast ──────────────────────────────────────────────

@router.get("/predict/occupancy", response_model=OccupancyForecastResponse, tags=["Occupancy"])
def predict_occupancy(
    days: int = Query(default=30, ge=1, le=90, description="Forecast horizon (1-90 days)"),
    start_date: str = Query(default=None, description="YYYY-MM-DD; forecast starts the day AFTER this date. Defaults to the day after the training data ends."),
):
    """
    Forecast daily occupancy rate and confirmed bookings for the next N days.
    Based on real historical H1 Resort Hotel data — no synthetic data.
    """
    if not ml_service._loaded:
        raise HTTPException(status_code=503, detail="Models not loaded yet. Run train_all_models.py first.")
    try:
        result = ml_service.predict_occupancy_forecast(days=days, start_date=start_date)
        predictions = [OccupancyDayPrediction(**p) for p in result["predictions"]]
        return OccupancyForecastResponse(
            forecast_days=result["forecast_days"],
            predictions=predictions,
            summary=result["summary"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Model 3: Guest Preference Prediction ────────────────────────────────────

@router.post("/predict/guest-preferences", response_model=GuestPreferenceResponse, tags=["Guest Preferences"])
def predict_guest_preferences(req: GuestPreferenceRequest):
    """
    Predict guest meal plan and room type preferences based on booking profile.
    Also returns personalization tags for operations teams.
    """
    if not ml_service._loaded:
        raise HTTPException(status_code=503, detail="Models not loaded yet. Run train_all_models.py first.")
    try:
        result = ml_service.predict_guest_preferences(req)
        return GuestPreferenceResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Dataset Summary ─────────────────────────────────────────────────────────

@router.get("/data/summary", tags=["Data"])
def get_data_summary():
    """Returns summary statistics about the training dataset (resort-level only)."""
    import json, os
    summaries = {}
    for model_dir in ["cancellation", "occupancy", "guest_preferences"]:
        meta_path = f"app/models/{model_dir}/metadata.json"
        if os.path.exists(meta_path):
            with open(meta_path) as f:
                summaries[model_dir] = json.load(f)
    return {"models": summaries, "data_source": "H1.csv — Smart Resort 360 (Resort Hotel)"}
