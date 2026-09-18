# Destination: backend/app/main.py (replaces your current file)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


@app.get("/")
async def root():
    return {"status": "ok", "service": "Team-NERV API"}