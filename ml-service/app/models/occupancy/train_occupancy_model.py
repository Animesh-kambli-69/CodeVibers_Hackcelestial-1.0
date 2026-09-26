"""
Smart Resort 360 — Model 1: Occupancy & Booking Demand Forecast
Trains an XGBoost Regressor on real daily aggregated data from H1.csv.
Output: occupancy_model.pkl (no synthetic data used).
"""

import pandas as pd
import numpy as np
import os
import sys
import joblib
import json

from xgboost import XGBRegressor
from sklearn.linear_model import Ridge
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../.."))
from app.features.feature_engineering import build_occupancy_features, OCCUPANCY_FEATURES

DATA_PATH = "data/processed/daily_occupancy_forecast_data.csv"
MODEL_DIR = "app/models/occupancy"


def load_and_prepare(path: str) -> pd.DataFrame:
    print("[1/5] Loading daily occupancy dataset...")
    df = pd.read_csv(path)
    print(f"      Loaded {len(df):,} rows (days).")

    df = build_occupancy_features(df)
    print(f"      After lag feature engineering: {len(df):,} usable rows.")
    return df


def train_occupancy_model():
    os.makedirs(MODEL_DIR, exist_ok=True)

    df = load_and_prepare(DATA_PATH)

    TARGET_CONF = "ConfirmedBookings"
    TARGET_OCC = "OccupancyRate"

    X = df[OCCUPANCY_FEATURES]
    y_conf = df[TARGET_CONF]
    y_occ = df[TARGET_OCC]

    # ─── Time-Series Split (no data leakage) ─────────────────────────────────
    split_idx = int(len(df) * 0.80)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_conf_train, y_conf_test = y_conf.iloc[:split_idx], y_conf.iloc[split_idx:]
    y_occ_train, y_occ_test = y_occ.iloc[:split_idx], y_occ.iloc[split_idx:]

    print(f"[2/5] Train days: {len(X_train)} | Test days: {len(X_test)}")

    # ─── Baseline: Ridge Regression ──────────────────────────────────────────
    print("\n[3/5] Training baseline (Ridge Regression)...")
    ridge = Ridge(alpha=1.0)
    ridge.fit(X_train, y_conf_train)
    ridge_preds = ridge.predict(X_test)
    ridge_mae = mean_absolute_error(y_conf_test, ridge_preds)
    ridge_rmse = np.sqrt(mean_squared_error(y_conf_test, ridge_preds))
    print(f"      Baseline MAE: {ridge_mae:.3f} | RMSE: {ridge_rmse:.3f}")

    # ─── Primary: XGBoost Regressor ──────────────────────────────────────────
    print("\n[4/5] Training XGBoost Regressor (ConfirmedBookings target)...")
    xgb_conf = XGBRegressor(
        n_estimators=500,
        max_depth=3,
        learning_rate=0.01,
        subsample=0.7,
        colsample_bytree=0.7,
        min_child_weight=5,
        gamma=0.1,
        reg_alpha=0.5,
        reg_lambda=1.0,
        random_state=42,
        verbosity=0,
    )
    xgb_conf.fit(
        X_train, y_conf_train,
        eval_set=[(X_test, y_conf_test)],
        verbose=False,
    )
    conf_preds = xgb_conf.predict(X_test)

    mae_conf = mean_absolute_error(y_conf_test, conf_preds)
    rmse_conf = np.sqrt(mean_squared_error(y_conf_test, conf_preds))
    r2_conf = r2_score(y_conf_test, conf_preds)
    print(f"      Confirmed Bookings → MAE: {mae_conf:.3f} | RMSE: {rmse_conf:.3f} | R²: {r2_conf:.4f}")

    print("\n      Training XGBoost Regressor (OccupancyRate target)...")
    xgb_occ = XGBRegressor(
        n_estimators=500,
        max_depth=3,
        learning_rate=0.01,
        subsample=0.7,
        colsample_bytree=0.7,
        min_child_weight=5,
        gamma=0.1,
        reg_alpha=0.5,
        reg_lambda=1.0,
        random_state=42,
        verbosity=0,
    )
    xgb_occ.fit(
        X_train, y_occ_train,
        eval_set=[(X_test, y_occ_test)],
        verbose=False,
    )
    occ_preds = xgb_occ.predict(X_test)
    mae_occ = mean_absolute_error(y_occ_test, occ_preds)
    r2_occ = r2_score(y_occ_test, occ_preds)
    print(f"      Occupancy Rate    → MAE: {mae_occ:.3f} | R²: {r2_occ:.4f}")

    # Feature importances
    feat_imp = pd.DataFrame({
        "feature": OCCUPANCY_FEATURES,
        "importance": xgb_conf.feature_importances_
    }).sort_values("importance", ascending=False)
    print("\n      Feature Importances:")
    print(feat_imp.to_string(index=False))

    # ─── Save Artifacts ──────────────────────────────────────────────────────
    print("\n[5/5] Saving model artifacts...")
    joblib.dump(xgb_conf, os.path.join(MODEL_DIR, "occupancy_bookings_model.pkl"))
    joblib.dump(xgb_occ, os.path.join(MODEL_DIR, "occupancy_rate_model.pkl"))

    metadata = {
        "model": "XGBRegressor",
        "version": "1.0.0",
        "features": OCCUPANCY_FEATURES,
        "targets": {
            "primary": "ConfirmedBookings",
            "secondary": "OccupancyRate"
        },
        "train_days": len(X_train),
        "test_days": len(X_test),
        "metrics": {
            "confirmed_bookings": {"MAE": round(mae_conf, 3), "RMSE": round(rmse_conf, 3), "R2": round(r2_conf, 4)},
            "occupancy_rate": {"MAE": round(mae_occ, 3), "R2": round(r2_occ, 4)},
        },
        "baseline": {"Ridge MAE": round(ridge_mae, 3), "Ridge RMSE": round(ridge_rmse, 3)},
        "feature_importances": feat_imp.set_index("feature")["importance"].round(4).to_dict(),
        "data_source": "H1.csv (Resort Hotel) — Real data only",
    }
    with open(os.path.join(MODEL_DIR, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"      Models saved: {MODEL_DIR}/")
    print("\n✅  Occupancy & Demand Forecast Model training complete.")
    return xgb_conf, xgb_occ, metadata


if __name__ == "__main__":
    train_occupancy_model()
