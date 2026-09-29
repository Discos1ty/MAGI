# Destination: backend/app/main.py (replaces your current file)

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.dataset import router as dataset_router

app = FastAPI(
    title="Team-NERV API",
    description="Backend for quantum-assisted clinical decision support.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dataset_router)

try:
    from app.api.training import router as training_router

    app.include_router(training_router)
except ImportError as e:
    print(
        "Training endpoints are unavailable: "
        f"{e}. Add the missing app.models/app.core/model_engine "
        "modules to enable POST /api/training/run."
    )

try:
    from app.api.prediction import router as prediction_router

    app.include_router(prediction_router)
except ImportError as e:
    print(
        "Prediction endpoints are unavailable: "
        f"{e}. Install pennylane and xgboost "
        "(see requirements.txt) to enable POST /api/predict/."
    )

# React production build
PROJECT_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_DIST = PROJECT_ROOT / "dist"

if FRONTEND_DIST.exists():
    app.mount(
        "/assets",
        StaticFiles(directory=FRONTEND_DIST / "assets"),
        name="assets",
    )

@app.get("/")
async def root():
    if FRONTEND_DIST.exists():
        return FileResponse(FRONTEND_DIST / "index.html")

    return {"status": "ok", "service": "Team-NERV API"}

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    requested_file = FRONTEND_DIST / full_path

    if requested_file.is_file():
        return FileResponse(requested_file)

    if FRONTEND_DIST.exists():
        return FileResponse(FRONTEND_DIST / "index.html")

    return {"detail": "Not Found"}