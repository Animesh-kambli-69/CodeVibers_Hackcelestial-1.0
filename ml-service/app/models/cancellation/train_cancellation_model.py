"""
Smart Resort 360 — Model 2: Cancellation Risk Classifier
Trains a Random Forest classifier on real H1.csv booking data.
Output: cancellation_model.pkl + encoders (no synthetic data used).
"""

import pandas as pd
import numpy as np
import os
import sys
import joblib
import json

from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    classification_report, roc_auc_score,
    confusion_matrix, accuracy_score
)
from sklearn.preprocessing import StandardScaler

# Allow running from ml-service root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../.."))
from app.features.feature_engineering import (
    build_encoded_features, CANCELLATION_FEATURES, CATEGORICAL_COLS
)

DATA_PATH = "data/processed/hotel_bookings_cleaned.csv"
MODEL_DIR = "app/models/cancellation"
ENCODER_DIR = os.path.join(MODEL_DIR, "encoders")


def load_and_prepare(path: str) -> pd.DataFrame:
    print("[1/5] Loading cleaned dataset...")
    df = pd.read_csv(path)
    print(f"      Loaded {len(df):,} rows.")

    # Strip whitespace from string columns
    for col in df.select_dtypes(include="object").columns:
        df[col] = df[col].astype(str).str.strip()

    # Encode categorical columns
    df = build_encoded_features(df, encoder_dir=ENCODER_DIR, fit=True)

    # Ensure all required features exist
    missing = [f for f in CANCELLATION_FEATURES if f not in df.columns]
    if missing:
        raise ValueError(f"Missing features in dataset: {missing}")

    return df


def train_cancellation_model():
    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(ENCODER_DIR, exist_ok=True)

    df = load_and_prepare(DATA_PATH)

    X = df[CANCELLATION_FEATURES]
    y = df["IsCanceled"]

    print(f"[2/5] Class distribution:")
    print(f"      Cancelled:     {y.sum():,} ({y.mean()*100:.1f}%)")
    print(f"      Not Cancelled: {(1-y).sum():,} ({(1-y.mean())*100:.1f}%)")

    # Split: 80/20 stratified
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"      Train size: {len(X_train):,} | Test size: {len(X_test):,}")

    # ─── Baseline: Logistic Regression ──────────────────────────────────────
    print("\n[3/5] Training baseline (Logistic Regression)...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    lr = LogisticRegression(max_iter=1000, random_state=42, class_weight="balanced")
    lr.fit(X_train_scaled, y_train)
    lr_preds = lr.predict(X_test_scaled)
    lr_auc = roc_auc_score(y_test, lr.predict_proba(X_test_scaled)[:, 1])
    lr_acc = accuracy_score(y_test, lr_preds)
    print(f"      Baseline AUC: {lr_auc:.4f} | Accuracy: {lr_acc:.4f}")

    # ─── Primary: Random Forest Classifier ──────────────────────────────────
    print("\n[4/5] Training primary model (Random Forest)...")
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    rf.fit(X_train, y_train)

    rf_preds = rf.predict(X_test)
    rf_proba = rf.predict_proba(X_test)[:, 1]
    rf_auc = roc_auc_score(y_test, rf_proba)
    rf_acc = accuracy_score(y_test, rf_preds)
    cm = confusion_matrix(y_test, rf_preds)

    print(f"\n      Random Forest Results:")
    print(f"      AUC:      {rf_auc:.4f}")
    print(f"      Accuracy: {rf_acc:.4f}")
    print(f"      Confusion Matrix:\n{cm}")
    print(f"\n{classification_report(y_test, rf_preds, target_names=['Not Cancelled','Cancelled'])}")

    # Feature importances
    feat_imp = pd.DataFrame({
        "feature": CANCELLATION_FEATURES,
        "importance": rf.feature_importances_
    }).sort_values("importance", ascending=False)
    print("\n      Top 10 Feature Importances:")
    print(feat_imp.head(10).to_string(index=False))

    # ─── Save Artifacts ──────────────────────────────────────────────────────
    print("\n[5/5] Saving model artifacts...")
    joblib.dump(rf, os.path.join(MODEL_DIR, "cancellation_model.pkl"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))

    metadata = {
        "model": "RandomForestClassifier",
        "version": "1.0.0",
        "features": CANCELLATION_FEATURES,
        "target": "IsCanceled",
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "roc_auc": round(rf_auc, 4),
        "accuracy": round(rf_acc, 4),
        "baseline_auc": round(lr_auc, 4),
        "feature_importances": feat_imp.head(10).set_index("feature")["importance"].round(4).to_dict(),
        "risk_thresholds": {"LOW": [0.0, 0.35], "MEDIUM": [0.35, 0.70], "HIGH": [0.70, 1.0]},
        "data_source": "H1.csv (Resort Hotel) — Real data only",
    }
    with open(os.path.join(MODEL_DIR, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"      Model saved: {MODEL_DIR}/cancellation_model.pkl")
    print(f"      Metadata saved: {MODEL_DIR}/metadata.json")
    print("\n✅  Cancellation Risk Model training complete.")
    return rf, metadata


if __name__ == "__main__":
    train_cancellation_model()
