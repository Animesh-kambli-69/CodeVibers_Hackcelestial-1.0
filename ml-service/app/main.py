"""
Smart Resort 360 — FastAPI Application Entry Point
ML Inference Service — Port 8000
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.ml_routes import router
from app.services.ml_inference import ml_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML models once at startup."""
    print("🚀 Smart Resort 360 ML Service starting...")
    try:
        ml_service.load_models()
    except Exception as e:
        print(f"⚠️  Model loading failed: {e}")
        print("    Run 'python train_all_models.py' first to train and save models.")
    yield
    print("🛑 ML Service shutting down.")


app = FastAPI(
    title="Smart Resort 360 — ML Service",
    description=(
        "AI-powered ML inference API for booking demand forecasting, "
        "cancellation risk scoring, and guest preference prediction. "
        "All models trained on real H1.csv Resort Hotel data."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow Node.js backend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1/ml")


@app.get("/")
def root():
    return {
        "service": "Smart Resort 360 ML Service",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/ml/health",
        "endpoints": {
            "cancellation_risk": "POST /api/v1/ml/predict/cancellation",
            "occupancy_forecast": "GET  /api/v1/ml/predict/occupancy?days=30",
            "guest_preferences": "POST /api/v1/ml/predict/guest-preferences",
            "data_summary": "GET  /api/v1/ml/data/summary",
        },
    }
