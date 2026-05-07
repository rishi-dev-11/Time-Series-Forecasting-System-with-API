from __future__ import annotations

import argparse
import json
import time
# from dataclasses import dataclass
from forecasting_service.schemas import StateModelBundle
from pathlib import Path

import joblib
import pandas as pd
import logging



from forecasting_service.config import (
    ARTIFACT_DIR,
    CSV_PATH,
    FORECAST_HORIZON_WEEKS,
    MODEL_REGISTRY_PATH,
    VALIDATION_WEEKS,
)
from forecasting_service.data import load_sales_data, train_validation_split
from forecasting_service.metrics import regression_metrics
from forecasting_service.models.forecasters import BaseForecaster, LstmForecaster, candidate_models

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger(__name__)

# @dataclass
# class StateModelBundle:
#     state: str
#     best_model_name: str
#     best_model: BaseForecaster
#     metrics: dict[str, dict[str, float]]
#     failures: dict[str, str]
#     last_history: pd.DataFrame
#     forecast: pd.DataFrame


def evaluate_model(
    model: BaseForecaster,
    train_df: pd.DataFrame,
    validation_df: pd.DataFrame,
) -> tuple[BaseForecaster, dict[str, float], pd.DataFrame]:
    model.fit(train_df)
    pred = model.predict(train_df, horizon=len(validation_df)).to_frame()
    metrics = regression_metrics(validation_df["sales"], pred["prediction"])
    return model, metrics, pred

def rolling_validation_score(
    model: BaseForecaster,
    state_df: pd.DataFrame,
    validation_weeks: int = VALIDATION_WEEKS,
    folds: int = 3,
) -> tuple[dict[str, float], BaseForecaster]:

    metrics_list = []

    total_length = len(state_df)

    for fold in range(folds):

        split_point = total_length - validation_weeks * (fold + 1)

        train_df = state_df.iloc[:split_point].copy()

        valid_df = state_df.iloc[
            split_point : split_point + validation_weeks
        ].copy()

        if len(train_df) < 40:
            continue

        logger.info(
            f"Rolling Fold {fold + 1} | "
            f"Train={len(train_df)} | "
            f"Validation={len(valid_df)}"
        )

        fitted_model, metrics, _ = evaluate_model(
            model,
            train_df,
            valid_df,
        )

        metrics_list.append(metrics)

    if not metrics_list:
        raise ValueError("No valid rolling folds created")

    averaged = {
        "mae": float(
            sum(m["mae"] for m in metrics_list) / len(metrics_list)
        ),
        "rmse": float(
            sum(m["rmse"] for m in metrics_list) / len(metrics_list)
        ),
        "mape": float(
            sum(m["mape"] for m in metrics_list) / len(metrics_list)
        ),
    }

    model.fit(state_df)

    return averaged, model

def train_for_state(
    state: str,
    state_df: pd.DataFrame,
    lstm_epochs: int,
    artifact_dir: Path,
) -> StateModelBundle:
    train_df, validation_df = train_validation_split(state_df, VALIDATION_WEEKS)
    scores: dict[str, dict[str, float]] = {}
    fitted: dict[str, BaseForecaster] = {}
    failures: dict[str, str] = {}

    for model in candidate_models(lstm_epochs=lstm_epochs):
        logger.info(f"Training model: {model.name} for state: {state}")
        started = time.time()
        try:
            # fitted_model, metrics, _ = evaluate_model(model, train_df, validation_df)
            metrics, fitted_model = rolling_validation_score(model,state_df,)
            metrics["fit_seconds"] = round(time.time() - started, 2)
            scores[model.name] = metrics
            fitted[model.name] = fitted_model
        except Exception as exc:
            logger.exception(
                f"Model failed: {model.name} | State: {state}"
            )
            failures[model.name] = f"{type(exc).__name__}: {exc}"

    if not scores:
        raise RuntimeError(f"No model trained successfully for {state}: {failures}")

    best_name = min(scores, key=lambda name: scores[name]["rmse"])
    best_model = fitted[best_name]
    logger.info(
        f"Best model for {state}: {best_name} | RMSE={scores[best_name]['rmse']:.2f}"
    )

    best_model.fit(state_df)
    if isinstance(best_model, LstmForecaster):
        model_path = artifact_dir / f"lstm_{state.replace(' ', '_')}.keras"
        best_model.save_keras_model(model_path)

    forecast = best_model.predict(state_df, FORECAST_HORIZON_WEEKS).to_frame()
    forecast["state"] = state
    forecast["model"] = best_name

    return StateModelBundle(
        state=state,
        best_model_name=best_name,
        best_model=best_model,
        metrics=scores,
        failures=failures,
        last_history=state_df.copy(),
        forecast=forecast,
    )


def train_all(
    data_path: Path = CSV_PATH,
    artifact_dir: Path = ARTIFACT_DIR,
    states: list[str] | None = None,
    lstm_epochs: int = 30,
) -> dict[str, StateModelBundle]:
    artifact_dir.mkdir(parents=True, exist_ok=True)
    data = load_sales_data(data_path)
    selected_states = sorted(states or data["state"].unique().tolist())
    registry: dict[str, StateModelBundle] = {}
    for state in selected_states:
        state_df = data[data["state"] == state].sort_values("date").reset_index(drop=True)
        # print(f"Training {state} ({len(state_df)} weekly rows)")
        logger.info(f"Training {state} ({len(state_df)} weekly rows)")
        registry[state] = train_for_state(state, state_df, lstm_epochs, artifact_dir)

    joblib.dump(registry, MODEL_REGISTRY_PATH)
    write_training_report(registry, artifact_dir / "training_report.json")
    return registry


def write_training_report(registry: dict[str, StateModelBundle], path: Path) -> None:
    report = {
        state: {
            "best_model": bundle.best_model_name,
            "metrics": bundle.metrics,
            "failures": bundle.failures,
            "forecast": [
                {
                    "date": row.date.strftime("%Y-%m-%d"),
                    "prediction": float(row.prediction),
                }
                for row in bundle.forecast.itertuples()
            ],
        }
        for state, bundle in registry.items()
    }
    path.write_text(json.dumps(report, indent=2), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train state-level sales forecasting models.")
    parser.add_argument("--data-path", type=Path, default=CSV_PATH)
    parser.add_argument("--states", nargs="*", help="Optional subset of states for a quick run.")
    parser.add_argument("--lstm-epochs", type=int, default=30)
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    train_all(args.data_path, states=args.states, lstm_epochs=args.lstm_epochs)
