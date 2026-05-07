from __future__ import annotations

from typing import Any
import logging

import joblib
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

from forecasting_service.config import FORECAST_HORIZON_WEEKS, MODEL_REGISTRY_PATH
from forecasting_service.schemas import StateModelBundle  # noqa: F401 - needed for unpickling
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger(__name__)




class ForecastPoint(BaseModel):
    date: str
    prediction: float
    lower_bound: float
    upper_bound: float


class ForecastResponse(BaseModel):
    state: str
    model: str
    horizon_weeks: int
    forecast: list[ForecastPoint]

class ModelMetric(BaseModel):
    mae: float
    rmse: float
    mape: float
    fit_seconds: float | None = None 

class StateSummary(BaseModel):
    state: str
    best_model: str
    # metrics: dict[str, dict[str, float]]
    metrics: dict[str, ModelMetric]
    failures: dict[str, str]
 


app = FastAPI(
    title="State Sales Forecasting API",
    version="1.0.0",
    description="Forecast next 8 weeks of weekly sales for each state.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _load_registry() -> dict[str, Any]:
    if not MODEL_REGISTRY_PATH.exists():
        raise HTTPException(
            status_code=503,
            detail="Model registry not found. Run `python -m forecasting_service.train` first.",
        )
    return joblib.load(MODEL_REGISTRY_PATH)


@app.get("/health")
def health() -> dict[str, str]:
    logger.info("Health endpoint called")
    return {"status": "ok"}


@app.get("/states", response_model=list[str])
def states() -> list[str]:
    logger.info("States endpoint called")
    return sorted(_load_registry().keys())


@app.get("/models/summary", response_model=list[StateSummary])
def model_summary() -> list[StateSummary]:
    registry = _load_registry()
    logger.info("Model summary endpoint called")
    return [
        StateSummary(
            state=state,
            best_model=bundle.best_model_name,
            # metrics=bundle.metrics,
            metrics=dict(
                sorted(
                    bundle.metrics.items(),
                    key=lambda item: item[1]["rmse"]
                )
            ),
            failures=bundle.failures,
        )
        for state, bundle in sorted(registry.items())
    ]


@app.get("/forecast/{state}", response_model=ForecastResponse)
def forecast(
    state: str,
    horizon_weeks: int = Query(FORECAST_HORIZON_WEEKS, ge=1, le=26),
) -> ForecastResponse:
    registry = _load_registry()
    matches = {name.lower(): name for name in registry}
    state_key = matches.get(state.lower())
    if state_key is None:
        logger.error(f"Invalid state requested: {state}")
        raise HTTPException(status_code=404, detail=f"State not found: {state}")
    logger.info(
        f"Forecast requested | State={state_key} | Horizon={horizon_weeks}")
    bundle = registry[state_key]
    pred = bundle.best_model.predict(bundle.last_history, horizon_weeks).to_frame()
    return ForecastResponse(
        state=state_key,
        model=bundle.best_model_name,
        horizon_weeks=horizon_weeks,
        forecast=[
            ForecastPoint(date=row.date.strftime("%Y-%m-%d"), prediction=float(row.prediction), lower_bound=0.9, upper_bound=float(row.prediction * 1.1))
            for row in pred.itertuples()
        ],
    )
