"""
Smart Resort 360 — Model 3: Guest Preference Predictor
Trains MultiOutput XGBoost classifiers for Meal Plan and Room Type prediction.
Operates purely on real H1.csv data via guest_preferences_data.csv.
"""

import pandas as pd
import numpy as np
import os
import sys
import joblib
import json

from xgboost import XGBClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.neighbors import KNeighborsClassifier

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../.."))
from app.features.feature_engineering import (
    build_encoded_features, GUEST_PREF_FEATURES, GUEST_PREF_TARGETS
)

DATA_PATH = "data/processed/guest_preferences_data.csv"
MODEL_DIR = "app/models/guest_preferences"
ENCODER_DIR = os.path.join(MODEL_DIR, "encoders")

CATEGORICAL_COLS_PREF = [
    "Meal", "Country", "MarketSegment", "CustomerType", "ReservedRoomType"
]


def load_and_prepare(path: str) -> pd.DataFrame:
    print("[1/5] Loading guest preferences dataset...")
    df = pd.read_csv(path)
    print(f"      Loaded {len(df):,} rows.")

    for col in df.select_dtypes(include="object").columns:
        df[col] = df[col].astype(str).str.strip()

    # Encode categorical columns
    os.makedirs(ENCODER_DIR, exist_ok=True)
    from sklearn.preprocessing import LabelEncoder
    for col in CATEGORICAL_COLS_PREF:
        if col in df.columns:
            le = LabelEncoder()
            df[f"{col}_enc"] = le.fit_transform(df[col].astype(str).str.strip())
            joblib.dump(le, os.path.join(ENCODER_DIR, f"{col}_encoder.pkl"))

    return df


def train_guest_preference_model():
    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(ENCODER_DIR, exist_ok=True)

    df = load_and_prepare(DATA_PATH)

    # Verify all features/targets exist
    available_features = [f for f in GUEST_PREF_FEATURES if f in df.columns]
    available_targets = [t for t in GUEST_PREF_TARGETS if t in df.columns]

    print(f"[2/5] Features used ({len(available_features)}): {available_features}")
    print(f"      Targets: {available_targets}")

    X = df[available_features].fillna(0)
    y = df[available_targets]

    # Drop rows with NaN targets
    mask = y.notna().all(axis=1)
    X, y = X[mask], y[mask]
    print(f"      Clean rows for training: {len(X):,}")

    # Print class distributions
    for t in available_targets:
        print(f"\n      {t} distribution (top 5):")
        print(y[t].value_counts().head(5).to_string())

    # Split 80/20 stratified on primary target
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42,
        stratify=y[available_targets[0]] if len(available_targets) > 0 else None
    )
    print(f"\n      Train: {len(X_train):,} | Test: {len(X_test):,}")

    # ─── Baseline: KNN ───────────────────────────────────────────────────────
    print("\n[3/5] Training baseline (KNN)...")
    knn = MultiOutputClassifier(KNeighborsClassifier(n_neighbors=5, n_jobs=-1))
    knn.fit(X_train, y_train)
    knn_preds = knn.predict(X_test)
    for i, t in enumerate(available_targets):
        acc = accuracy_score(y_test[t], knn_preds[:, i])
        print(f"      KNN Accuracy [{t}]: {acc:.4f}")

    # ─── Primary: MultiOutput XGBoost ────────────────────────────────────────
    print("\n[4/5] Training MultiOutput XGBoost...")
    base_xgb = XGBClassifier(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        use_label_encoder=False,
        eval_metric="mlogloss",
        random_state=42,
        n_jobs=-1,
        verbosity=0,
    )
    model = MultiOutputClassifier(base_xgb)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    results = {}
    for i, t in enumerate(available_targets):
        acc = accuracy_score(y_test[t], preds[:, i])
        results[t] = round(acc, 4)
        print(f"      XGBoost Accuracy [{t}]: {acc:.4f}")
        print(classification_report(y_test[t], preds[:, i], zero_division=0))

    # ─── Save Artifacts ──────────────────────────────────────────────────────
    print("\n[5/5] Saving model artifacts...")
    joblib.dump(model, os.path.join(MODEL_DIR, "guest_preference_model.pkl"))
    joblib.dump(available_features, os.path.join(MODEL_DIR, "feature_list.pkl"))
    joblib.dump(available_targets, os.path.join(MODEL_DIR, "target_list.pkl"))

    metadata = {
        "model": "MultiOutputClassifier(XGBClassifier)",
        "version": "1.0.0",
        "features": available_features,
        "targets": available_targets,
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "accuracy_per_target": results,
        "data_source": "H1.csv (Resort Hotel) — Real data only",
    }
    with open(os.path.join(MODEL_DIR, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"      Model saved: {MODEL_DIR}/guest_preference_model.pkl")
    print("\n✅  Guest Preference Model training complete.")
    return model, metadata


if __name__ == "__main__":
    train_guest_preference_model()
