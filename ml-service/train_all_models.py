"""
Smart Resort 360 -- Master Training Pipeline
Trains all 3 ML models sequentially from real H1.csv data.
Run from ml-service/ root: python train_all_models.py
"""

import os
import sys
import time

sys.path.insert(0, os.path.dirname(__file__))

def run_all():
    start = time.time()
    print("=" * 65)
    print("  Smart Resort 360 -- Training All ML Models")
    print("  Data Source: H1.csv (Resort Hotel) -- Real data only")
    print("=" * 65)

    # -- Model 2: Cancellation Risk
    print("\n\n[MODEL 2] Cancellation Risk Classifier")
    print("-" * 65)
    from app.models.cancellation.train_cancellation_model import train_cancellation_model
    _, meta2 = train_cancellation_model()

    # -- Model 1: Occupancy Forecast
    print("\n\n[MODEL 1] Occupancy & Booking Demand Forecast")
    print("-" * 65)
    from app.models.occupancy.train_occupancy_model import train_occupancy_model
    _, _, meta1 = train_occupancy_model()

    # -- Model 3: Guest Preference
    print("\n\n[MODEL 3] Guest Preference Predictor")
    print("-" * 65)
    from app.models.guest_preferences.train_guest_preference_model import train_guest_preference_model
    _, meta3 = train_guest_preference_model()

    elapsed = time.time() - start
    print("\n" + "=" * 65)
    print("  ALL MODELS TRAINED SUCCESSFULLY")
    print(f"  Total time: {elapsed:.1f}s")
    print("=" * 65)
    print("\nSummary:")
    print(f"  Cancellation Risk  --> AUC:      {meta2['roc_auc']}")
    print(f"  Occupancy Forecast --> R2:        {meta1['metrics']['confirmed_bookings']['R2']}")
    print(f"  Guest Preferences  --> Meal Acc.: {list(meta3['accuracy_per_target'].values())[0]}")
    print("\nStart FastAPI service with:")
    print("   uvicorn app.main:app --reload --port 8000")


if __name__ == "__main__":
    run_all()
